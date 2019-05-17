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
Vue.component('h7-data-table', datatable);

Vue.prototype.$axios = axios;
Vue.prototype.$errorHandler = errorHandler;
router.beforeEach((to, from, next) => {
    var token = localStorage.getItem("token");
    if (to.meta.requireAuth) {
        if (token && varifyToken()) {
            next();
        } else {
            next({ path: "/login" });
        }
    } else {
        next();
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
