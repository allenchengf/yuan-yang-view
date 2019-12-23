import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getRolesByGroupId: (context, ugid) => {
            return axios
                .get("yuanyang_user_module/role?user_group_id=" + ugid)
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

        newRole: (context, data) => {
            return axios
                .post("yuanyang_user_module/role", data)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateRole: (context, data) => {
            return axios
                .patch("yuanyang_user_module/role/" + data.id, {
                    name: data.name
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        deleteRole: (context, roleId) => {
            return axios
                .delete("yuanyang_user_module/role/" + roleId)
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        }
    }
};
