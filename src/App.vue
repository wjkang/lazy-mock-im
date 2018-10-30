<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
export default {
  created() {
    setTimeout(() => {
      document.body.removeChild(document.getElementById("StartLoading"));
    }, 200);
  }
};
</script>

<style lang="less">
body {
  padding: 0;
  margin: 0;
  background: -moz-linear-gradient(
    -45deg,
    #183850 0,
    #183850 25%,
    #192c46 50%,
    #22254c 75%,
    #22254c 100%
  );
  background: -webkit-linear-gradient(
    -45deg,
    #183850 0,
    #183850 25%,
    #192c46 50%,
    #22254c 75%,
    #22254c 100%
  );
  background-repeat: repeat;
  background-attachment: scroll;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
