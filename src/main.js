import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "./utils/axios";
import errorHandler from "./utils/errorHandler";

Vue.config.productionTip = false;

//component
import datatable from "./components/DataTable";
Vue.component("h7-data-table", datatable);
import selectableDatatable from "./components/SelectableDataTable";
Vue.component("h7-selectable-data-table", selectableDatatable);

Vue.prototype.$axios = axios;
Vue.prototype.$errorHandler = errorHandler;
router.beforeEach((to, from, next) => {
    var token = localStorage.getItem("token");
    if (to.meta.requireAuth) {
        // console.log("requireAuth")
        if (token && varifyToken()) {
            // console.log(store.getters["account/accountAuth"]() + "," + to.meta.auth)
            // console.log(to.path)
            if (store.getters["account/accountAuth"]() >= to.meta.auth) next();
            else next({ path: getHomePage() });
        } else {
            next({ path: "/login" });
        }
    } else {
        if (token && varifyToken() && to.path == "/login") {
            next({ path: getHomePage() });

            // var redirect = to.query.redirect;
            // if (redirect != null) {
            //     location.replace(redirect + "?token=" + token);
            // } else {
            //     next({ path: "/admin" });
            // }
            // next();
        } else next();
    }
});

function getHomePage() {
    var level = store.getters["account/accountAuth"]();
    switch (level) {
        case 0:
            return "/admin/iRouteCDN";
        case 1:
            return "/admin/cdn-providers";
        case 2:
            return "/admin/cdn-providers";
        default:
            return "/admin/iRouteCDN";
    }
}

async function varifyToken() {
    try {
        var response = await store.dispatch("account/getProfile");
        return true;
    } catch (error) {
        return false;
    }
}

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");
