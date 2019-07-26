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

Vue.prototype.$axios = axios;
Vue.prototype.$errorHandler = errorHandler;
router.beforeEach((to, from, next) => {
    var token = localStorage.getItem("token");
    if (to.meta.requireAuth) {
        if (token && varifyToken()) {
            if (store.getters["account/accountAuth"]() >= to.meta.auth) next();
            else next({ path: "/admin" });
        } else {
            next({ path: "/login" });
        }
    } else {
        if (token && varifyToken() && to.path == "/login") {
            var redirect = to.query.redirect;
            if (redirect != null) {
                location.replace(redirect + "?token=" + token);
            } else {
                next({ path: "/admin" });
            }
        } else next();
    }
});

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
