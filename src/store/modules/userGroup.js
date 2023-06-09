import axios from "axios";

export default {
    namespaced: true,
    state: {
        users: []
    },
    getters: {},
    mutations: {
        updateUsers: (state, users) => {
            state.users = users;
        }
    },
    actions: {
        getAll: context => {
            return axios
                .get("yuanyang_user_module/userGroups")
                .then(function(response) {
                    response.data.data.forEach((obj, idx) => {
                        obj.status = obj.deleted_at == null ? true : false;
                    });
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getById: (context, id) => {
            return axios
                .get("yuanyang_user_module/userGroups/" + id)
                .then(function(response) {
                    response.data.data.status =
                        response.data.data.deleted_at == null ? true : false;
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateUserGroup: (context, data) => {
            return axios
                .put("yuanyang_user_module/userGroups/" + data.id, {
                    name: data.name,
                    unique_id: data.unique_id
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateUserGroupPin: (context, data) => {
            return axios
                .post("yuanyang/domain-pin", {
                    user_group_id: data.user_group_id,
                    name: data.pin
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },

        updateGroupStatus: (context, data) => {
            return axios
                .put("yuanyang_user_module/userGroups/" + data.id + "/status", {
                    status: data.status
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newUserGroup: (context, data) => {
            return axios
                .post("yuanyang_user_module/userGroups", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newUserToGroup: (context, data) => {
            return axios
                .post(
                    "yuanyang_user_module/user/" +
                        data.uid +
                        "/role/" +
                        data.chooseRoleId
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        removeUserFromGroup: (context, data) => {
            return axios
                .delete(
                    "yuanyang_user_module/user/" +
                        data.uid +
                        "/role/" +
                        data.role.id
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
