import Vue from "vue";
import Router from "vue-router";
import AdminLayout from "./views/Layout.vue";
import Logout from "./views/Logout.vue";
import Login from "./views/Login.vue";
import Forgot from "./views/ForgotPassword.vue";
import Authentication from "./views/Authentication.vue";

import Users from "./views/h7admin/Users.vue";
import UserGroups from "./views/h7admin/UserGroups.vue";
import UserGroupInfo from "./views/h7admin/UserGroupInfo.vue";

import Dashboard from "./views/Dashboard.vue";
import CdnProvidersSetting from "./views/admin/CdnProvidersSetting";
import DomainsSetting from "./views/admin/DomainsSetting.vue";
import DomainInfo from "./views/admin/DomainInfo.vue";
import GroupingSetting from "./views/admin/GroupingSetting.vue";
import GroupInfo from "./views/admin/GroupInfo.vue";
import IRouteCdnSetting from "./views/IRouteCdn.vue";
import IRouteCdnSettingById from "./views/IRouteCdnSettingById";
// import AllIRouteCdnSetting from "./views/AllIRouteCdnSetting";
import Logs from "./views/admin/Logs.vue";
import AutoScan from "./views/admin/tools/AutoScan.vue";
import AutoScanList from "./views/admin/tools/AutoScanList.vue";
import ConfigBackup from "./views/admin/tools/ConfigBackup.vue";
import NetworkSetting from "./views/h7admin/NetworkSetting.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/login",
            meta: {
                requireAuth: false,
                auth: 0
            },
            component: Login
        },
        {
            path: "forgot",
            name: "forgot",
            meta: {
                requireAuth: false
            },
            component: Forgot
        },
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
        { path: "*", redirect: "/admin" },
        {
            path: "/admin",
            meta: {
                requireAuth: true
            },
            component: AdminLayout,
            children: [
                {
                    path: "",
                    redirect: "cdn-providers",
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
                    path: "cdn-providers",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: CdnProvidersSetting
                },
                {
                    path: "domains",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: DomainsSetting
                },
                {
                    name: "domainInfo",
                    path: "domains/:domain_id",
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
                    name: "grouping",
                    path: "grouping",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: GroupingSetting
                },
                {
                    name: "groupInfo",
                    path: "grouping/:groupId",
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
                    name: "iRouteCdnSettingById",
                    path: "iroutecdn/rules/",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    },
                    component: IRouteCdnSettingById,
                    props: route => ({
                        ...route.params
                    })
                },
                {
                    path: "logs",
                    meta: {
                        requireAuth: true,
                        auth: 1
                    },
                    component: Logs
                },
                {
                    path: "auto-scan",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    },
                    component: AutoScan
                },
                {
                    name: "auto-scan-list",
                    path: "auto-scan-list",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    },
                    component: AutoScanList,
                    props: route => ({
                        ...route.params
                    })
                },
                {
                    path: "config-backup",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    },
                    component: ConfigBackup
                },
                {
                    path: "networks",
                    name: "networks",
                    meta: {
                        requireAuth: true,
                        auth: 2
                    },
                    component: NetworkSetting
                },
                {
                    path: "users",
                    meta: {
                        requireAuth: true,
                        auth: 2
                    },
                    component: Users
                },
                {
                    path: "user-groups",
                    meta: {
                        requireAuth: true,
                        auth: 2
                    },
                    component: UserGroups
                },
                {
                    path: "user-groups/:group_id",
                    name: "userGroupInfo",
                    meta: {
                        requireAuth: true,
                        auth: 2
                    },
                    component: UserGroupInfo,
                    props: route => ({
                        ...route.params
                    })
                }
            ]
        }
    ]
});
