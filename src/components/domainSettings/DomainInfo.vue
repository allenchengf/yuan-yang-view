<template lang="pug">
    v-container#domainInfo
        v-layout(wrap)
            v-flex(xs12)
                v-layout(column)
                    h3 Domain Name : {{domain.name}}
                    h3 CName : {{domain.cname}}.{{dnsPodDomain}}
</template>
<script>
export default {
    props: ["domain", "select"],
    data() {
        return {
            dnsPodDomain: "",
            filterData: []
        };
    },
    methods: {
        getAllDomains: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getAllDomains")
                .then(
                    function(result) {
                        this.filterData = result.data.domains;
                        this.dnsPodDomain = result.data.dnsPodDomain;
                        this.mapping();
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                    }.bind(this)
                );
        },
        mapping() {
            this.filterData.forEach((o, i) => {
                if (o.name == this.select) {
                    this.domain = o;
                }
            });
        }
    },
    watch: {
        select: function() {
            this.mapping();
        }
    },
    mounted() {
        this.getAllDomains();
        this.mapping();
        console.log(this.domain);
    }
};
</script>
<style lang="sass">
#domainInfo
    padding: 20px 15px
</style>
