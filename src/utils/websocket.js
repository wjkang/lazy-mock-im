
let instance = null;

let websocket = {
    init: function (url) {
        instance = new websocket(url);
    },
    open: function () {
       
    },
    getInstance:function(){
        return instance;
    }
}
export default websocket