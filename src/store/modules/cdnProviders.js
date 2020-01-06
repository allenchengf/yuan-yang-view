import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getAllCdnProvider: (context, permission_id) => {
            return axios
                .get("yuanyang/cdn_providers", {
                    headers: {
                        "permission-id": permission_id
                    }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        changeCdnProviderStatus: (context, data) => {
            return axios
                .patch(
                    "yuanyang/cdn_providers/" + data.id + "/status",
                    {
                        status: data.status
                    },
                    {
                        headers: { "permission-id": data.permission_id }
                    }
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        changeCdnProviderScannable: (context, data) => {
            return axios
                .patch(
                    "yuanyang/cdn_providers/" + data.id + "/scannable",
                    {
                        scannable: data.scannable
                    },
                    {
                        headers: { "permission-id": data.permission_id }
                    }
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        changeCdnProviderDefault: (context, data) => {
            return axios
                .patch("yuanyang/cdn_providers/" + data.id + "/change", {
                    headers: { "permission-id": data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateCdnProvider: (context, data) => {
            return axios
                .patch("yuanyang/cdn_providers/" + data.id, data, {
                    headers: { "permission-id": data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newCdnProvider: (context, data) => {
            return axios
                .post("yuanyang/cdn_providers", data, {
                    headers: { "permission-id": data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        checkCdnProvider: (context, data) => {
            return axios
                .get("yuanyang/cdn_providers/" + data.id + "/check", {
                    headers: { "permission-id": data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        deleteCdnProvider: (context, data) => {
            return axios
                .delete("yuanyang/cdn_providers/" + data.id, {
                    headers: { "permission-id": data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        }
    }
};
