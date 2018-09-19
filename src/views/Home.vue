<template>
  <div class="home">
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
          <button class="button is-primary" @click="submit()">
            send
          </button>
        </p>
      </b-field>

    </section>
  </div>
</template>

<script>
export default {
  name: "home",
  data: function() {
    return {
      msg: "",
      receives: []
    };
  },
  methods: {
    submit() {
      let client = this.$wsClients.get("im");
      client.emit("chat message",{
        name:'xxxx',
        msg:this.msg
      });
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
.home {
  position: absolute;
  width: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 13px 16px;
  font-size: 14px;
  color: #ccc;
  border-radius: 2px;
}
.msg-control {
  padding-right: 50px;
}
.msg-container {
  text-align: left;
}
</style>
