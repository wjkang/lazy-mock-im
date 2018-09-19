import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import EasySocket from "./utils/EasySocket"

Vue.config.productionTip = false

Vue.prototype.$wsClients = EasySocket.clients;

Vue.use(Buefy)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

new EasySocket("im")
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
  }).remoteEmitUse((context, next) => {
    let client = context.client;
    let event = context.event;
    client.socket.send(JSON.stringify({
      type: 'event',
      event: event.event,
      args: event.args
    }));
    next();
  });
