import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getCDNsByDomainId: (context, data) => {
            return axios
                .get("yuanyang/domains/" + data.id + "/cdn", {
                    headers: { "permission-id": data.permission_id }
                })
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
                    { default: data.default },
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
        updateCdnCname: (context, data) => {
            return axios
                .patch(
                    "yuanyang/domains/" +
                        data.domain_id +
                        "/cdn/" +
                        data.id +
                        "/cname",
                    { cname: data.cname },
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
        newCDN: (context, data) => {
            return axios
                .post(
                    "yuanyang/domains/" + data.domain_id + "/cdn",
                    {
                        cdn_provider_id: data.cdn_provider_id,
                        cname: data.cname
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
        deleteCDN: (context, data) => {
            return axios
                .delete(
                    "yuanyang/domains/" + data.domain_id + "/cdn/" + data.id,
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
        }
    }
};
