import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getAllGroups: (context, permission_id) => {
            return axios
                .get("yuanyang/groups", {
                    headers: { permission_id: permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getGroupById: (context, data) => {
            return axios
                .get("yuanyang/groups/" + data.id, {
                    headers: { permission_id: data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.request.status);
                });
        },
        getGroupIRouteCdn: (context, data) => {
            return axios
                .get("yuanyang/groups/" + data.id + "/routing-rules", {
                    headers: { permission_id: data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateGroup: (context, data) => {
            return axios
                .put("yuanyang/groups/" + data.id, data, {
                    headers: { permission_id: data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        changeGroupCdnProvider: (context, data) => {
            return axios
                .put(
                    "yuanyang/groups/" + data.groupId + "/defaultCdn",
                    {
                        cdn_provider_id: data.defaultCdnId
                    },
                    {
                        headers: { permission_id: data.permission_id }
                    }
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newGroup: (context, data) => {
            return axios
                .post("yuanyang/groups", data, {
                    headers: { permission_id: data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newDomainByGroupId: (context, data) => {
            return axios
                .post(
                    "yuanyang/groups/" + data.groupId,
                    {
                        domain_id: data.domainId
                    },
                    {
                        headers: { permission_id: data.permission_id }
                    }
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        batchNewDomainByGroupId: (context, data) => {
            return axios
                .post("yuanyang/groups/" + data.groupId + "/batch", data.data, {
                    headers: { permission_id: data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        deleteGroup: (context, data) => {
            return axios
                .delete("yuanyang/groups/" + data.id, {
                    headers: { permission_id: data.permission_id }
                })
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
                    "yuanyang/groups/" + data.groupId + "/domain/" + data.id,
                    {
                        headers: { permission_id: data.permission_id }
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
