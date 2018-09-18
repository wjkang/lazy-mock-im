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
      if (!this.$wsClients.has("im")) {
        this.$router.push("/login");
        return;
      }
      let client = this.$wsClients.get("im");
      client.socket.send(this.msg);
    }
  },
  mounted() {
    if (!this.$wsClients.has("im")) {
      this.$router.push("/login");
      return;
    }
    let client = this.$wsClients.get("im");
  },
  activated() {
    if (!this.$wsClients.has("im")) {
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
