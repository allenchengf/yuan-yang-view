<template  lang="pug">
  v-app#app.has-text-left
    router-view.mb-5
    .ma-4.version.text-xs-right.grey--text(v-if="env!='production'") 
        span v {{version}}
        span.ml-1 ({{env}})
</template>

<script>
export default {
    name: "App",
    data() {
        return {
            version: process.env.VUE_APP_VERSION,
            env: process.env.NODE_ENV
        };
    }
};
</script>
<style>
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}
.version {
    position: absolute;
    bottom: 0;
    right: 0;
}
</style>
