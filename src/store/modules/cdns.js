import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getCDNsByDomainId: (context, id) => {
            return axios
                .get("yuanyang/domains/" + id + "/cdn")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateDefaultCDN: (context, data) => {
            return axios
                .patch(
                    "yuanyang/domains/" +
                        data.domain_id +
                        "/cdn/" +
                        data.id +
                        "/default",
                    { default: data.default }
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateCdnCname: (context, data) => {
            return axios
                .patch(
                    "yuanyang/domains/" +
                        data.domain_id +
                        "/cdn/" +
                        data.id +
                        "/cname",
                    { cname: data.cname }
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newCDN: (context, data) => {
            return axios
                .post("yuanyang/domains/" + data.domain_id + "/cdn", {
                    cdn_provider_id: data.cdn_provider_id,
                    cname: data.cname
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        deleteCDN: (context, data) => {
            return axios
                .delete(
                    "yuanyang/domains/" + data.domain_id + "/cdn/" + data.id
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
