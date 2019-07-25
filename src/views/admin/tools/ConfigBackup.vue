<template lang="pug">
    v-container#configBackup
        v-layout(wrap column)
            v-flex(xs12)
                .title.text-xs-left.mb-4 Config Backup
            v-flex(xs12)
                v-card
                    v-card-title
                        v-spacer
                        v-btn.my-0(color="primary" @click="getData") Backup 
                            v-icon(small right) backup
                        v-btn.my-0(color="primary" @click="importData") Restore 
                            v-icon(small right) settings_backup_restore
                            input.d-none(ref="file" type="file" @change="handleFileUpload()")
</template>
<script>
import saveAs from "file-saver";

export default {
    data() {
        return {
            importJsonData: [],
            rawData: [
                {
                    id: 1,
                    user_group_id: 1,
                    name: "yuan1.test.com",
                    cname: "yuan1testcom.1",
                    label: "yuan",
                    edited_by: "07e9f87f-457f-45d0-8652-6845a3961b33",
                    cdns: [
                        {
                            id: 1,
                            domain_id: 1,
                            cdn_provider_id: 1,
                            provider_record_id: 437696831,
                            cname: "yuan1.cdn1.com",
                            edited_by: "07e9f87f-457f-45d0-8652-6845a3961b33",
                            default: true
                        },
                        {
                            id: 2,
                            domain_id: 1,
                            cdn_provider_id: 2,
                            provider_record_id: 0,
                            cname: "yuan1.cdn2.com",
                            edited_by: "07e9f87f-457f-45d0-8652-6845a3961b33",
                            default: false
                        }
                    ],
                    cdn_provider: [
                        {
                            id: 1,
                            name: "Hiero7",
                            status: true,
                            user_group_id: 1,
                            ttl: 428967,
                            cdns: {
                                domain_id: 1,
                                cdn_provider_id: 1,
                                id: 1,
                                cname: "yuan1.cdn1.com",
                                default: 1,
                                created_at: "2019-07-11 09:55:09",
                                updated_at: "2019-07-11 09:55:09"
                            }
                        },
                        {
                            id: 2,
                            name: "Cloudflare",
                            status: true,
                            user_group_id: 1,
                            ttl: 470050,
                            cdns: {
                                domain_id: 1,
                                cdn_provider_id: 2,
                                id: 2,
                                cname: "yuan1.cdn2.com",
                                default: 0,
                                created_at: "2019-07-11 09:55:19",
                                updated_at: "2019-07-11 09:55:19"
                            }
                        }
                    ],
                    location_dns_settings: [
                        {
                            id: 1,
                            provider_record_id: 437698040,
                            location_networks_id: 1,
                            cdn_id: 2,
                            edited_by: "07e9f87f-457f-45d0-8652-6845a3961b33",
                            created_at: "2019-07-11 09:59:53",
                            updated_at: null,
                            domain_id: 1
                        },
                        {
                            id: 2,
                            provider_record_id: 437698164,
                            location_networks_id: 2,
                            cdn_id: 2,
                            edited_by: "07e9f87f-457f-45d0-8652-6845a3961b33",
                            created_at: "2019-07-11 10:00:48",
                            updated_at: null,
                            domain_id: 1
                        }
                    ],
                    domain_group: [
                        {
                            id: 1,
                            user_group_id: 1,
                            name: "Group1",
                            label: "Label",
                            edited_by: "07e9f87f-457f-45d0-8652-6845a3961b33",
                            domain_group_mapping: {
                                domain_id: 1,
                                domain_group_id: 1
                            }
                        }
                    ]
                },
                {
                    id: 2,
                    user_group_id: 1,
                    name: "yuan2.test.com",
                    cname: "yuan2testcom.1",
                    label: "yuan",
                    edited_by: "07e9f87f-457f-45d0-8652-6845a3961b33",
                    cdns: [],
                    cdn_provider: [],
                    location_dns_settings: [],
                    domain_group: []
                }
            ]
        };
    },
    methods: {
        getData() {
            // console.log(this.rawData);

            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("config/getConfigData")
                .then(
                    function(result) {
                        this.rawData = result.data;
                        this.exportData();
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                    }.bind(this)
                );
        },
        exportData() {
            var fileName =
                "configData" + new Date().toLocaleDateString() + ".json";
            var fileToSave = new Blob([JSON.stringify(this.rawData)], {
                type: "application/json",
                name: fileName
            });
            saveAs(fileToSave, fileName);
            this.$store.dispatch(
                "global/showSnackbarSuccess",
                "Export Config Success!"
            );
        },
        importData() {
            this.$refs.file.click();
        },
        handleFileUpload() {
            var vm = this;
            var fileUpload = this.$refs.file;
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.json)$/;
            if (regex.test(fileUpload.value.toLowerCase())) {
                if (typeof FileReader != "undefined") {
                    var reader = new FileReader();
                    if (reader.readAsBinaryString) {
                        reader.onload = function(e) {
                            vm.uploadData(e.target.result);
                        };
                        reader.readAsBinaryString(fileUpload.files[0]);
                    } else {
                        reader.onload = function(e) {
                            var data = "";
                            var bytes = new Uint8Array(e.target.result);
                            for (var i = 0; i < bytes.byteLength; i++) {
                                data += String.fromCharCode(bytes[i]);
                            }
                            vm.ProcessExcel(data);
                        };
                        reader.readAsArrayBuffer(fileUpload.files[0]);
                    }
                } else {
                    alert("This browser does not support HTML5.");
                }
            } else {
                alert("Please upload a valid Excel file.");
            }
        },
        uploadData(data) {
            // console.log(data);
            this.importJsonData = data;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch(
                    "config/importConfigData",
                    JSON.parse(this.importJsonData)
                )
                .then(
                    function(result) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Import Config Success!"
                        );
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                    }.bind(this)
                );
        }
    },
    mounted() {}
};
</script>