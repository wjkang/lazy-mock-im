import compose from './compose';
import Emitter from './Emitter';

export default class EasySocket extends Emitter {
    static clients = new Map();
    constructor(name) {
        super();
        this.name = name;
        this.connected = false;
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
            let context = { client: this, event };
            this.openFn(context).catch(error => { console.log(error) });
        });

        this.closeFn = compose(this.closeMiddleware);
        this.socket.addEventListener('close', (event) => {
            let context = { client: this, event };
            this.closeFn(context).then(() => {
                EasySocket.clients.delete(this.name);
                this.socket = null;
                this.connected = false;
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
            let context = { client: this, event, data };
            this.messageFn(context).then(() => {

            }).catch(error => {
                console.log(error)
            });
        });

        this.errorFn = compose(this.errorMiddleware);
        this.socket.addEventListener('error', (event) => {
            let context = { client: this, event };
            this.errorFn(context).then(() => {

            }).catch(error => {
                console.log(error)
            });
        });

        EasySocket.clients.set(this.name, this);
        this.connected = true;
        return this;
    }

    emit(event, args, isLocal = false) {
        let arr = [event, args];
        if (isLocal) {
            super.emit.apply(this, arr);
            return this;
        }
        if (!this.connected) {
            throw new Error('unconnected');
        }
        let data = JSON.stringify(arr);
        this.socket.send(data);
        return this;
    }

}