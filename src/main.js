import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Buefy from 'buefy'
import 'buefy/lib/buefy.css'
import EasySocket from 'easy-socket-browser'
import { Toast } from 'buefy'

Vue.config.productionTip = false

Vue.prototype.$wsClients = EasySocket.clients;

Vue.use(Buefy)

new EasySocket({
  name: 'im',
  autoReconnect: true,
  pingMsg: '{"type":"event","event":"ping","args":"ping"}'
})
  .openUse((context, next) => {
    console.log("open");
    next();
  })
  .closeUse((context, next) => {
    console.log("close");
    next();
  }).errorUse((context, next) => {
    console.log("error", context.event);
    next();
  }).messageUse((context, next) => {
    if (context.res.type === 'event') {
      context.client.emit(context.res.event, context.res.args, true);
    }
    next();
  }).reconnectUse((context, next) => {
    Toast.open({
      duration: 5000,
      message: "reconnect...",
      type: "is-warning",
      position: "is-bottom-right",
      actionText: "close",
      queue: false
    });
    next();
  }).remoteEmitUse((context, next) => {
    let client = context.client;
    let event = context.event;
    if (client.socket.readyState !== 1) {
      Toast.open({
        duration: 5000,
        message: "连接已断开!",
        type: "is-warning",
        position: "is-bottom",
        actionText: "close",
        queue: false
      });
    } else {
      client.socket.send(JSON.stringify({
        type: 'event',
        event: event.event,
        args: event.args
      }));
      next();
    }
  });

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

