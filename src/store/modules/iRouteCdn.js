import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getDomainIRouteCDNs: (context, id) => {
            return axios
                .get("yuanyang/domains/" + id + "/routing-rules")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getIRouteCdnList: context => {
            return axios
                .get("yuanyang/routing-rules/lists")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getAllIRouteCdn: context => {
            return axios
                .get("yuanyang/routing-rules/all")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getAllIRouteCdnByGroup: (context, data) => {
            return axios
                .get(
                    "yuanyang/routing-rules/groups?current_page=" +
                        data.current_page +
                        "&per_page=" +
                        data.per_page
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getAllIRouteCdnByDomain: (context, data) => {
            return axios
                .get(
                    "yuanyang/routing-rules/domains?current_page=" +
                        data.current_page +
                        "&per_page=" +
                        data.per_page
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateDomainIRouteCDN: (context, data) => {
            return axios
                .put(
                    "yuanyang/domains/" +
                        data.domainId +
                        "/routing-rules/" +
                        data.id,
                    {
                        cdn_provider_id: data.cdn.cdn_provider_id
                    }
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateGroupIRouteCDN: (context, data) => {
            return axios
                .put(
                    "yuanyang/groups/" +
                        data.groupId +
                        "/routing-rules/" +
                        data.id,
                    {
                        cdn_provider_id: data.cdn.cdn_provider_id
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
