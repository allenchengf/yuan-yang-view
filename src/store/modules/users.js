import Vue from "vue";
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
                .get("yuanyang_user_module/users?user_group_id=0")
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
        getUsers: context => {
            return axios
                .get("yuanyang_user_module/users")
                .then(function(response) {
                    response.data.data.forEach((obj, idx) => {
                        obj.status = obj.deleted_at == null ? true : false;
                    });
                    context.commit("updateUsers", response.data.data);
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getUsersByGroup: (context, data) => {
            return axios
                .get(
                    "yuanyang_user_module/users?user_group_id=" + data.groupId,
                    {
                        headers: { "permission-id": data.permission_id }
                    }
                )
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

        getUserProfile: (context, uid) => {
            return axios
                .get("yuanyang_user_module/users/" + uid + "/profile")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateUserProfile: (context, data) => {
            return axios
                .put(
                    "yuanyang_user_module/users/" + data.uid + "/profile",
                    data,
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
        newUserRole: (context, data) => {
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
        updateUserRole: (context, data) => {
            return axios
                .patch(
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
        updateUserStatus: (context, data) => {
            return axios
                .put(
                    "yuanyang_user_module/users/" + data.uid + "/status",
                    data,
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
        newUser: (context, data) => {
            return axios
                .post("yuanyang_user_module/users", data, {
                    headers: { "permission-id": data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        forgotPassword: (context, data) => {
            return axios
                .post(
                    "yuanyang_user_module/password/email",
                    { email: data.email },
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
