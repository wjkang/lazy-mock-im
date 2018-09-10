
let socket = null;
let openCallbacks = [];
let closeCallbacks = [];
let websocket = {
    init: function (url) {
        socket = new WebSocket(url);
    },
    onOpen: function (open) {
        if (socket !== null) {
            socket.addEventListener('open', function (event) {
                open && open();
                console.log(this === socket)
            });
        }
    },
    onClose: function (close) {
        if (socket !== null) {
            socket.addEventListener('close', function (event) {
                close && close();
            });
        }
    },
    onMessage: function (handle) {
        if (socket !== null) {
            socket.addEventListener('message', function (event) {
                handle && handle(event);
            });
        }
    },
    getInstance: function () {
        return socket;
    }
}

export default websocket