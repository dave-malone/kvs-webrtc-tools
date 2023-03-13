import * as stun from 'stun'

export class WebRtcClient {

    constructor(){}

    async testStunRequest(region){
        const stunServer = `stun.kinesisvideo.${region}.amazonaws.com:443`
        console.log(`getting your ip addresses from stun server ${stunServer}`)
        
        const begin = Date.now()
        
        const options = { timeout: 2500, retries: 2 };
        const response = await stun.request(stunServer, options)
        
        const elapsed = ((Date.now() - begin) / 1000).toFixed(3)
        
        console.log('stun server response: ', response.getXorAddress())
        console.log(`stun server response time: ${elapsed} seconds`)
    }

    async testGatherIceCandidates(iceServers){
        // const begin = Date.now()

        // const config = {
        //     iceServers,
        //     iceTransportPolicy: forceTurn ? 'relay': 'all',
        // };

        // try{        
        //     let peerConnection = new RTCPeerConnection(config);
        //     peerConnection.onicecandidate = (event) => {
        //         const { candidate } = event 
        //         console.log('ice candidate: ', candidate)
        //         //TODO - gather & log candidates
        //     }

        //     peerConnection.onicegatheringstatechange = (event) => {
        //         if(peerConnection.iceGatheringState !== 'complete'){
        //             console.log(`peer connection ice gathering state changed to ${peerConnection.iceGatheringState}`)
        //             return;    
        //         }          
                
        //         const elapsed = ((Date.now() - begin) / 1000).toFixed(3)
        //         console.log(`ice candidates gathered in ${elapsed} seconds`)
        //         peerConnection.close()
        //         peerConnection = null
        //     }

        //     peerConnection.onicecandidateerror = (event) => {
        //         //TODO - log errors
        //         console.log('an ice candidate error occurred', event)
        //     }
        //     const description = await peerConnection.createOffer({offerToReceiveAudio: 1});
        //     peerConnection.setLocalDescription(description)
        // }catch(err){
        //     console.error('failed to initialize peer connection', err)
        // }        
    }

}