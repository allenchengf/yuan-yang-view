import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getScanProvider: (context, permission_id) => {
            return axios
                .get("yuanyang/scan-platform", {
                    headers: { "permission-id": permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        // getLastTimeScanData: (context, data) => {
        //     return axios
        //         .get(
        //             "yuanyang/scan-platform/" +
        //                 data.scan_platform +
        //                 "/scanned-data?cdn_provider_id=" +
        //                 data.cdn_provider_id
        //         )
        //         .then(function(response) {
        //             return Promise.resolve(response.data);
        //         })
        //         .catch(function(error) {
        //             return Promise.reject(error.response.data);
        //         });
        // },
        getLastTimeScanData: (context, permission_id) => {
            return axios
                .get("yuanyang/scan-platform/scanned-data", {
                    headers: { "permission-id": permission_id }
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        },
        getScanData: (context, data) => {
            return axios
                .post(
                    "yuanyang/scan-platform/" +
                        data.scan_platform +
                        "/scanned-data",
                    {
                        cdn_provider_id: data.cdn_provider_id,
                        scanned_at: data.scanned_at
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
        updateRoutingRules: (context, data) => {
            return axios
                .put(
                    "yuanyang/scan-platform/routing-rules/" + data.id,
                    {
                        old_cdn_provider_id: data.old_cdn_provider_id,
                        new_cdn_provider_id: data.new_cdn_provider_id
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
        changeAllCdnProvider: (context, permission_id) => {
            return axios
                .put(
                    "yuanyang/scan-platform/change-all",
                    {},
                    {
                        headers: { "permission-id": permission_id }
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
