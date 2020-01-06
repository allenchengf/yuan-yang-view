<template lang="pug">
    v-container#domainInfo.grid-list-lg
        v-layout(wrap)
            v-flex(xs12)
                .title {{domainInfo.name}}
            v-flex(xs12)
                v-breadcrumbs.pa-0(:items="breadcrumbsItems")
            v-flex(xs12)
                v-tabs(v-model="tabsModel" slider-color="primary" color="transparent" @change="nowTab($route.query.tab)")
                    v-tab(v-for="item in tabItems" :key="item.key") {{item.title}}
                v-divider
            v-flex(xs12)
                    v-tabs-items(v-model="tabsModel")
                        v-tab-item(v-for="item in tabItems" :key="item.key")
                            component(:is="item.component" :domain_id="domain_id" :currentTab="reloadPage" v-on:childMethod="parentMethod")
                        
                            
            
</template>
<script>
import DomainInfoSetting from "../../components/domainSettings/DomainInfoSetting";
import IRouteCdnInfoSetting from "../../components/domainSettings/IRouteCdnSetting";

export default {
    components: { DomainInfoSetting, IRouteCdnInfoSetting },
    props: ["info"],
    data() {
        return {
            currentTab: "",
            breadcrumbsItems: [
                {
                    text: "Domains",
                    disabled: false,
                    exact: true,
                    to: "/admin/domains"
                },
                {
                    text: "",
                    disabled: false,
                    exact: true,
                    to: ""
                },
                {
                    text: "General",
                    disabled: true,
                    exact: true,
                    to: ""
                }
            ],
            tabItems: [
                { title: "General", key: "1", component: DomainInfoSetting },
                {
                    title: "IRouteCDN",
                    key: "2",
                    component: IRouteCdnInfoSetting
                }
            ],
            tabsModel: 0,
            domain_id: "",
            dnsPodDomain: "shiftcdn.com",
            domainInfo: {},
            currentTab: "",
            reloadPage: ""
        };
    },
    watch: {
        tabsModel: function(value) {
            this.$router.push({
                params: { domain_id: this.domain_id },
                query: { tab: this.tabItems[value].title }
            });
            this.breadcrumbsItems[2].text = this.tabItems[value].title;
        },
        currentTab: function(value) {
            this.reloadPage = value;
        }
    },
    methods: {
        parentMethod() {
            // console.log("Hello World");
            this.getDomainInfo();
        },
        nowTab(value) {
            this.currentTab = value;
        },
        getDomainInfo() {
            var domain = {
                id: this.domain_id,
                permission_id: this.permission_id
            };
            return this.$store
                .dispatch("domains/getDomainById", domain)
                .then(
                    function(result) {
                        this.domainInfo = result.data.domain;
                        this.dnsPodDomain = result.data.dnsPodDomain;
                        // console.log(this.domainInfo, "data");
                        this.breadcrumbsItems[1].text = this.domainInfo.name;
                        this.breadcrumbsItems[1].to =
                            "/admin/domains/" + this.domain_id;
                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        return Promise.reject(error);
                    }.bind(this)
                );
        },
        initialApis: function() {
            this.$store.dispatch("global/startLoading");
            Promise.all([this.getDomainInfo()])
                .then(
                    function() {
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
    created() {
        this.domain_id = this.$route.params.domain_id;
        this.initialApis();
        var query = this.$route.query;
        if (query.tab != null) {
            var idx = this.tabItems.findIndex(elem => {
                return elem.title == query.tab;
            });
            if (idx != -1) {
                this.tabsModel = idx;
            }
        }
    }
};
</script>
