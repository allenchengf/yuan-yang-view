<template lang="pug">
    v-container#configBackup.grid-list-lg
        v-layout(wrap column)
            v-flex(xs12)
                .title Config Backup
            v-flex(xs12)
                v-card
                    v-card-title
                        v-spacer
                        v-btn.my-0(color="primary" @click="getData") Backup 
                            v-icon(small right) backup
                        v-btn.my-0(color="primary" @click="importData" :disabled="action == false") Restore 
                            v-icon(small right) settings_backup_restore
                            input.d-none(ref="file" type="file" @change="handleFileUpload()")
</template>
<script>
import saveAs from "file-saver";
import timeUtils from "../../../utils/timeUtils.js";

export default {
    mixins: [timeUtils],
    data() {
        return {
            importJsonData: [],
            rawData: [],
            accountPermission: [],
            action: false
        };
    },
    methods: {
        getData() {
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
                "configData" +
                timeUtils.methods.timestampToString(
                    new Date().getTime() / 1000
                ) +
                ".json";
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
                alert("Please upload a valid json file.");
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
        },
        actionControl() {
            var actions = this.accountPermission.filter(item => {
                return item.permission.name == "Config Backup";
            });
            if (actions.create == 1) {
                this.action = true;
            } else {
                this.action = false;
            }
        }
    },
    mounted() {
        this.accountPermission = this.$store.getters["permission/permission"]();
        this.actionControl();
    }
};
</script>