import Vue from "vue";
import Router from "vue-router";
import Layout from "./views/Layout.vue";
import Logout from "./views/Logout.vue";
import Login from "./views/Login.vue";
import Authentication from "./views/Authentication.vue";

import Domains from "./views/Domains.vue";

import NetworkSetting from "./views/admin/NetworkSetting.vue";

// import CDN from "./views/settingCDN.vue";
// import iRouteCDN from "./views/settingiRouteCDN.vue";
import DomainSettings from "./views/DomainSettings.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        { path: "*", redirect: "/admin" },
        {
            path: "/auth",
            meta: {
                requireAuth: false,
                auth: 0
            },
            component: Authentication
        },
        {
            path: "/login",
            meta: {
                requireAuth: false,
                auth: 0
            },
            component: Login
        },
        {
            path: "/logout",
            meta: {
                requireAuth: true,
                auth: 0
            },
            component: Logout
        },

        {
            path: "/admin",
            meta: {
                requireAuth: true,
                auth: 0
            },
            component: Layout,
            children: [
                {
                    path: "",
                    redirect: "domains",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    }
                },
                {
                    path: "domains",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    },
                    component: Domains
                },
                {
                    path: "domain-settings",
                    name: "domainSettings",
                    meta: {
                        requireAuth: true,
                        auth: 0
                    },
                    component: DomainSettings
                },
                {
                    path: "networks",
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
