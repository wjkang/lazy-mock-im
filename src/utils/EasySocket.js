import compose from './compose';

export default class EasySocket {
    static clients = new Map();
    constructor(name) {
        this.name = name;
        this.openMiddleware = [];
        this.closeMiddleware = [];
        this.messageMiddleware = [];
        this.errorMiddleware = [];

        this.openFn = Promise.resolve();
        this.closeFn = Promise.resolve();
        this.messageFn = Promise.resolve();
        this.errorFn = Promise.resolve();
    }
    openUse(fn) {
        this.openMiddleware.push(fn);
        return this;
    }
    closeUse(fn, runtime) {
        this.closeMiddleware.push(fn);
        if (runtime) {
            this.closeFn = compose(this.closeMiddleware);
        }
        return this;
    }
    messageUse(fn, runtime) {
        this.messageMiddleware.push(fn);
        if (runtime) {
            this.messageFn = compose(this.messageMiddleware);
        }
        return this;
    }
    errorUse(fn, runtime) {
        this.errorMiddleware.push(fn);
        if (runtime) {
            this.errorFn = compose(this.errorMiddleware);
        }
        return this;
    }
    connect(url) {
        this.socket = new WebSocket(url, 'echo-protocol');

        this.openFn = compose(this.openMiddleware);
        this.socket.addEventListener('open', (event) => {
            let context = { socket: this.socket, event };
            this.openFn(context).catch(error => { console.log(error) });
        });

        this.closeFn = compose(this.closeMiddleware);
        this.socket.addEventListener('close', (event) => {
            let context = { socket: this.socket, event };
            this.closeFn(context).then(() => {
                EasySocket.clients.delete(this.name);
                this.socket = null;
            }).catch(error => {
                console.log(error)
            });
        });

        this.messageFn = compose(this.messageMiddleware);
        this.socket.addEventListener('message', (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (error) {
                data = event.data;
            }
            let context = { socket: this.socket, event, data };
            this.messageFn(context).then(() => {

            }).catch(error => {
                console.log(error)
            });
        });

        this.errorFn = compose(this.errorMiddleware);
        this.socket.addEventListener('error', (event) => {
            let context = { socket: this.socket, event };
            this.errorFn(context).then(() => {

            }).catch(error => {
                console.log(error)
            });
        });

        EasySocket.clients.set(this.name, this);
    }

}