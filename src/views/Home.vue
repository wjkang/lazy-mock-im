<template>
  <div class="home-container">
    <nav class="navbar is-transparent">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://bulma.io">
          <img src="https://bulma.io/images/bulma-logo.png" alt="Bulma: a modern CSS framework based on Flexbox" width="112" height="28">
        </a>
        <div class="navbar-burger burger" data-target="navbarExampleTransparentExample">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div id="navbarExampleTransparentExample" class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" href="https://bulma.io/">
            Home
          </a>
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link" href="/documentation/overview/start/">
              Docs
            </a>
            <div class="navbar-dropdown is-boxed">
              <a class="navbar-item" href="/documentation/overview/start/">
                Overview
              </a>
              <a class="navbar-item" href="https://bulma.io/documentation/modifiers/syntax/">
                Modifiers
              </a>
              <a class="navbar-item" href="https://bulma.io/documentation/columns/basics/">
                Columns
              </a>
              <a class="navbar-item" href="https://bulma.io/documentation/layout/container/">
                Layout
              </a>
              <a class="navbar-item" href="https://bulma.io/documentation/form/general/">
                Form
              </a>
              <hr class="navbar-divider">
              <a class="navbar-item" href="https://bulma.io/documentation/elements/box/">
                Elements
              </a>
              <a class="navbar-item is-active" href="https://bulma.io/documentation/components/breadcrumb/">
                Components
              </a>
            </div>
          </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="field is-grouped">
              <p class="control">
                <a class="bd-tw-button button" data-social-network="Twitter" data-social-action="tweet" data-social-target="http://localhost:4000" target="_blank" href="https://twitter.com/intent/tweet?text=Bulma: a modern CSS framework based on Flexbox&amp;hashtags=bulmaio&amp;url=http://localhost:4000&amp;via=jgthms">
                  <span class="icon">
                    <i class="fab fa-twitter"></i>
                  </span>
                  <span>
                    Tweet
                  </span>
                </a>
              </p>
              <p class="control">
                <a class="button is-primary" href="https://github.com/jgthms/bulma/releases/download/0.7.1/bulma-0.7.1.zip">
                  <span class="icon">
                    <i class="fas fa-download"></i>
                  </span>
                  <span>Download</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <div class="columns main-container">
      <div class="left column is-2">
        <user-list :userList="userList" :currentUser="user" @changeChatUser="changeChatUser" />
      </div>
      <div class="main column">
        <section class="msg-container">
          <span class="tag is-primary is-medium chat-with" v-show="currentChatUser.id">Chat With {{currentChatUser.name}}</span>
          <div class="tile is-parent is-vertical">
            <article class="tile is-child notification is-primary" :class="{'self-msg is-success':item.isSelf}" v-for="(item,index) in receives" :key="index">
              <p class="title">{{item.name}}</p>
              <p class="subtitle">{{item.msg}}</p>
            </article>
          </div>
        </section>
        <section class="msg-control">
          <b-field horizontal label="msg">
            <b-input type="text" v-model="msg"></b-input>
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
      <div class="right column is-2">

      </div>
    </div>
  </div>
</template>

<script>
import UserList from "../components/UserList.vue";
export default {
  name: "home",
  components: {
    UserList
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
          return item.id == user.id;
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
      this.receives = chatUserMsg.msgs;
      this.chatType = 1;
      this.currentChatUser = { ...user };
      this.$store.commit("resetUserMsgCount", { ...user });
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
.msg-control {
  padding-top: 20px;
  padding-right: 50px;
}
.msg-container {
  position: relative;
  text-align: left;
  background-color: #f1eef5;
  border-radius: 10px;
  max-height: 500px;
  height: 500px;
  padding: 10px;
  overflow: auto;
  .chat-with {
    position: absolute;
    z-index: 999;
    opacity: 0.3;
  }
  article {
    width: 80%;
  }
}
.self-msg {
  align-self: flex-end;
  text-align: right;
}
</style>
