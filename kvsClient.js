import { KinesisVideoClient, DescribeSignalingChannelCommand, GetSignalingChannelEndpointCommand } from "@aws-sdk/client-kinesis-video"
import { KinesisVideoSignalingClient, GetIceServerConfigCommand } from "@aws-sdk/client-kinesis-video-signaling"
import { Role, SignalingClient, SigV4RequestSigner } from 'amazon-kinesis-video-streams-webrtc'

/**
    Uses APIs from the [AWS SDK for JavaScript V3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-kinesis-video/index.html) 
    as well as from the [Amazon Kinesis Video Streams WebRTC SDK for JavaScript](https://github.com/awslabs/amazon-kinesis-video-streams-webrtc-sdk-js), however 
    only uses the sigV4RequestSigner class from the WebRTC SDK so that the websocket connection can be tested outside of this SDK. 
 */

export class KvsClient {

    constructor(region, credentials){
        this.region = region
        this.credentials = credentials 
        this.stunServer = `stun:stun.kinesisvideo.${region}.amazonaws.com:443`

        this.kinesisVideoClient = new KinesisVideoClient()
        this.sigV4RequestSigner = new SigV4RequestSigner(region, credentials)
    }

    async getSignalingChannelARN(channelName){
        let start = new Date()
        const describeSignalingChannelResponse = await this.kinesisVideoClient.send(new DescribeSignalingChannelCommand({ ChannelName: channelName }))
        let end = new Date()

        const channelARN = describeSignalingChannelResponse.ChannelInfo.ChannelARN
        console.log(`Signaling Channel ARN: ${channelARN} returned in ${Math. abs(start - end) / 1000} seconds`)

        return channelARN
    }

    async getSignalingChannelEndpoints(channelARN){
        const getSignalingChannelEndpointCommand = new GetSignalingChannelEndpointCommand({ ChannelARN: channelARN,  SingleMasterChannelEndpointConfiguration: {Protocols: ['WSS', 'HTTPS'], Role: 'MASTER'}})

        let start = new Date()
        const getSignalingChannelEndpointResponse = await this.kinesisVideoClient.send(getSignalingChannelEndpointCommand)
        let end = new Date() 

        const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint) => {
            endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint
            return endpoints
        }, {})

        console.log('KVS Signaling Channel Endpoints: ' +  JSON.stringify(endpointsByProtocol, null, 2) + ` returned in ${Math. abs(start - end) / 1000} seconds`)

        return endpointsByProtocol
    }

    getIceServersStunOnly(){
        const iceServers = []
        iceServers.push({ urls: this.stunServer });
        return iceServers;
    }

    async getFullIceServerList(channelARN, endpoints){
        const kvsSignalingClient = new KinesisVideoSignalingClient({ endpoint: endpoints.HTTPS })

        let start = new Date()
        const getIceServerConfigResponse = await kvsSignalingClient.send(new GetIceServerConfigCommand({ ChannelARN: channelARN }))
        let end = new Date() 

        const iceServers = this.getIceServersStunOnly()
        
        getIceServerConfigResponse.IceServerList.forEach(iceServer =>
            iceServers.push({
                urls: iceServer.Uris,
                username: iceServer.Username,
                credential: iceServer.Password,
            }),
        )
        console.log('ICE servers: ' + JSON.stringify(iceServers, null, 2) + ` returned in ${Math. abs(start - end) / 1000} seconds`)

        return iceServers
    }

    newOffer(obj){
        let payload = JSON.stringify(obj)
        payload = Buffer.from(payload).toString('base64')

        // recipientClientId: 'MASTER',
        const offer = {
            action: 'SDP_OFFER',              
            messagePayload: payload 
        }

        return offer
    }

    async getSignedSignalingChannelEndpoint(channelARN, endpoints, clientId){
        const queryParams = {
            'X-Amz-ChannelARN': channelARN,            
        }

        if(clientId !== 'master'){
            queryParams['X-Amz-ClientId'] = clientId
        }

        const signedURL = await this.sigV4RequestSigner.getSignedURL(endpoints.WSS, queryParams, new Date())

        console.log(`WSS endpoint: ${signedURL}`)

        return signedURL

    }

}