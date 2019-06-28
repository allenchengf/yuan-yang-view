import Vue from "vue";
import Router from "vue-router";
import AdminLayout from "./views/Layout.vue";
import Logout from "./views/Logout.vue";
import Authentication from "./views/Authentication.vue";

import Dashboard from "./views/Dashboard.vue";
import CdnProvidersSetting from "./views/admin/CdnProvidersSetting";
import DomainsSetting from "./views/admin/DomainsSetting.vue";
import DomainInfo from "./views/admin/DomainInfo.vue";
import GroupingSetting from "./views/admin/GroupingSetting.vue";
import GroupInfo from "./views/admin/GroupInfo.vue";
import IRouteCdnSetting from "./views/IRouteCdn.vue";
import Logs from "./views/admin/Logs.vue";
import DnsLookup from "./views/admin/tools/DnsLookup.vue";
import ConfigBackup from "./views/admin/tools/ConfigBackup.vue";
import NetworkSetting from "./views/h7admin/NetworkSetting.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/auth",
            meta: {
                requireAuth: false,
                auth: 0
            },
            component: Authentication
        },
        {
            path: "/logout",
            meta: {
                requireAuth: false,
                auth: 0
            },
            component: Logout
        },
        { path: "*", redirect: "/" },
        {
            path: "/",
            meta: {
                requireAuth: true
            },
            component: AdminLayout,
            children: [
                {
                    path: "",
                    redirect: "/admin/cdn-providers",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    }
                },
                {
                    path: "dashboard",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    },
                    component: Dashboard
                },
                {
                    path: "dashboard",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    },
                    component: Dashboard
                },
                {
                    path: "/admin/cdn-providers",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: CdnProvidersSetting
                },
                {
                    path: "/admin/domains",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: DomainsSetting
                },
                {
                    name: "domainInfo",
                    path: "/admin/domains/:domain_id",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: DomainInfo,
                    props: route => ({
                        ...route.params
                    })
                },

                {
                    path: "/admin/grouping",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: GroupingSetting
                },
                {
                    name: "groupInfo",
                    path: "/admin/grouping/:groupId",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: GroupInfo,
                    props: route => ({
                        ...route.params
                    })
                },
                {
                    name: "iRouteCDN",
                    path: "iroutecdn",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    },
                    component: IRouteCdnSetting
                },
                {
                    path: "/admin/logs",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: Logs
                },
                {
                    path: "/admin/dns-lookup",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: DnsLookup
                },
                {
                    path: "/admin/config-backup",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: ConfigBackup
                },
                {
                    path: "/admin/networks",
                    name: "networks",
                    meta: {
                        requireAuth: true,
                        auth: 2
                    },
                    component: NetworkSetting
                }
            ]
        }
    ]
});
