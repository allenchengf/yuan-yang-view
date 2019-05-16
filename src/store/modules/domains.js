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
        getAllDomains: context => {
            return axios
                .get("yuanyang/domains")
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
        getAllCDNs: (context, id) => {
            return axios
                .get("yuanyang/domains/" + id + "/cdn")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
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
        updateCDN: (context, data) => {
            return axios
                .put(
                    "yuanyang/domains/" + data.domain_id + "/cdn/" + data.id,
                    data
                )
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
                    data
                )
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
        newCDN: (context, data) => {
            return axios
                .post("yuanyang/domains/" + data.domain_id + "/cdn", data)
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
        },
        deleteCDN: (context, data) => {
            return axios
                .delete(
                    "yuanyang/domains/" + data.domain_id + "/cdn/" + data.id
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
