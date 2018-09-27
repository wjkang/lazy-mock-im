<template>
  <div class="home-container">
    <nav class="navbar is-transparent">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://bulma.io">
          <img src="https://avatars3.githubusercontent.com/u/9456046?s=460&v=4" alt="" width="28" height="28">
        </a>
      </div>

      <div id="navbarExampleTransparentExample" class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" href="https://github.com/wjkang/lazy-mock" target="_blank">
            lazy-mock
          </a>
          <a class="navbar-item" href="https://github.com/wjkang/easy-socket-node" target="_blank">
            easy-socket
          </a>
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
                <a class="button is-primary">
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
        <section class="msg-container">
          <div class="tile is-parent is-vertical">
            <article class="tile is-child notification is-primary" :class="{'self-msg is-success':item.isSelf}" v-for="(item,index) in receives" :key="index">
              <p class="title">{{item.name}}</p>
              <p class="subtitle">{{item.msg}}</p>
            </article>
          </div>
        </section>
        <section class="msg-control">
          <b-field horizontal label="chat">
            <b-input type="textarea" v-model="msg" maxlength="500">
            </b-input>
          </b-field>

          <b-field horizontal>
            <!-- Label left empty for spacing -->
            <p class="control">
              <button class="button is-primary" @click="submitMsg()">send</button>&nbsp;&nbsp;
              <button class="button is-info" @click="clearMsg()">clear</button>
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
      user: this.$store.state.user,
      currentChatUser: {
        id: "",
        name: ""
      },
      currentChatRoom: {
        id: "",
        name: ""
      },
      chatType: 0,
      userMassageList: []
    };
  },
  computed: {
    userList() {
      return this.$store.state.userList;
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
      client.emit("chat message", msg);
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
      if(this.currentChatRoom.id){
        this.closeRoomChat();
      }
      this.receives = [...chatUserMsg.msgs];
      this.chatType = 1;
      this.currentChatUser = { ...user };
      this.$store.commit("resetUserMsgCount", { ...user });
      
    },
    closeChat() {
      this.receives = [];
      this.chatType = 0;
      this.currentChatUser = {
        id: "",
        name: ""
      };
    },
    changeChatRoom(room) {
      if(this.currentChatUser.id){
        this.closeChat();
      }
      this.receives = [];
      this.chatType = 2;
      this.currentChatUser = {
        id: "",
        name: ""
      };
      this.currentChatRoom = { ...room };
    },
    closeRoomChat() {
      let client = this.$wsClients.get("im");
      client.emit("leaveRoom", {
        //type:this.chatType,
        user: { ...this.user },
        room: { ...this.currentChatRoom }
      });
      this.receives = [];
      this.chatType = 0;
      this.currentChatRoom = {
        id: "",
        name: ""
      };
    }
  },
  mounted() {
    let client = this.$wsClients.get("im");
    if (!client || !client.connected) {
      this.$router.push("/login");
      return;
    }
    client.on("chat message", data => {
      let isSelf = data.from.id == this.user.id;
      if (data.type > 0) {
        if (data.type == 1) {
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
                isSelf
              });
            }
            this.receives.push({
              name: data.from.name,
              msg: data.msg,
              isSelf
            });
          }
        } else if (data.type == 2) {
          this.receives.push({
            name: data.from.name,
            msg: data.msg,
            isSelf
          });
        }
      } else {
        if (!this.currentChatUser.id) {
          this.receives.push({
            name: data.from.name,
            msg: data.msg,
            isSelf
          });
        }
      }
    });
    client.on("user login", user => {
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
    });
    client.on("user logout", user => {
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
  },
  activated() {
    let client = this.$wsClients.get("im");
    if (!client || !client.connected) {
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
