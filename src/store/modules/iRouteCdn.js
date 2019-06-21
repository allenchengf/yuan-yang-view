import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getAlliRouteCDNs: (context, id) => {
            return axios
                .get("yuanyang/domains/" + id + "/iRouteCDN")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateiRouteCDN: (context, data) => {
            return axios
                .put(
                    "yuanyang/domains/" +
                        data.domain_id +
                        "/iRouteCDN/" +
                        data.id,
                    {
                        continent_id: data.continent_id,
                        country_id: data.country_id,
                        network_id: data.network_id,
                        cdn_id: data.cdn_id
                    }
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        }
    }
};
