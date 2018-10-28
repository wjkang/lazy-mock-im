<template>
  <div class="login-container">
    <section>
      <b-field horizontal label="username">
        <b-input type="text" v-model="name"></b-input>
      </b-field>
      <b-field horizontal label="password">
        <b-input type="text" v-model="password"></b-input>
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
    <b-loading :active.sync="isLoading"></b-loading>
  </div>
</template>
<script>
import { loginByUsername } from "@/api";
import { getToken, setToken } from "@/utils/auth";
export default {
  data: function() {
    return {
      name: "",
      password: "",
      isLoading: false
    };
  },
  methods: {
    async submit() {
      if (this.name == "" || this.password == "") {
        this.$snackbar.open({
          duration: 5000,
          message: "请输入账号密码!",
          type: "is-warning",
          position: "is-bottom",
          actionText: "close",
          queue: false
        });
        return;
      }
      this.isLoading = true;
      try {
        let loginResult = await loginByUsername(this.name, this.password);
        setToken(loginResult.data.accessToken);
        this.$router.push("/");
        this.isLoading = false;
        return;
      } catch (e) {
        this.isLoading = false;
        this.$snackbar.open({
          duration: 5000,
          message: e,
          type: "is-warning",
          position: "is-bottom",
          actionText: "close",
          queue: false
        });
        return;
      }
    }
  },
  mounted() {
    let token = getToken();
    if (token) {
      this.$router.push("/");
      return;
    }
  }
};
</script>
<style lang="less" scoped>
.login-container {
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
</style>


