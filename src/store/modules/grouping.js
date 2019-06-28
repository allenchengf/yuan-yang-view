import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getAllGroups: context => {
            return axios
                .get("yuanyang/groups")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getGroupById: (context, id) => {
            return axios
                .get("yuanyang/groups/" + id)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getGroupIRouteCdn: (context, id) => {
            return axios
                .get("yuanyang/groups/" + id + "/iRoute")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateGroup: (context, data) => {
            return axios
                .put("yuanyang/groups/" + data.id, data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        changeGroupCdnProvider: (context, data) => {
            return axios
                .put("yuanyang/groups/" + data.groupId + "/defaultCdn", {
                    cdn_provider_id: data.defaultCdnId
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newGroup: (context, data) => {
            return axios
                .post("yuanyang/groups", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newDomainByGroupId: (context, data) => {
            return axios
                .post("yuanyang/groups/" + data.groupId, {
                    domain_id: data.domainId
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        deleteGroup: (context, id) => {
            return axios
                .delete("yuanyang/groups/" + id)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        deleteDomainFromGroup: (context, data) => {
            return axios
                .delete(
                    "yuanyang/groups/" + data.groupId + "/domain/" + data.id
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
