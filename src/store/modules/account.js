import Vue from "vue";
import axios from "axios";
import router from "../../router";

export default {
    namespaced: true,
    // -----------------------------------------------------------------
    state: {
        userType: {
            hiero7: {
                auth: 2
            },
            admin: {
                auth: 1
            },
            user: {
                auth: 0
            }
        },
        account: {}
    },
    // -----------------------------------------------------------------
    getters: {
        // getters and computed props on the users data
        account: state => () => {
            var user = JSON.parse(localStorage.getItem("user"));
            return user;
        },
        accountId: state => () => {
            var user = JSON.parse(localStorage.getItem("user"));
            return user.uid;
        },
        accountAuth: state => () => {
            var user = JSON.parse(localStorage.getItem("user"));
            if (user.user_group_id == 1) {
                user["user_type"] = "hiero7";
            } else if (user.user_group_id != 1 && user.level == 1) {
                user["user_type"] = "admin";
            } else {
                user["user_type"] = "user";
            }
            var type = user.user_type;
            return state.userType[type].auth;
        },
        accountGroupId: state => () => {
            var user = JSON.parse(localStorage.getItem("user"));
            return user.user_group_id;
        }
    },
    // -----------------------------------------------------------------
    mutations: {
        // stuff to set users data locally
        updateAccountInfo: (state, account) => {
            Vue.set(state, "account", account);
            localStorage.setItem("user", JSON.stringify(account));
        },
        updateAccountToken: (state, token) => {
            localStorage.setItem("token", token);
        }
        // updateAccountAuth: (state, auth) => {
        //     Vue.set(state, "auth", auth);
        //     localStorage.setItem("auth", JSON.stringify(auth));
        // }
    },
    // -----------------------------------------------------------------
    actions: {
        login: (context, account) => {
            return axios
                .post("yuanyang_user_module/login", account)
                .then(function(response) {
                    if (!response.data.data.google2fa) {
                        // console.log(response.data.data.user)
                        response.data.data.user.user_group_mapping.name =
                            response.data.data.user.name;
                        context.commit(
                            "updateAccountInfo",
                            response.data.data.user.user_group_mapping
                        );
                        context.commit(
                            "updateAccountToken",
                            response.data.data.token
                        );
                    }
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getProfile: context => {
            return axios
                .get("yuanyang_user_module/users/self")
                .then(function(response) {
                    context.commit("updateAccountInfo", response.data.data);
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        forgotPassword: (context, email) => {
            return axios
                .post("yuanyang_user_module/password/email", { email: email })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        resetPassword: (context, data) => {
            return axios
                .post("yuanyang_user_module/password/reset", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateProfile: (context, data) => {
            return axios
                .put(
                    "yuanyang_user_module/users/" +
                        context.getters.accountId() +
                        "/profile",
                    data
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updatePassword: (context, data) => {
            return axios
                .put(
                    "yuanyang_user_module/users/" +
                        context.getters.accountId() +
                        "/password",
                    data
                )
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateToken: (context, token) => {
            context.commit("updateAccountToken", token);
        },
        logout: context => {
            context.commit("updateAccountInfo", null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // router push to login page
            router.push(
                "/login?message=" + "sign in success." + "&type=success"
            );
        }
    }
};
