import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getLogsData: (context, permission_id) => {
            return axios
                .get("yuanyang/operation_log", {
                    headers: { "permission-id": permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getCategoryList: (context, permission_id) => {
            return axios
                .get("yuanyang/operation_log/category-list", {
                    headers: { "permission-id": permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getLogsByDomain: (context, permission_id) => {
            return axios
                .get(
                    "yuanyang/operation_log/category/Domain?current_page=1&per_page=10",
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
