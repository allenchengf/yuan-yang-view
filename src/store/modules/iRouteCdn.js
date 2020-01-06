import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getDomainIRouteCDNs: (context, data) => {
            // console.log(data);
            return axios
                .get("yuanyang/domains/" + data.id + "/routing-rules", {
                    headers: { permission_id: data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getIRouteCdnList: (context, permission_id) => {
            return axios
                .get("yuanyang/routing-rules/lists", {
                    headers: { permission_id: permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getAllIRouteCdn: (context, permission_id) => {
            return axios
                .get("yuanyang/routing-rules/all", {
                    headers: { permission_id: permission_id }
                })
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
            // console.log(data);
            return axios
                .put(
                    "yuanyang/domains/" +
                        data.domainId +
                        "/routing-rules/" +
                        data.id,
                    {
                        cdn_provider_id: data.cdn.cdn_provider_id
                    },
                    {
                        headers: { permission_id: data.permission_id }
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
                    },
                    {
                        headers: { permission_id: data.permission_id }
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
