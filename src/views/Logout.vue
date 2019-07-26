<template lang="pug">
    
</template>

<script>
export default {
    created() {
        this.$store.dispatch("account/logout");
    }
};
</script>

<style lang="scss" scoped>
</style>