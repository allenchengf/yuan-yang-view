<template lang="pug">
    v-container#domainInfo.grid-list-lg
        v-layout(wrap)
            v-flex(xs12)
                .title {{domainInfo.name}}
            v-flex(xs12)
                v-breadcrumbs.pa-0(:items="breadcrumbsItems")
            v-flex(xs12)
                v-card 
                    v-tabs(v-model="tabsModel" slider-color="primary")
                        v-tab(v-for="item in tabItems" :key="item.key") {{item.title}}
                        v-tabs-items
                            v-tab-item(v-for="item in tabItems" )
                                component(:is="item.component" :domain_id="domain_id")
                        
                            
            
</template>
<script>
import DomainInfoSetting from "../../components/domainSettings/DomainInfoSetting";
import IRouteCdnInfoSetting from "../../components/domainSettings/IRouteCdnSetting";

export default {
    components: { DomainInfoSetting, IRouteCdnInfoSetting },
    data() {
        return {
            currentTab: "",
            breadcrumbsItems: [
                {
                    text: "Domains Setting",
                    disabled: false,
                    href: "/admin/domains"
                },
                {
                    text: "Domain Info",
                    disabled: true,
                    href: "/admin/domains/domain_id"
                },
                {
                    text: "General",
                    disabled: true,
                    href: ""
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
            domainInfo: [
                {
                    id: 3,
                    user_group_id: 2,
                    name: "rd.test1.com",
                    cname: "rd.test1.com",
                    group: {
                        name: "group1"
                    },
                    cdns: [{ name: "H7CDN" }, { name: "CloudFlare" }],
                    edited_by: null,
                    created_at: null,
                    updated_at: null
                }
            ]
        };
    },
    watch: {
        tabsModel: function(value) {
            this.$router.push({
                params: { domain_id: this.domain_id },
                query: { tab: this.tabItems[value].title }
            });
            this.breadcrumbsItems[2].text = this.tabItems[value].title;
        }
    },
    methods: {
        getDomainInfo() {
            this.domainInfo = this.domainInfo[0];
        }
    },
    mounted() {
        this.domain_id = this.$route.params.domain_id;
        console.log(this.domain_id);
        this.getDomainInfo();
        // this.$router.push("/admin/domain/" + this.domain_id);
    },
    created() {
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
