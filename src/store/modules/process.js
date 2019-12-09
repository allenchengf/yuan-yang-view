import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getProcess: (context, ugid) => {
            return axios
                .get(
                    "yuanyang/process?function_name=batchCreateDomainAndCdn&user_group_id=" +
                        ugid
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getProcessResult: context => {
            return axios
                .get(
                    "yuanyang/process/result?function_name=batchCreateDomainAndCdn"
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
