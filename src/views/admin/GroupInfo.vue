<template lang="pug">
    v-container#groupInfo.grid-list-lg
        v-layout(wrap)
            v-flex(xs12)
                .title {{groupInfo.name}}
            v-flex(xs12)
                v-breadcrumbs.pa-0(:items="breadcrumbsItems")
            v-flex(xs12)
                v-tabs(v-model="tabsModel" slider-color="primary" color="transparent" @change="nowTab($route.query.tab)")
                    v-tab(v-for="item in tabItems" :key="item.key") {{item.title}}
                v-divider
            v-flex(xs12)
                    v-tabs-items(v-model="tabsModel")
                        v-tab-item(v-for="item in tabItems" :key="item.key")
                            component(:is="item.component" :groupId="groupId" :currentTab="reloadPage" v-on:childMethod="parentMethod")               
</template>
<script>
import GroupInfoSetting from "../../components/domainGroupSetting/GroupInfoSetting";
import GroupIRouteCdnSetting from "../../components/domainGroupSetting/GroupIRouteCdnSetting";

export default {
    components: { GroupInfoSetting, GroupIRouteCdnSetting },
    data() {
        return {
            currentTab: "",
            breadcrumbsItems: [
                {
                    text: "Grouping",
                    disabled: false,
                    exact: true,
                    to: "/admin/grouping"
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
                { title: "General", key: "1", component: GroupInfoSetting },
                {
                    title: "IRouteCDN",
                    key: "2",
                    component: GroupIRouteCdnSetting
                }
            ],
            tabsModel: 0,
            groupId: "",
            groupInfo: {},
            currentTab: "",
            reloadPage: "",
            route: ""
        };
    },
    watch: {
        tabsModel: function(value) {
            this.$router.push({
                params: { groupId: this.groupId },
                query: { tab: this.tabItems[value].title }
            });
            this.breadcrumbsItems[2].text = this.tabItems[value].title;
        },
        currentTab: function(value) {
            // console.log(value);
            this.reloadPage = value;
        }
    },
    methods: {
        parentMethod() {
            // console.log("Hello World");
            this.getGroupInfo();
        },
        nowTab(value) {
            // console.log(value);
            this.currentTab = value;
            this.getGroupInfo();
        },
        getGroupInfo() {
            return this.$store
                .dispatch("grouping/getGroupById", this.groupId)
                .then(
                    function(result) {
                        this.groupInfo = result.data;
                        this.breadcrumbsItems[1].text = this.groupInfo.name;
                        this.breadcrumbsItems[1].to =
                            "/admin/grouping/" + this.groupId;
                        // console.log(this.groupInfo);
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
            Promise.all([this.getGroupInfo()])
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
        this.groupId = this.$route.params.groupId;
        this.route = this.$route.path;
        // console.log(this.route);
        this.getGroupInfo();
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
