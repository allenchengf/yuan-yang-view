import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getSelfBackup: (context, permission_id) => {
            return axios
                .get("yuanyang/backups/self", {
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
        updateBackup: (context, data) => {
            return axios
                .put("yuanyang/backups", data, {
                    headers: {
                        "permission-id": data.permission_id
                    }
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
