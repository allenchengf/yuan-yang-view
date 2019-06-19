<template lang="pug">
    v-container#cdnSetting.grid-list-lg
        v-layout(wrap)
            v-flex(xs12)
                .title CDN
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading CDN
                        v-spacer
                        v-btn.my-0(color="primary" @click="addItem") Add CDN
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    h7-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line)
                        template(slot="items" slot-scope="{props, index}")
                            td {{ index }}
                            td {{ props.item.name }}
                            td {{ props.item.ttl }}
                            td
                                v-switch(color="primary" v-model="props.item.status" @change="switchAction(props.item)")
                            td
                                v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item)")
                                    v-icon(small) edit
                v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
                    v-card
                        v-card-title.title {{formTitle}}
                        v-card-text
                            v-form(ref="editForm")
                                v-text-field(v-model="cdn.name" label="CDN Name" type="text" name="name" :rules="[rules.required]")
                                v-text-field(v-model="cdn.ttl" label="TTL" type="number" name="ttl" :rules="[rules.ttl]")
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="updateCDN") Save
                v-dialog.edit-dialog(v-model="dialog.changeStatus" max-width="460" persistent)
                    v-card
                        v-card-title.title {{doubleCheckFormTitle}}
                        v-card-text Are you sure want to change {{switchItem.name}}'s status ?
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
                changeStatus: false
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
                    text: "",
                    align: "left",
                    sortable: false,
                    value: ""
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
            switchItem: {}
        };
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "New CDN" : "Edit CDN";
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
            // console.log(item);
            this.dialog.changeStatus = true;
            if (item.status == true) {
                this.open = true;
            } else {
                this.open = false;
            }
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
        updateStatus() {
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
                        this.getAllCDNs();
                        this.closeEditDialog();
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                    }.bind(this)
                );
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
        closeEditDialog: function() {
            this.dialog.edit = false;
            this.dialog.changeStatus = false;
            this.getAllCDNs();
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