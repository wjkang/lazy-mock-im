<template>
  <div class="home-container">
    <nav class="navbar is-transparent">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://github.com/wjkang/lazy-mock-im">
          <img :src="'https://api.adorable.io/avatars/80/'+user.id+'.png'" alt="" width="28" height="28">
        </a>
      </div>

      <div id="navbarExampleTransparentExample" class="navbar-menu">
        <div class="navbar-start">
          <div class="navbar-item">
            <a class="bd-tw-button button" href="https://github.com/wjkang/lazy-mock" target="_blank">
              lazy-mock
            </a>&nbsp;&nbsp;
            <a class="bd-tw-button button" href="https://github.com/wjkang/easy-socket-node" target="_blank">
              easy-socket
            </a>&nbsp;&nbsp;
            <a class="bd-tw-button button" href="https://github.com/websockets/ws" target="_blank">
              ws
            </a>&nbsp;&nbsp;
            <a class="bd-tw-button button" href="https://bulma.io/" target="_blank">
              bulma
            </a>&nbsp;&nbsp;
            <a class="bd-tw-button button" href="https://buefy.github.io/" target="_blank">
              buefy
            </a>
          </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="field is-grouped">
              <p class="control">
                <a class="bd-tw-button button" href="https://github.com/wjkang/lazy-mock-im" target="_blank">
                  Github
                </a>
              </p>
              <p class="control">
                <a class="button is-primary" @click="Logout">
                  Logout
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <div class="columns main-container">
      <div class="left column is-2">
        <user-list :userList="userList" :currentUser="user" :chatUser="currentChatUser" @changeChatUser="changeChatUser" />
      </div>
      <div class="main column">
        <span class="tag is-primary is-medium chat-with" v-show="currentChatUser.id">Chat With {{currentChatUser.name}}
          <button class="delete is-small" @click="closeChat"></button>
        </span>
        <span class="tag is-primary is-medium chat-with" v-show="currentChatRoom.id">Chat In {{currentChatRoom.name}}
          <button class="delete is-small" @click="closeRoomChat"></button>
        </span>
        <section class="msg-container" id="msg-container">
          <div class="tile is-parent is-vertical">
            <article class="tile is-child notification is-primary" :class="{'self-msg is-success':item.isSelf}" v-for="(item,index) in receives" :key="index">
              <p class="title">
                {{item.name}}
                <span class="msg-createtime">{{formatDateTime(item.createdDate)}}</span>
              </p>
              <p class="subtitle">{{item.msg}}</p>
            </article>
          </div>
        </section>
        <section class="msg-control">
          <b-field horizontal>
            <!-- Label left empty for spacing -->
            <p class="control">
              <b-switch v-model="autoScroll">
                autoscroll
              </b-switch>
            </p>
          </b-field>
          <b-field horizontal label="chat">
            <b-input type="textarea" v-model="msg" maxlength="500">
            </b-input>
          </b-field>

          <b-field horizontal>
            <!-- Label left empty for spacing -->
            <p class="control">
              <button class="button is-primary" @click="submitMsg()">send</button>&nbsp;&nbsp;
              <button class="button is-info" @click="clearMsg()">clear</button>&nbsp;&nbsp;
            </p>
          </b-field>

        </section>
      </div>
      <div class="right column is-2" style="text-align:left">
        <room-list :chatRoom="currentChatRoom" @changeChatRoom="changeChatRoom" />
      </div>
    </div>
  </div>
</template>

