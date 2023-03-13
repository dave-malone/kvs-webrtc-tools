import { KvsClient } from './kvsClient.js'
import { WebsocketClient } from './websocketClient.js'
import { WebRtcClient } from './webRtcClient.js'

/*
    https://docs.aws.amazon.com/kinesisvideostreams-webrtc-dg/latest/devguide/kvswebrtc-websocket-apis3.html
    TODO - gather ice candidates https://github.com/webrtc/samples/blob/gh-pages/src/content/peerconnection/trickle-ice/js/main.js
    TODO send offer, send answer, add timing 
    TODO - add speed test to websocket 
    TODO use getStats reports to evaluate network conditions https://catalog.us-east-1.prod.workshops.aws/kinesis-video-streams/en-US/13-webrtc-troubleshooting
*/

const region = process.env.AWS_REGION || 'us-east-1'
const credentials = { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY  }
let channelName = 'kvs-days'

const kvsClient = new KvsClient(region, credentials)

const channelARN = await kvsClient.getSignalingChannelARN(channelName)
const signalingChannelEndpoints = await kvsClient.getSignalingChannelEndpoints(channelARN)
const fullIceServerList = await kvsClient.getFullIceServerList(channelARN, signalingChannelEndpoints)
const masterWssEndpoint = await kvsClient.getSignedSignalingChannelEndpoint(channelARN, signalingChannelEndpoints, 'master')

const webRtcClient = new WebRtcClient()
await webRtcClient.testStunRequest(region)

const masterWebsocketClient = new WebsocketClient(masterWssEndpoint, 'master')
const secondsToStayConnected = 5
console.log(`remaining connected to websocket for ${secondsToStayConnected} seconds to verify connection stability`)
await new Promise(r => setTimeout(r, secondsToStayConnected * 1000))

const viewerWssEndpoint = await kvsClient.getSignedSignalingChannelEndpoint(channelARN, signalingChannelEndpoints, 'viewer')
const viewerWebsocketClient = new WebsocketClient(viewerWssEndpoint, 'viewer')
await new Promise(r => setTimeout(r, secondsToStayConnected * 1000))

for(let i = 0; i < 3; i++){
    const sdpOffer = kvsClient.newOffer({ message: 'testing round trip time (rtt)', date: Date.now() })
    viewerWebsocketClient.sendAsJson(sdpOffer)
    await new Promise(r => setTimeout(r, 1000))
}

await new Promise(r => setTimeout(r, 10 * 1000))

viewerWebsocketClient.close()
masterWebsocketClient.close()






