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
    },
    // -----------------------------------------------------------------
    actions: {
        getProfile: context => {
            return axios
                .get("user_module/users/self")
                .then(function(response) {
                    context.commit("updateAccountInfo", response.data.data);
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
                "/logout?message=" + "sign out success." + "&type=success"
            );

            // return axios
            //     .get("user_module/logout")
            //     .then(function(response) {
            //         context.commit("updateAccountInfo", null);
            //         localStorage.removeItem("token");
            //         localStorage.removeItem("user");
            //         return Promise.resolve(response.data);
            //     })
            //     .catch(function(error) {
            //         return Promise.reject(error.response.data);
            //     });
        }
    }
};