<script>
import UserList from "../components/UserList.vue";
import RoomList from "../components/RoomList.vue";
import { getToken, removeToken } from "@/utils/auth";
import { formatDateTime } from "@/utils/util";
import * as Api from "@/api";
import baseUrl from "../baseUrl";
export default {
  name: "home",
  components: {
    UserList,
    RoomList
  },
  data: function() {
    return {
      msg: "",
      receives: [],
      currentChatUser: {
        id: "",
        name: ""
      },
      currentChatRoom: {
        id: "",
        name: ""
      },
      chatType: 0,
      userMassageList: [],
      broadcastMessageList: [],
      autoScroll: true
    };
  },
  computed: {
    userList() {
      return this.$store.state.userList;
    },
    user() {
      return this.$store.state.user;
    }
  },
  methods: {
    submitMsg() {
      if (this.msg == "") {
        return;
      }
      let client = this.$wsClients.get("im");
      let msg = {
        type: this.chatType,
        msg: this.msg,
        from: {
          id: this.user.id,
          name: this.user.name
        }
      };
      //type broadcast=0,private chat=1,room chat=2, default 0
      if (this.chatType > 0) {
        msg.to =
          this.chatType == 1
            ? { user: this.currentChatUser }
            : { room: this.currentChatRoom };
      }
      if (this.chatType == 0) {
        client.emit("chatMessage", msg);
      } else if (this.chatType == 1) {
        client.emit("privateChatMessage", msg);
      } else if (this.chatType == 2) {
        client.emit("roomChatMessage", msg);
      }
      this.msg = "";
    },
    clearMsg() {
      this.receives = [];
      if (this.currentChatUser.id) {
        let chatUserMsg = this.userMassageList.find(item => {
          return item.id == this.currentChatUser.id;
        });
        chatUserMsg.msgs = [];
      }
    },
    changeChatUser(user) {
      let chatUserMsg = this.userMassageList.find(item => {
        return item.id == user.id;
      });
      if (!chatUserMsg) {
        chatUserMsg = {
          id: user.id,
          msgs: []
        };
        this.userMassageList.push(chatUserMsg);
      }
      if (this.currentChatRoom.id) {
        this.closeRoomChat();
      }
      this.receives = [...chatUserMsg.msgs];
      this.chatType = 1;
      this.currentChatUser = { ...user };
      this.$store.commit("resetUserMsgCount", { ...user });
      if (this.receives.length == 0) {
        this.fetchLatestMsg({
          type: 1,
          toId: user.id,
          fromId: this.user.id
        });
      } else {
        this.scroll();
      }
    },
    closeChat() {
      this.receives = [...this.broadcastMessageList];
      this.chatType = 0;
      this.currentChatUser = {
        id: "",
        name: ""
      };
      this.scroll();
    },
    changeChatRoom(room) {
      if (this.currentChatUser.id) {
        this.closeChat();
      }
      this.receives = [];
      this.chatType = 2;
      this.currentChatUser = {
        id: "",
        name: ""
      };
      this.currentChatRoom = { ...room };
      this.fetchLatestMsg({
        type: 2,
        toId: room.id
      });
    },
    closeRoomChat() {
      let client = this.$wsClients.get("im");
      client.emit("leaveRoom", {
        //type:this.chatType,
        user: { ...this.user },
        room: { ...this.currentChatRoom }
      });
      this.receives = [...this.broadcastMessageList];
      this.chatType = 0;
      this.currentChatRoom = {
        id: "",
        name: ""
      };
      this.scroll();
    },
    async fetchLatestMsg(query) {
      let res = await Api.getChatMessagePagedList({
        pageIndex: 1,
        pageSize: 10,
        sortBy: "createdDate",
        descending: "true",
        ...query
      });
      for (let msg of res.data.rows.reverse()) {
        let isSelf = msg.fromId == this.user.id;
        this.receives.push({
          name: msg.fromName,
          msg: msg.message,
          createdDate: msg.createdDate,
          isSelf
        });
      }
      this.scroll();
    },
    async fetchHistoryMsg() {
      var query = {};
      query.maxCreatedDate =
        this.receives.length > 0
          ? this.receives[0].createdDate
          : new Date().getTime();
      if (this.chatType == 1) {
        query.type = 1;
        query.toId = this.currentChatUser.id;
        query.fromId = this.user.id;
      } else if (this.chatType == 2) {
        query.type = 2;
        query.toId = this.currentChatRoom.id;
      } else {
        query.type = 0;
      }
      let res = await Api.getChatMessagePagedList({
        pageIndex: 1,
        pageSize: 10,
        sortBy: "createdDate",
        descending: "true",
        ...query
      });
      for (let msg of res.data.rows) {
        let isSelf = msg.fromId == this.user.id;
        this.receives.unshift({
          name: msg.fromName,
          msg: msg.message,
          createdDate: msg.createdDate,
          isSelf
        });
      }
      if (res.data.rows.length > 0) {
        this.$nextTick(() => {
          var div = document.getElementById("msg-container");
          div.scrollTop = res.data.rows.length * 100;
        });
      }
    },
    scroll() {
      if (this.autoScroll) {
        this.$nextTick(() => {
          var div = document.getElementById("msg-container");
          div.scrollTop = div.scrollHeight;
        });
      }
    },
    formatDateTime(time) {
      return formatDateTime(time);
    },
    Logout() {
      let client = this.$wsClients.get("im");
      client.close();
      removeToken();
      this.$router.push("/login");
    }
  },
  mounted() {
    let token = getToken();
    if (!token) {
      this.$router.push("/login");
      return;
    }
    let client = this.$wsClients.get("im");
    client.on("connectError", msg => {
      this.$snackbar.open({
        duration: 5000,
        message: msg,
        type: "is-warning",
        position: "is-bottom",
        actionText: "close",
        queue: false
      });
      removeToken();
      client.close();
      this.$router.push("/login");
    });
    client.on("connectSuccess", async data => {
      this.$store.commit("initAppData", {
        user: data.user,
        userList: data.userList,
        roomList: data.roomList
      });
      //拉取最新聊天记录
      await this.fetchLatestMsg({ type: 0 });
      this.broadcastMessageList = [...this.receives];
    });
    client.on("chatMessage", data => {
      let isSelf = data.from.id == this.user.id;
      let msg = {
        name: data.from.name,
        msg: data.msg,
        createdDate: data.createdDate,
        isSelf
      };
      if (!this.currentChatUser.id && !this.currentChatRoom.id) {
        this.receives.push(msg);
        this.scroll();
      }
      this.broadcastMessageList.push(msg);
    });
    client.on("privateChatMessage", data => {
      let isSelf = data.from.id == this.user.id;
      if (this.currentChatUser.id != data.from.id && !isSelf) {
        this.$store.commit("updateUserMsgCount", { ...data.from });
        let chatUserMsg = this.userMassageList.find(item => {
          return item.id == data.from.id;
        });
        if (!chatUserMsg) {
          chatUserMsg = {
            id: data.from.id,
            msgs: []
          };
          this.userMassageList.push(chatUserMsg);
        }
        chatUserMsg.msgs.push({
          name: data.from.name,
          msg: data.msg,
          createdDate: data.createdDate,
          isSelf
        });
      } else {
        if (!isSelf) {
          let chatUserMsg = this.userMassageList.find(item => {
            return item.id == data.from.id;
          });
          chatUserMsg.msgs.push({
            name: data.from.name,
            msg: data.msg,
            createdDate: data.createdDate,
            isSelf
          });
        }
        this.receives.push({
          name: data.from.name,
          msg: data.msg,
          createdDate: data.createdDate,
          isSelf
        });
        this.scroll();
      }
    });
    client.on("roomChatMessage", data => {
      let isSelf = data.from.id == this.user.id;
      this.receives.push({
        name: data.from.name,
        msg: data.msg,
        createdDate: data.createdDate,
        isSelf
      });
      this.scroll();
    });
    client.on("userConnect", user => {
      if (this.userList.length > 0) {
        this.$snackbar.open({
          duration: 5000,
          message: `${user.name} enter...`,
          type: "is-warning",
          position: "is-bottom-left",
          actionText: "close",
          queue: false
        });
        this.$store.commit("addUser", {
          id: user.id,
          name: user.name
        });
      }
    });
    client.on("userDisconnect", user => {
      this.$snackbar.open({
        duration: 5000,
        message: `${user.name} out...`,
        type: "is-warning",
        position: "is-bottom-left",
        actionText: "close",
        queue: false
      });
      this.$store.commit("delUser", user.id);
    });
    client.on("BusinessError", data => {
      this.$snackbar.open({
        duration: 5000,
        message: data.msg,
        type: "is-warning",
        position: "is-bottom-left",
        actionText: "close",
        queue: false
      });
    });
    if (!client.connected) {
      try {
        client.connect(baseUrl.WS + "?token=" + token);
      } catch (ex) {
        this.$snackbar.open({
          duration: 5000,
          message: "network error!",
          type: "is-warning",
          position: "is-bottom-left",
          actionText: "close",
          queue: false
        });
      }
    }
    this.$nextTick(() => {
      var div = document.getElementById("msg-container");
      div.addEventListener("scroll", e => {
        if (e.target.scrollTop == 0) {
          this.fetchHistoryMsg();
        }
      });
    });
  },
  activated() {
    let token = getToken();
    if (!token) {
      this.$router.push("/login");
      return;
    }
  },
  destroyed() {
    let client = this.$wsClients.get("im");
    client.removeAllListeners();
  },
  deactivated() {
    let client = this.$wsClients.get("im");
    client.removeAllListeners();
  }
};
</script>
<style lang="less" scoped>
.main-container {
  padding: 20px;
  .msg-createtime {
    font-size: 0.7rem;
    color: white;
    font-weight: 300;
  }
}
.left {
  max-height: 700px;
  text-align: left;
  overflow: auto;
}
.main {
  position: relative;
  .chat-with {
    position: absolute;
    z-index: 999;
    opacity: 0.3;
    right: 10px;
  }
}
.msg-control {
  padding-top: 20px;
  padding-right: 50px;
}
.msg-container {
  text-align: left;
  background-color: #f1eef5;
  border-radius: 10px;
  max-height: 500px;
  height: 500px;
  padding: 10px;
  margin-top: 35px;
  overflow: auto;
  article {
    width: 80%;
  }
}
.self-msg {
  align-self: flex-end;
  text-align: right;
}
</style>
