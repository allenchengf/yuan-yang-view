import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getConfigList: (context, permission_id) => {
            return axios
                .get("yuanyang/config/s3", {
                    headers: { "permission-id": permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getConfigData: (context, permission_id) => {
            return axios
                .get("yuanyang/config", {
                    headers: { "permission-id": permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getConfigDataByKey: (context, data) => {
            return axios
                .get("yuanyang/config/s3/" + data.key, {
                    headers: { "permission-id": data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        importConfigData: (context, data) => {
            return axios
                .post("yuanyang/config", data, {
                    headers: { "permission-id": data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        importConfigDataByKey: (context, data) => {
            return axios
                .put(
                    "yuanyang/config/s3/" + data.key,
                    {},
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
        createConfig: (context, permission_id) => {
            return axios
                .post(
                    "yuanyang/config/s3",
                    {},
                    {
                        headers: { "permission-id": permission_id }
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
