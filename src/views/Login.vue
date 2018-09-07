<template>
    <div class="login-container">
        <section>
            <b-field horizontal label="Name">
                <b-input type="text" v-model="name"></b-input>
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
export default {
  data: function() {
    return {
      name: ""
    };
  },
  methods: {
    submit() {
      if (this.name == "") {
        this.$snackbar.open({
          duration: 5000,
          message: "请输入名称!",
          type: "is-warning",
          position: "is-bottom",
          actionText: "close",
          queue: false
        });
        return;
      }
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


