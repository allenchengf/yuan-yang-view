<template lang="pug">
    v-container(grid-list-lg)#dashboard
        v-layout(wrap column)
            v-flex(xs12)
                .title.text-xs-left.mb-4 Dashboard
            v-flex(xs12 sm8)
                v-layout(row)
                    v-flex(xs12 sm4 md4)
                        v-card(color="brown darken-1" class="white--text")
                            .px-3.pt-3.pb-0.text-xs-center.font-weight-medium FQDN
                            v-card-text.text-xs-center
                                .display-1.font-weight-light
                                    AnimatedNumber(:value="domainCount" :formatValue="formatNumber" :duration="duration")
                    v-flex(xs12 sm4 md4)
                        v-card(color="brown darken-1" class="white--text")
                            .px-3.pt-3.pb-0.text-xs-center.font-weight-medium CDN Provider
                            v-card-text.text-xs-center
                                .display-1.font-weight-light
                                    AnimatedNumber(:value="cdnProviderCount" :formatValue="formatNumber" :duration="duration")
                    v-flex(xs12 sm4 md4)
                        v-card(color="brown darken-1" class="white--text")
                            .px-3.pt-3.pb-0.text-xs-center.font-weight-medium Grouping
                            v-card-text.text-xs-center
                                .display-1.font-weight-light
                                    AnimatedNumber(:value="groupCount" :formatValue="formatNumber" :duration="duration")
            v-flex(xs12 sm8)
                v-layout(row)
                    v-flex(xs12 sm6 md6)
                        v-card
                            v-card-title
                                .subheading CDN providers that selected by FQDN
                            h7-data-table(:headers="headers" :items="cdnProviderData" :loading="$store.state.global.isLoading" single-line :per-page="10")
                                template(slot="items" slot-scope="{props, index}")
                                    tr(:class="props.item.status? '': 'grey--text'")
                                        td {{index}}
                                        td {{props.item.name}}
                                        td {{props.item.default_domains_count}}
                    v-flex(xs12 sm6 md6)
                        v-card
                            v-card-title
                                .subheading 10 Latest log of FQDN
                            h7-data-table(:headers="logsHeaders" :items="logData" :loading="$store.state.global.isLoading" single-line :per-page="10" :showPerPageRow="false")
                                template(slot="items" slot-scope="{props, index}")
                                    tr
                                        td {{index}}
                                        td {{props.item.time}}
                                        td {{props.item.domain_name}}
                                        td {{props.item.change_type}}
</template>
<script>
import AnimatedNumber from "animated-number-vue";
export default {
    components: {
        AnimatedNumber
    },
    data() {
        return {
            duration: 800,
            headers: [
                {
                    text: "#",
                    align: "left",
                    sortable: false,
                    width: "80px",
                    value: "index"
                },
                {
                    text: "CDN Provider",
                    align: "left",
                    sortable: true,
                    value: "cdnProvider"
                },
                {
                    text: "Count",
                    align: "left",
                    sortable: true,
                    value: "count"
                }
            ],
            logsHeaders: [
                {
                    text: "#",
                    align: "left",
                    sortable: false,
                    width: "80px",
                    value: "index"
                },
                {
                    text: "Time",
                    align: "left",
                    sortable: true,
                    value: "cdnProvider"
                },
                {
                    text: "FQDN",
                    align: "left",
                    sortable: true,
                    value: "cdnProvider"
                },
                {
                    text: "Action",
                    align: "left",
                    sortable: true,
                    value: "count"
                }
            ],
            filterData: [
                { name: "Hiero7", count: 50, status: false },
                { name: "Cloudflare", count: 150, status: true },
                { name: "Cloudfront", count: 80, status: true }
            ],
            user_group_id: 0,
            dnsPodDomain: "",
            domainCount: 0,
            cdnProviderCount: 0,
            groupCount: 0,
            logData: [],
            cdnProviderData: []
        };
    },
    methods: {
        formatNumber(value) {
            return Math.ceil(value);
        },
        getAllDomains: function() {
            this.$store.dispatch("global/startLoading");
            var domain = {
                id: this.user_group_id,
                permission_id: 9
            };
            this.$store
                .dispatch("domains/getAllDomains", domain)
                .then(
                    function(result) {
                        this.domainCount = result.data.domains.length;
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
        getAllCdnProviders: function() {
            // this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/getAllCdnProvider", 9)
                .then(
                    function(result) {
                        this.cdnProviderCount = result.data.length;
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
        getAllGroups() {
            // this.filterData = this.filterData;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("grouping/getAllGroups", 9)
                .then(
                    function(result) {
                        this.groupCount = result.data.length;
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                        // this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                );
        },
        getCdnProviderDetailInfo() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/getCdnProviderDetailInfo", 9)
                .then(
                    function(result) {
                        this.cdnProviderData = result.data;
                        // this.$store.dispatch("global/finishLoading");
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
        getLogs() {
            // this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("logs/getLogsByDomain", 9)
                .then(
                    function(result) {
                        this.logData = result.data;
                        this.transformMessage();
                        // this.$store.dispatch("global/finishLoading");
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
        transformMessage() {
            this.logData.forEach((o, i) => {
                switch (o.change_type) {
                    case "Create":
                        o["domain_name"] = o.changed_to.name;
                        break;
                    case "Update":
                        o["domain_name"] = o.changed_from.name;
                        break;
                    case "Delete":
                        o["domain_name"] = o.changed_from.name;
                        break;
                    default:
                        break;
                }
            });
            // console.log(this.logData);
        }
    },
    mounted() {
        this.user_group_id = this.$store.getters["account/accountGroupId"]();
        this.getAllDomains();
        this.getAllCdnProviders();
        this.getAllGroups();
        this.getCdnProviderDetailInfo();
        this.getLogs();
    }
};
</script>
