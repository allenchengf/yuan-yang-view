<template lang="pug">
    v-container#domainSettings
        v-layout(wrap column)
            v-flex(xs12)
                .title.text-xs-left.mb-4 Domain Settings
        v-layout(wrap column)  
            v-flex(xs12 sm4 md4)
                v-tabs(slider-color="primary" right)
                    v-autocomplete(:items="filterData" :filter="customFilter" label="Choose your domain to setting" item-text="name" v-model="select")
                    v-tab(v-for="tab in tabs" @click="domain_id = tab.domain_id;currentTab = tab" v-model="currentTab") {{tab.name}} 
                    v-tabs-items
                        v-tab-item(v-for="tab in tabs")
                            component(:is="tab.component" :domain_id.sync="domain.id" :domain.sync="domain" :select="select")

</template>

<script>
import DomainInfo from "../components/domainSettings/DomainInfo";
import CDNsetting from "../components/domainSettings/CDNsetting";
import IRouteCdnSetting from "../components/domainSettings/IRouteCdnSetting";

export default {
    components: { DomainInfo, CDNsetting, IRouteCdnSetting },

    data() {
        return {
            currentTab: "",
            loading: false,
            select: "" || "www.testhiero7.com",
            tabs: [
                {
                    name: "General",
                    component: DomainInfo
                },
                {
                    name: "CDNs",
                    component: CDNsetting
                },
                {
                    name: "iRouteCDN",
                    component: IRouteCdnSetting
                }
            ],
            filterData: [],
            selected: { name: "", cname: "" },
            domain: {},
            domain_id: ""
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
        customFilter(item, queryText, itemText) {
            const textOne = item.name.toLowerCase();
            const textTwo = item.cname.toLowerCase();
            const searchText = queryText.toLowerCase();

            return (
                textOne.indexOf(searchText) > -1 ||
                textTwo.indexOf(searchText) > -1
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
    },
    created() {
        var domainData = this.$route.query.data;
        this.dnsPodDomain = this.$route.query.dnsPodDomain;
        this.select = domainData.name;
        this.domain = domainData;

        this.$router.push("domain-settings");
    }
};
</script>
