import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {
        domains: []
    },
    getters: {},
    mutations: {
        updateDomains: (state, domains) => {
            state.domains = domains;
        }
    },
    actions: {
        getAllDomains: (context, user_group_id) => {
            return axios
                .get("yuanyang/domains?user_group_id=" + user_group_id)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getDomain: (context, data) => {
            return axios
                .get(
                    "yuanyang/domains?user_group_id=" +
                        data.ugid +
                        "&domain_id=" +
                        data.domain_id
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getDomainById: (context, id) => {
            return axios
                .get("yuanyang/domains/" + id)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        // getAlliRouteCDNs: (context, id) => {
        //     return axios
        //         .get("yuanyang/domains/" + id + "/iRouteCDN")
        //         .then(function(response) {
        //             return Promise.resolve(response.data);
        //         })
        //         .catch(function(error) {
        //             return Promise.reject(error.response.data);
        //         });
        // },
        updateDomain: (context, data) => {
            return axios
                .put("yuanyang/domains/" + data.id, data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },

        // updateiRouteCDN: (context, data) => {
        //     return axios
        //         .put(
        //             "yuanyang/domains/" +
        //                 data.domain_id +
        //                 "/iRouteCDN/" +
        //                 data.id,
        //             {
        //                 continent_id: data.continent_id,
        //                 country_id: data.country_id,
        //                 network_id: data.network_id,
        //                 cdn_id: data.cdn_id
        //             }
        //         )
        //         .then(function(response) {
        //             return Promise.resolve(response.data);
        //         })
        //         .catch(function(error) {
        //             return Promise.reject(error.response.data);
        //         });
        // },
        batchNewDomainsAndCdns: (context, data) => {
            return axios
                .post("yuanyang/domains/batch", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newDomain: (context, data) => {
            return axios
                .post("yuanyang/domains", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        deleteDomain: (context, id) => {
            return axios
                .delete("yuanyang/domains/" + id)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        }
        // getContinentList: context => {
        //     return axios
        //         .get("yuanyang/continents")
        //         .then(function(response) {
        //             return Promise.resolve(response.data);
        //         })
        //         .catch(function(error) {
        //             return Promise.reject(error.response.data);
        //         });
        // },
        // getCountriesList: context => {
        //     return axios
        //         .get("yuanyang/countries")
        //         .then(function(response) {
        //             return Promise.resolve(response.data);
        //         })
        //         .catch(function(error) {
        //             return Promise.reject(error.response.data);
        //         });
        // }
    }
};
