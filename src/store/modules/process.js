import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getProcess: (context, data) => {
            return axios
                .get(
                    "yuanyang/process?function_name=batchCreateDomainAndCdn&user_group_id=" +
                        data.ugid,
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
        getProcessResult: (context, permission_id) => {
            return axios
                .get(
                    "yuanyang/process/result?function_name=batchCreateDomainAndCdn",
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
