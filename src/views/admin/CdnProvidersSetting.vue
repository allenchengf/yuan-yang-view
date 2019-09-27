<template lang="pug">
    v-container#cdnProvidersSetting.grid-list-lg
        v-layout(wrap)
            v-flex(xs12)
                .title CDN Providers
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading CDN Providers
                        v-spacer
                        v-btn.my-0(color="primary" @click="addItem") Add CDN Provider
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    h7-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line )
                        template(slot="items" slot-scope="{props, index}")
                            tr
                                td {{ index }}
                                td {{ props.item.name }}
                                td {{ props.item.ttl }}
                                td {{ props.item.url }}
                                td
                                    v-switch(color="primary" v-model="props.item.scannable" @change="switchScannable(props.item)" hide-details)
                                td
                                    v-switch(color="primary" v-model="props.item.status" @change="switchAction(props.item)" hide-details)
                                td
                                    v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item)")
                                        v-icon(small) edit
                                    v-btn.ma-0(flat icon small color="primary" @click="deleteItem(props.item)")
                                        v-icon(small) delete
                v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
                    v-card
                        v-card-title.title {{formTitle}}
                        v-card-text
                            v-form(ref="editForm")
                                v-text-field(v-model="cdn.name" label="CDN Provider Name" type="text" name="name" :rules="[rules.required]")
                                v-text-field(v-model="cdn.ttl" label="TTL" type="number" name="ttl" :rules="[rules.ttl]")
                                v-text-field(v-model="cdn.url" label="Url" type="text" name="url")
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="updateCDN") Save
                v-dialog.delete-dialog(v-model="dialog.delete" max-width="460" persistent)
                    v-card
                        v-card-title.title Delete CDN Provider
                        v-card-text Are you sure want to delete {{cdn.name}}?
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="deleteCDN") Yes
                v-dialog(v-model="dialog.changeScannable" max-width="460" persistent)
                        v-card
                            v-card-title.title {{scannableFormTitle}}
                            v-card-text Are you sure want to change {{scannableInfo.name}}'s scannable ?
                            v-card-actions  
                                v-spacer
                                v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                                v-btn(color="primary" flat="flat" @click="changeScannableAction") Yes
                v-dialog(v-model="dialog.changeStatus" max-width="460" persistent)
                    v-card
                        v-window(v-model="step")
                            v-window-item(:value="1")
                                v-card-title.title {{doubleCheckFormTitle}}
                                v-card-text Are you sure want to change {{switchItem.name}}'s status ?
                                v-card-actions  
                                    v-spacer
                                    v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                                    v-btn(color="primary" flat="flat" @click="changeStatusAction") Yes
                            v-window-item(:value="2")
                                v-card-title.title {{doubleCheckFormTitle}} '{{switchItem.name}}'
                                v-card-text.text 
                                    span {{checkData.have_multi_cdn.length+checkData.only_default.length}} domains' cdn setting will be affected
                                    br
                                    span {{checkData.have_multi_cdn.join(', ')}} {{checkData.only_default.join(', ')}}
                                v-card-actions 
                                    v-spacer
                                    v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                                    v-btn(color="primary" flat="flat" @click="updateStatus") Yes
</template>
<script>
import textFieldRules from "../../utils/textFieldRules.js";

