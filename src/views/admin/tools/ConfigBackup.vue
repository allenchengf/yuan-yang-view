<template lang="pug">
    v-container#configBackup.grid-list-lg
        v-layout(wrap column)
            v-flex(xs12)
                .title Config Backup
            //- v-flex(xs12)
            //-     v-card
            //-         v-card-title
            //-             v-spacer
            //-             v-btn.my-0(color="primary" @click="getData") Backup 
            //-                 v-icon(small right) backup
            //-             v-btn.my-0(color="primary" @click="importData" :disabled="action == false") Restore 
            //-                 v-icon(small right) settings_backup_restore
            //-                 input.d-none(ref="file" type="file" @change="handleFileUpload()")
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading Config Backup
                        v-spacer
                        v-btn.my-0(color="primary" @click="dialog.edit = true") Schedule
                        v-btn.my-0(color="primary" @click="getData") Backup
                    v-divider                    
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    h7-data-table(:headers="headers" :items="items" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" )
                        template(slot="items" slot-scope="{props, index}")
                            tr
                                td.text-xs-left {{ index}}
                                td.text-xs-left {{ props.item.created_at }}
                                td.text-xs-left
                                    v-btn.ma-0(flat icon small color="primary" @click="downloadData(props.item)" title="download")
                                        v-icon(small) cloud_download
                                    v-btn.ma-0(flat icon small color="primary" @click="restoreData(props.item)" title="restore")
                                        v-icon(small) settings_backup_restore
        v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
            v-card
                v-card-title.title Setting schedule of backup
                v-card-text
                    v-menu(ref="scheduleTimeMenu" v-model="scheduleTimeMenu" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="290px" :return-value.sync="scheduleTime")
                        template(v-slot:activator="{ on }")
                            v-text-field(v-model="scheduleTime" label="Schedule Time"  readonly v-on="on" :rules="[rules.required]")
                        v-time-picker(v-if="scheduleTimeMenu" v-model="scheduleTime" @click:minute="$refs.scheduleTimeMenu.save(scheduleTime)")
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                    v-btn(color="primary" flat="flat" @click="updateSchedule") Save

</template>
<script>
import saveAs from "file-saver";
import timeUtils from "../../../utils/timeUtils.js";
import textFieldRules from "../../../utils/textFieldRules";

export default {
    mixins: [timeUtils, textFieldRules],
    data() {
        return {
            scheduleTimeMenu: false,
            scheduleTime: "15:35",
            dialog: {
                edit: false
            },
            items: [],
            searchText: "",
            importJsonData: [],
            rawData: [],
            accountPermission: [],
            action: false,
            permission: [],
            permission_id: 0,
            headers: [
                {
                    key: "id",
                    text: "#",
                    align: "left",
                    sortable: true,
                    width: "40px",
                    auth: 0,
                    control: true,
                    searchable: false,
                    value: "id"
                },
                {
                    key: "time",
                    text: "Time",
                    align: "left",
                    sortable: true,
                    auth: 0,
                    control: true,
                    searchable: true,
                    value: "created_at"
                },
                {
                    key: "action",
                    text: "Action",
                    align: "left",
                    value: "",
                    width: "120px",
                    auth: 0,
                    control: false,
                    searchable: false,
                    sortable: true
                }
            ],
            scheduleId: 0
        };
    },
    watch: {
        scheduleTime: function(value) {
            // console.log(value);
        }
    },
    methods: {
        getConfigList() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("config/getConfigList", this.permission_id)
                .then(
                    function(result) {
                        this.items = result.data;
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
        getBackupTime() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("backup/getSelfBackup", this.permission_id)
                .then(
                    function(result) {
                        // console.log(result.data);
                        this.scheduleTime = result.data.backedup_at;
                        this.scheduleId = result.data.id;
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
        updateSchedule() {
            // console.log(this.scheduleTime);
            var scheduleData = {
                backedup_hour: 0,
                backedup_minute: 0
            };
            scheduleData.permission_id = this.permission_id;
            scheduleData.id = this.scheduleId;
            scheduleData.backedup_hour = parseInt(
                this.scheduleTime.split(":")[0]
            );
            scheduleData.backedup_minute = parseInt(
                this.scheduleTime.split(":")[1]
            );
            // console.log(scheduleData);

            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("backup/updateBackup", scheduleData)
                .then(
                    function(result) {
                        this.closeEditDialog();
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Update backup schedule success!"
                        );
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
        downloadData(data) {
            // console.log(data);
            data.permission_id = this.permission_id;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("config/getConfigDataByKey", data)
                .then(
                    function(result) {
                        this.rawData = result.data;
                        this.exportData();
                        // this.getConfigList();
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
        restoreData(data) {
            // console.log(data);
            data.permission_id = this.permission_id;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("config/importConfigDataByKey", data)
                .then(
                    function(result) {
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
        getData() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("config/getConfigData", this.permission_id)
                .then(
                    function(result) {
                        this.rawData = result.data;
                        this.exportData();
                        this.getConfigList();
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
            this.importJsonData = JSON.parse(data);
            this.importJsonData.permission_id = this.permission_id;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("config/importConfigData", this.importJsonData)
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
            // console.log(actions);

            if (actions[0].actions.create == 1) {
                this.action = true;
            } else {
                this.action = false;
            }
            // console.log(this.action);
        },
        checkPagePermission() {
            this.permission = JSON.parse(localStorage.getItem("permission"));

            this.permission.forEach((o, i) => {
                if (o.permission.name == this.$route.meta.sideBar) {
                    this.permission_id = o.permission.id;
                }
            });
            // console.log(this.permission_id);
        },
        closeEditDialog: function() {
            this.dialog.edit = false;
        }
    },
    mounted() {
        this.accountPermission = this.$store.getters["permission/permission"]();
        this.actionControl();
        this.getConfigList();
        this.getBackupTime();
    },
    created() {
        this.checkPagePermission();
    }
};
</script>