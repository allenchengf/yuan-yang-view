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
                .get("user_module/users?user_group_id=0")
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
                .get("user_module/users")
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
        getUsersByGroup: (context, groupId) => {
            return axios
                .get("user_module/users?user_group_id=" + groupId)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },

        getUserProfile: (context, uid) => {
            return axios
                .get("user_module/users/" + uid + "/profile")
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateUserProfile: (context, data) => {
            return axios
                .put("user_module/users/" + data.uid + "/profile", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateUserRole: (context, data) => {
            return axios
                .patch("user_module/users/" + data.uid + "/level", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateUserStatus: (context, data) => {
            return axios
                .put("user_module/users/" + data.uid + "/status", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        newUser: (context, data) => {
            return axios
                .post("user_module/users", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        forgotPassword: (context, email) => {
            return axios
                .post("user_module/password/email", { email: email })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        }
    }
};
