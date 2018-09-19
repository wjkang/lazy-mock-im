import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        user: {
            id:'',
            name:''
        },
        userList:[],
        roomList:[],
        rootUserList:[]
    },
    mutations: {
        increment(state) {
            state.count++
        }
    }
});

export default store;

