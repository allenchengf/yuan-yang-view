import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getAllCdnProvider: context => {
            return axios
                .get("yuanyang/cdn_providers")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        changeCdnProviderStatus: (context, data) => {
            return axios
                .patch("yuanyang/cdn_providers/" + data.id + "/status", {
                    status: data.status
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        changeCdnProviderDefault: (context, data) => {
            return axios
                .patch("yuanyang/cdn_providers/" + data.id + "/change")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateCdnProvider: (context, data) => {
            return axios
                .patch("yuanyang/cdn_providers/" + data.id, data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newCdnProvider: (context, data) => {
            return axios
                .post("yuanyang/cdn_providers", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        checkCdnProvider: (context, id) => {
            return axios
                .get("yuanyang/cdn_providers/" + id + "/check")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        }
    }
};
