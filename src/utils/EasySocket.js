import compose from './compose';

export default class EasySocket {
    static clients = new Map();
    constructor(name) {
        this.name = name;
        this.openMiddleware = [];
        this.closeMiddleware = [];
        this.messageMiddleware = [];
        this.errorMiddleware = [];
    }
    openUse(fn) {
        this.openMiddleware.push(fn);
        return this;
    }
    closeUse(fn) {
        this.closeMiddleware.push(fn);
        return this;
    }
    messageUse(fn) {
        this.messageMiddleware.push(fn);
        return this;
    }
    errorUse(fn) {
        this.errorMiddleware.push(fn);
        return this;
    }
    connect(url) {
        this.socket = new WebSocket(url);

        const openFn = compose(this.openMiddleware);
        this.socket.addEventListener('open', (event) => {
            let context = { socket: this.socket, event };
            openFn(context).catch(error => { console.log(error) });
        });

        const closeFn = compose(this.closeMiddleware);
        this.socket.addEventListener('close', (event) => {
            let context = { socket: this.socket, event };
            closeFn(context).then(() => {
                EasySocket.clients.delete(this.name);
                this.socket = null;
            }).catch(error => {
                console.log(error)
            });
        });

        const messageFn = compose(this.messageMiddleware);
        this.socket.addEventListener('message', (event) => {
            let context = { socket: this.socket, event };
            messageFn(context).then(() => {

            }).catch(error => {
                console.log(error)
            });
        });

        const errorFn = compose(this.errorMiddleware);
        this.socket.addEventListener('error', (event) => {
            let context = { socket: this.socket, event };
            errorFn(context).then(() => {

            }).catch(error => {
                console.log(error)
            });
        });

        EasySocket.clients.set(this.name, this.socket);
    }

}