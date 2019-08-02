import Vue from "vue";
import Vuex from "vuex";
import account from "./modules/account";
import global from "./modules/global";

import domains from "./modules/domains";
import networks from "./modules/networks";
import cdns from "./modules/cdns";
import cdnProviders from "./modules/cdnProviders";
import iRouteCdn from "./modules/iRouteCdn";
import locationInfo from "./modules/locationInfo";
import grouping from "./modules/grouping";
import config from "./modules/config";
import logs from "./modules/logs";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        account,
        global,
        domains,
        networks,
        cdns,
        cdnProviders,
        iRouteCdn,
        locationInfo,
        grouping,
        config,
        logs
    }
});
