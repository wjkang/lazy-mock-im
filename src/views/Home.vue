<template>
  <div class="home">
    <section>
      <b-field horizontal label="msg">
        <b-input type="text" v-model="msg"></b-input>
      </b-field>

      <b-field horizontal>
        <!-- Label left empty for spacing -->
        <p class="control">
          <button class="button is-primary" @click="submit()">
            Enter
          </button>
        </p>
      </b-field>

    </section>
  </div>
</template>

<script>
import EasySocket from "../utils/EasySocket";
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
      client.emit("chat message", this.msg);
    }
  },
  mounted() {
    let client = this.$wsClients.get("im");
    if (!client || !client.connected) {
      this.$router.push("/login");
      return;
    }
    client.on("chat message", data => {
      console.log('receive:'+data);
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
