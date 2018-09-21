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
        },
        updateUserMsgCount(state, user) {
            let s = state.userList.find((item) => {
                return item.id == user.id;
            });
            let index = state.userList.findIndex((item) => {
                return item.id == user.id;
            });
            s.msgCount = s.msgCount || 0;
            s.msgCount++;
            Vue.set(state.userList, index, s)
        },
        resetUserMsgCount(state, user) {
            let s = state.userList.find((item) => {
                return item.id == user.id;
            });
            let index = state.userList.findIndex((item) => {
                return item.id == user.id;
            });
            s.msgCount = 0;
            Vue.set(state.userList, index, s)
        }
    }
});

export default store;

