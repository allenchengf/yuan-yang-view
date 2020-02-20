import Vue from "vue";
import Router from "vue-router";
import AdminLayout from "./views/Layout.vue";
import Logout from "./views/Logout.vue";
import Login from "./views/Login.vue";
import Settings from "./views/Settings.vue";
import ResetPassword from "./views/ResetPassword.vue";
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
import Logs from "./views/admin/Logs.vue";
import AutoScan from "./views/admin/tools/AutoScan.vue";
import AutoScanList from "./views/admin/tools/AutoScanList.vue";
import ConfigBackup from "./views/admin/tools/ConfigBackup.vue";
import NetworkSetting from "./views/h7admin/NetworkSetting.vue";
import RoleSetting from "./views/h7admin/RoleSetting.vue";

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
        {
            path: "/forgot",
            meta: {
                requireAuth: false,
                auth: 0
            },
            component: Forgot
        },
        {
            path: "/reset-password",
            name: "reset",
            meta: {
                requireAuth: false,
                auth: 0
            },
            component: ResetPassword
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
                    redirect: "dashboard",
                    meta: {
                        requireAuth: true,
                        auth: 0
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
                    path: "settings",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    },
                    component: Settings
                },
                {
                    path: "cdn-providers",
                    name: "CDN Providers",
                    meta: {
                        requireAuth: true,
                        auth: 1,
                        sideBar: "CDN Providers"
                    },
                    component: CdnProvidersSetting
                },
                {
                    path: "domains",
                    name: "Domains",
                    meta: {
                        requireAuth: true,
                        auth: 1,
                        sideBar: "Domains"
                    },
                    component: DomainsSetting
                },
                {
                    name: "DomainInfo",
                    path: "domains/:domain_id",
                    meta: {
                        requireAuth: true,
                        auth: 1,
                        sideBar: "Domains"
                    },
                    component: DomainInfo,
                    props: route => ({
                        ...route.params
                    })
                },

                {
                    name: "Grouping",
                    path: "grouping",
                    meta: {
                        requireAuth: true,
                        auth: 1,
                        sideBar: "Grouping"
                    },
                    component: GroupingSetting
                },
                {
                    name: "groupInfo",
                    path: "grouping/:groupId",
                    meta: {
                        requireAuth: true,
                        auth: 1,
                        sideBar: "Grouping"
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
                        auth: 0,
                        sideBar: "iRouteCDN"
                    },
                    component: IRouteCdnSetting
                },
                {
                    name: "iRouteCdnSettingById",
                    path: "iroutecdn/rules/",
                    meta: {
                        requireAuth: true,
                        auth: 0,
                        sideBar: "iRouteCDN"
                    },
                    component: IRouteCdnSettingById,
                    props: route => ({
                        ...route.params
                    })
                },
                {
                    path: "logs",
                    name: "Logs",
                    meta: {
                        requireAuth: true,
                        auth: 1,
                        sideBar: "Logs"
                    },
                    component: Logs
                },
                {
                    path: "auto-scan",
                    name: "Auto Scan",
                    meta: {
                        requireAuth: true,
                        auth: 0,
                        sideBar: "Auto Scan"
                    },
                    component: AutoScan
                },
                {
                    name: "auto-scan-list",
                    path: "auto-scan-list",
                    meta: {
                        requireAuth: true,
                        auth: 0,
                        sideBar: "Auto Scan"
                    },
                    component: AutoScanList,
                    props: route => ({
                        ...route.params
                    })
                },
                {
                    path: "config-backup",
                    name: "Config Backup",
                    meta: {
                        requireAuth: true,
                        auth: 0,
                        sideBar: "Config Backup"
                    },
                    component: ConfigBackup
                },

                {
                    path: "/admin/networks",
                    name: "Networks",
                    meta: {
                        requireAuth: true,
                        auth: 2,
                        sideBar: "Networks"
                    },
                    component: NetworkSetting
                },
                {
                    path: "/admin/users",
                    name: "Users",
                    meta: {
                        requireAuth: true,
                        auth: 2,
                        sideBar: "Users"
                    },
                    component: Users
                },
                {
                    path: "/admin/roles",
                    name: "roles",
                    meta: {
                        requireAuth: true,
                        auth: 2,
                        sideBar: "Users"
                    },
                    component: RoleSetting
                },
                {
                    path: "/admin/user-groups",
                    name: "UserGroups",
                    meta: {
                        requireAuth: true,
                        auth: 2,
                        sideBar: "Users"
                    },
                    component: UserGroups
                },
                {
                    path: "/admin/user-groups/:group_id",
                    name: "userGroupInfo",
                    meta: {
                        requireAuth: true,
                        auth: 2,
                        sideBar: "Users"
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
