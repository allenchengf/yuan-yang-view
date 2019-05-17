import Vue from "vue";
import Router from "vue-router";
import Layout from "./views/Layout.vue";
import Logout from "./views/Logout.vue";
import Login from "./views/Login.vue";
import Authentication from "./views/Authentication.vue";

import Domains from "./views/Domains.vue";
import Setting from "./views/setting.vue";

import NetworkSetting from "./views/admin/NetworkSetting.vue";

// import CDN from "./views/settingCDN.vue";
// import iRouteCDN from "./views/settingiRouteCDN.vue";

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
                auth: 2
            },
            component: Authentication
        },
        {
            path: "/login",
            meta: {
                requireAuth: false,
                auth: 2
            },
            component: Login
        },
        {
            path: "/logout",
            meta: {
                requireAuth: true,
                auth: 2
            },
            component: Logout
        },

        {
            path: "/admin",
            meta: {
                requireAuth: true,
                auth: 2
            },
            component: Layout,
            children: [
                {
                    path: "",
                    redirect: "domains",
                    meta: {
                        requireAuth: true,
                        auth: 2
                    }
                },
                {
                    path: "domains",
                    meta: {
                        requireAuth: true,
                        auth: 2
                    },
                    component: Domains
                },
                {
                    path: "setting",
                    name: "setting",
                    meta: {
                        requireAuth: true,
                        auth: 2
                    },
                    component: Setting
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
                // {
                //     path: "settingCDN",
                //     name: "settingCDN",
                //     meta: {
                //         requireAuth: true,
                //         auth: 2
                //     },
                //     component: CDN
                // },
                // {
                //     path: "settingiRouteCDN",
                //     name: "settingiRouteCDN",
                //     meta: {
                //         requireAuth: true,
                //         auth: 2
                //     },
                //     component: iRouteCDN
                // }
            ]
        }
    ]
});
