import axios from "axios";

export default {
    namespaced: true,
    state: {
        // permission: []
    },
    getters: {
        permission: state => () => {
            var permission = JSON.parse(localStorage.getItem("permission"));
            return permission;
        }
    },
    mutations: {
        updateSelfPermission: (state, permission) => {
            Vue.set(state, "permission", permission);
        }
    },
    actions: {
        async getSelfPermission(context) {
            try {
                await axios
                    .get("yuanyang/roles/self/permissions")
                    .then(function(response) {
                        var permission = response.data.data;
                        localStorage.setItem(
                            "permission",
                            JSON.stringify(permission)
                        );
                        context.commit(
                            "updateSelfPermission",
                            response.data.data
                        );
                        return Promise.resolve(response.data);
                    })
                    .catch(function(error) {
                        return Promise.reject(error.response.data);
                    });
            } catch (err) {}
        },
        getAllPermission: (context, permission_id) => {
            return axios
                .get("yuanyang/permissions", {
                    headers: { "permission-id": permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getRolePermissionByRoleId: (context, data) => {
            return axios
                .get("yuanyang/roles/" + data.roleId + "/permissions", {
                    headers: { "permission-id": data.permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        updateRolePermission: (context, data) => {
            return axios
                .post(
                    "yuanyang/roles/" + data.roleId + "/permissions",
                    {
                        permissions: data.permissions
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
        }
    }
};
