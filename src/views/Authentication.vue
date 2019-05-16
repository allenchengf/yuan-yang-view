<template lang="pug">
    
</template>


<script>
export default {
    methods: {
        checkAuthentication: function() {}
    },
    mounted() {
        var token = this.$route.query.token;
        this.$store.dispatch("account/updateToken", token);
        this.$store
            .dispatch("account/getProfile")
            .then(
                function(result) {
                    this.user = this.$store.getters["account/account"]();
                    this.$router.push("/admin");
                }.bind(this)
            )
            .catch(
                function(error) {
                    this.$store.dispatch("global/finishLoading");
                }.bind(this)
            );
    }
};
</script>

<style lang="sass" scoped>

</style>