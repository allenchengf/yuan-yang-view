import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getContinentList: context => {
            return axios
                .get("yuanyang/continents")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getCountriesList: context => {
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
