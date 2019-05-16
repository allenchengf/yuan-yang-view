import Vue from "vue";
import Vuex from "vuex";
import account from "./modules/account";
import global from "./modules/global";

import domains from "./modules/domains";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        account,
        global,
        domains
    }
});
