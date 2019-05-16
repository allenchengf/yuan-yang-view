<template lang="pug">
    v-container#domainInfo
        v-layout(wrap)
            v-flex(xs12)
                v-layout(column)
                    h4(v-show) {{filterData}}
                    h3 Domain Name : {{filterData.name}}
                    h3 CName : {{filterData.cname}}.{{dnsPodDomain}}
</template>
<script>
export default {
    props: ["tab", "domain_id"],
    data() {
        return {
            dnsPodDomain: "",
            filterData: [],
            domainData: [],
            data: []
        };
    },
    methods: {
        // getAllDomains: function() {
        //     this.$store.dispatch("global/startLoading");
        //     this.$store
        //         .dispatch("domains/getAllDomains")
        //         .then(
        //             function(result) {
        //                 this.filterData = result.data.domains;
        //                 this.dnsPodDomain = result.data.dnsPodDomain;
        //                 this.mapping();
        //                 this.$store.dispatch("global/finishLoading");
        //             }.bind(this)
        //         )
        //         .catch(
        //             function(error) {
        //                 this.$store.dispatch("global/finishLoading");
        //                 this.$store.dispatch(
        //                     "global/showSnackbarError",
        //                     error.message
        //                 );
        //             }.bind(this)
        //         );
        // },
        // mapping() {
        //     this.filterData.forEach((o, i) => {
        //         if (o.id == this.domain_id) {
        //             this.domainData = o;
        //         }
        //     });
        // },
        getDomain() {
            this.data.domain_id = this.domain_id;
            console.log(this.domain_id);
            this.data.ugid = this.$store.getters["account/accountGroupId"]();
            console.log(this.data, "data");
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getDomain", this.data)
                .then(
                    function(result) {
                        console.log(result);
                        this.filterData = result.data.domains[0];
                        this.dnsPodDomain = result.data.dnsPodDomain;
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
        }
    },
    watch: {
        domain_id: function() {
            this.getDomain();
        }
    },
    mounted() {
        this.getDomain();
    }
};
</script>