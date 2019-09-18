<template  lang="pug">
    v-app#app.has-text-left
        router-view.mb-5
        .ma-4.company.text-xs-center.grey--text
            span COPYRIGHT © {{year}} SYNERTECH NETWORK. ALL RIGHTS RESERVED.
        .ma-4.version.text-xs-right.grey--text
            span v{{version}}
            span.ml-1(v-if="env!='production'")  ({{env}}) 
</template>

<script>
export default {
    name: "App",
    data() {
        return {
            version: process.env.VUE_APP_VERSION,
            env: process.env.NODE_ENV,
            year: 2019
        };
    },
    mounted() {
        var d = new Date();
        this.year = d.getFullYear();
        // console.log(this.year);
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
.company {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
}
</style>
