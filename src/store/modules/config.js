import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getConfigData: (context, permission_id) => {
            return axios
                .get("yuanyang/config", {
                    headers: { permission_id: permission_id }
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
                    headers: { permission_id: data.permission_id }
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