export default {
    mixins: [textFieldRules],
    data() {
        return {
            switch: true,
            editedIndex: -1,
            cdn: {},
            searchText: "",
            dialog: {
                edit: false,
                delete: false,
                changeStatus: false,
                changeScannable: false
            },
            filterData: [],
            headers: [
                {
                    text: "#",
                    align: "left",
                    sortable: false,
                    width: "80px",
                    value: "index"
                },
                {
                    text: "Name",
                    align: "left",
                    sortable: true,
                    value: "name"
                },
                {
                    text: "TTL",
                    align: "left",
                    sortable: true,
                    value: "ttl"
                },
                {
                    text: "Url",
                    align: "left",
                    sortable: true,
                    value: "url"
                },
                {
                    text: "Scannable",
                    align: "left",
                    sortable: false,
                    value: "scannable"
                },
                {
                    text: "Status",
                    align: "left",
                    sortable: false,
                    value: "status"
                },
                {
                    text: "Actions",
                    align: "left",
                    value: "action",
                    sortable: false,
                    width: "150px"
                }
            ],
            open: false,
            switchItem: {},
            step: 1,
            checkData: {
                have_multi_cdn: [],
                only_default: [],
                be_used: []
            },
            scannableInfo: {},
            type: ""
        };
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1
                ? "New CDN Provider"
                : "Edit CDN Provider";
        },
        scannableFormTitle() {
            return this.scannableInfo.scannable === true
                ? "Turn On Scannable"
                : "Turn Off Scannable";
        },
        doubleCheckFormTitle() {
            return this.open === true
                ? "Open CDN Provider"
                : "Close CDN Provider";
        }
    },
    methods: {
        switchAction(item) {
            this.switchItem = item;
            // console.log(item, "switch");
            this.dialog.changeStatus = true;
            if (item.status == true) {
                this.open = true;
            } else {
                this.open = false;
            }
        },
        switchScannable(item) {
            this.scannableInfo = item;
            this.dialog.changeScannable = true;
        },
        checkCdnProvider() {
            // console.log(this.type, "check api");
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/checkCdnProvider", this.switchItem.id)
                .then(
                    function(result) {
                        this.checkData = result.data;
                        if (this.type == "check") {
                            if (
                                this.checkData.have_multi_cdn.length == 0 &&
                                this.checkData.only_default.length == 0
                            ) {
                                this.updateStatus();
                            } else {
                                this.step = 2;
                            }
                        }
                        if (this.type == "delete") {
                            if (this.checkData.be_used.length == 0) {
                                // this.deleteCDN();
                                this.dialog.delete = true;
                            } else {
                                this.closeEditDialog();
                                this.$store.dispatch(
                                    "global/showSnackbarError",
                                    "This CDN provider is used by domains so can't be deleted."
                                );
                            }

                            // this.closeEditDialog();
                        }
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
        changeScannableAction() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch(
                    "cdnProviders/changeCdnProviderScannable",
                    this.scannableInfo
                )
                .then(
                    function(result) {
                        this.getAllCDNs();
                        this.closeEditDialog();
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.closeEditDialog();
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                    }.bind(this)
                );
        },
        changeStatusAction() {
            if (this.switchItem.status == true) {
                //要開就直接change status
                this.updateStatus();
                // console.log("open");
            } else {
                //要關要先打check api
                this.type = "check";
                this.checkCdnProvider();
            }
        },
        updateStatus() {
            if (this.switchItem.status == true) {
                this.switchItem.status = 1;
            } else {
                this.switchItem.status = 0;
            }
            // console.log(this.switchItem, "status");
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch(
                    "cdnProviders/changeCdnProviderStatus",
                    this.switchItem
                )
                .then(
                    function(result) {
                        this.getAllCDNs();
                        this.closeEditDialog();
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
        getAllCDNs: function() {
            // console.log(this.filterData);

            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/getAllCdnProvider")
                .then(
                    function(result) {
                        this.filterData = result.data;
                        // console.log(this.filterData);
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
        addItem: function() {
            this.$refs.editForm.reset();
            this.editedIndex = -1;
            this.dialog.edit = true;
        },
        editItem: function(item) {
            this.editedIndex = this.filterData.indexOf(item);
            this.dialog.edit = true;
            this.cdn = Object.assign({}, item);
        },
        deleteItem: function(item) {
            // console.log(item, "delete");
            // this.dialog.delete = true;
            this.cdn = Object.assign({}, item);
            this.type = "delete";
            this.switchItem.id = this.cdn.id;
            this.checkCdnProvider();
        },
        updateCDN: function() {
            if (this.editedIndex == -1) {
                this.addNewCDN();
            } else {
                // console.log(this.cdn, "edit");
                this.$store.dispatch("global/startLoading");
                if (this.$refs.editForm.validate()) {
                    this.$store
                        .dispatch("cdnProviders/updateCdnProvider", this.cdn)
                        .then(
                            function(result) {
                                this.getAllCDNs();
                                this.closeEditDialog();
                                this.$store.dispatch("global/finishLoading");
                            }.bind(this)
                        )
                        .catch(
                            function(error) {
                                this.getAllCDNs();

                                this.$store.dispatch("global/finishLoading");
                                this.$store.dispatch(
                                    "global/showSnackbarError",
                                    error.message
                                );
                            }.bind(this)
                        );
                }
            }
        },

        addNewCDN: function() {
            // console.log(this.cdn, "add");
            if (this.$refs.editForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("cdnProviders/newCdnProvider", this.cdn)
                    .then(
                        function(result) {
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Add CDN Provider success!"
                            );
                            this.getAllCDNs();
                            this.closeEditDialog();
                            this.$store.dispatch("global/finishLoading");
                        }.bind(this)
                    )
                    .catch(
                        function(error) {
                            this.getAllCDNs();
                            this.$store.dispatch(
                                "global/showSnackbarError",
                                error.message
                            );
                            this.$store.dispatch("global/finishLoading");
                        }.bind(this)
                    );
                this.closeEditDialog();
            }
        },
        deleteCDN: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/deleteCdnProvider", this.cdn.id)
                .then(
                    function(result) {
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Delete CDN Provider success!"
                        );
                        this.getAllCDNs();
                        this.closeEditDialog();
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.getAllCDNs();
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                );
        },
        closeEditDialog: function() {
            this.dialog.edit = false;
            this.dialog.delete = false;
            this.dialog.changeStatus = false;
            this.dialog.changeScannable = false;
            this.getAllCDNs();
            this.step = 1;
            this.type = "";
        }
    },
    mounted() {
        this.cdn.user_group_id = this.$store.getters[
            "account/accountGroupId"
        ]();
        this.getAllCDNs();
    }
};
</script>