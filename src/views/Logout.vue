<template lang="pug">
    
</template>

<script>
export default {
    created() {
        window.location = process.env.VUE_APP_URL_PORTAL + "/logout";
    }
};
</script>

<style lang="scss" scoped>
</style>