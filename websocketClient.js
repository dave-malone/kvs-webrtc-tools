import { WebSocket } from 'ws'

export class WebsocketClient {

    constructor(endpoint, clientId){
        this.endpoint = endpoint
        this.clientId = clientId

        let start = new Date()
        this.websocket = new WebSocket(endpoint);

        this.websocket.onopen = (event) => {
            let end = new Date()
            console.log(`[${this.clientId}] websocket opened: ${JSON.stringify(event)} in ${Math. abs(start - end) / 1000} seconds`)
        }

        this.websocket.onclose = (event) => {
            console.log(`[${this.clientId}] websocket closed: ${JSON.stringify(event)}`)
        }

        this.websocket.onerror = (event) => {
            console.log(`[${this.clientId}] websocket error: ${JSON.stringify(event)}`)
        }

        this.websocket.onmessage = (event) => {
            console.log(`[${this.clientId}] websocket message: ${JSON.stringify(event)}`)
        }
    }

    
    sendText(message){
        console.log(`[${this.clientId}] sending message ${message}`)
        this.websocket.send(message)
    }

    sendAsJson(obj){
        this.sendText(JSON.stringify(obj))
    }

    //TODO - currently not working
    // measureRtt(){
    //     console.log(`initializing round-trip time (rtt) test...`)
    //     const receiver = new WebSocket(this.endpoint)
    //     receiver.onopen = (event) => {
    //         console.log(`rtt receiver opened and ready to receive messages; sending message via other end of the websocket connection`)
    //         this.sendAsJson({
    //             senderClientId: 'rtt-test-client',
    //             messageType: 'Test',
    //             messagePayload: JSON.stringify({message: 'testing round trip time (rtt)', date: Date.now()})                
    //         })
    //     }

    //     receiver.onerror = (event) => {
    //         console.log(`rtt receiver websocket error: ${JSON.stringify(event)}`)
    //     }

    //     receiver.onclose = (event) => {
    //         console.log('rtt receiver websocket onclose event')
    //     }

    //     receiver.onmessage = (event) => {
    //         console.log(`rtt receiver websocket message: ${JSON.stringify(event)}`)
    //         const now = Date.now()
    //         const msg = JSON.parse(event.data)
    //         const elapsed = ((Date.now() - begin) / 1000).toFixed(3)
            
    //         console.log(`rtt time elapsed b/w tx and rx: ${elapsed} seconds`)
    //         console.log(`rtt test complete`)

    //         receiver.close()
    //     }        
    // }

    close(){
        console.log(`[${this.clientId}] websocket closing`)
        this.websocket.close()
    }


}