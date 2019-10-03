import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getAllNetworks: context => {
            return axios
                .get("yuanyang/networks")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getNetworks: (context, id) => {
            var url = "yuanyang/schemes/" + id + "/networks";
            return axios
                .get(url)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newLine: (context, data) => {
            return axios
                .post("yuanyang/lines", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateLine: (context, data) => {
            return axios
                .put("yuanyang/lines/" + data.id, data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        deleteLine: (context, data) => {
            return axios
                .delete("yuanyang/lines/" + data.id)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getSchemes: context => {
            return axios
                .get("yuanyang/schemes")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getContinents: context => {
            return axios
                .get("yuanyang/continents")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getCountries: context => {
            return axios
                .get("yuanyang/countries")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        }
    }
};
