import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        user: {
            id: '',
            name: ''
        },
        userList: [],
        roomList: [],
        rootUserList: []
    },
    mutations: {
        initAppData(state, data) {
            state.user = data.user;
            state.userList = data.userList;
        },
        addUser(state, user) {
            state.userList.push(user);
        },
        delUser(state, id) {
            for (let i = 0; i < state.userList.length; i++) {
                if (state.userList[i].id == id) {
                    state.userList.splice(i, 1);
                    break;
                }
            }
        }
    }
});

export default store;

