import Vue from "vue";
import axios from "axios";

export default {
    namespaced: true,
    state: {},
    getters: {},
    mutations: {},
    actions: {
        getScanProvider: context => {
            return axios
                .get("yuanyang/scan-platform")
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
                    { cdn_provider_id: data.cdn_provider_id }
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
                .put("yuanyang/scan-platform/routing-rules/" + data.id, {
                    old_cdn_provider_id: data.old_cdn_provider_id,
                    new_cdn_provider_id: data.new_cdn_provider_id
                })
                .then(function(response) {
                    return Promise.resolve(response.data);
                })
                .catch(function(error) {
                    return Promise.reject(error.response.data);
                });
        }
    }
};
