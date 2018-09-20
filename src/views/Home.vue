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
        <user-list></user-list>
      </div>
      <div class="main column">
        <section class="msg-container">
          <div class="tile is-parent is-vertical">
            <article class="tile is-child notification is-primary" v-for="(item,index) in receives" :key="index">
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
      receives: []
    };
  },
  methods: {
    submitMsg() {
      let client = this.$wsClients.get("im");
      client.emit("chat message", {
        name: "xxxx",
        msg: this.msg
      });
    },
    clearMsg() {
      this.receives = [];
    }
  },
  mounted() {
    let client = this.$wsClients.get("im");
    if (!client || !client.connected) {
      this.$router.push("/login");
      return;
    }
    client.on("chat message", data => {
      this.receives.push(data);
    });
    client.on("user login", user => {
      console.log(1)
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
      this.$store.commit("delUser",user.id);
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
  overflow: auto;
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
  overflow: auto;
  article {
    width: 80%;
  }
}
</style>
