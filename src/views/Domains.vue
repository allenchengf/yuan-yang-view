<template lang="pug">
    v-container#domains
        v-layout(wrap column)
            v-flex(xs12)
                .title.text-xs-left.mb-4 Domains
            v-flex(xs12)
                v-card
                    v-card-title
                        v-layout(row align-center)
                            v-flex.px-2(xs12 sm6 md3)
                                v-text-field.pt-0.mt-0(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                            v-spacer
                            v-btn(color="primary" dark @click="addItem") Add Domain
                    v-data-table.elevation-1(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :pagination.sync="pagination"  hide-actions :search="searchText")
                        v-progress-linear(v-slot:progress color="primary")
                        template(slot="items" slot-scope="props")
                            tr
                                td.text-xs-left {{props.index +1}}
                                td.text-xs-left() 
                                    .name.font-weight-medium {{props.item.name}}
                                td.text-xs-left {{props.item.cname}}
                                td.text-xs-left
                                    v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item, 0)" title="edit domain")
                                        v-icon(small) edit
                                    v-btn(color="primary" dark small outline :to="{ name: 'setting', query :{ data:  props.item } }") More
                    v-layout.px-2(row align-center)
                        v-flex.text-xs-left.py-3(xs4)
                        v-flex.text-xs-right.py-3(xs8)
                            v-pagination(v-model="pagination.page" :length="pages" :total-visible="7" color="primary")
        //- Dialogs
        v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
            v-card
                v-card-title.title {{formTitle}}
                v-card-text
                    v-form(ref="editForm")
                        v-text-field(v-model="domain.name" label="Domain Name" type="text" name="name" :rules="[rules.required]")
                        v-text-field(v-model="domain.cname" label="CName" type="text" name="cname")
                        v-alert.text-md-left(:value="error.status" color="error" icon="warning" outline transition="scale-transition") {{error.message}}
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                    v-btn(color="primary" flat="flat" @click="updateDomain") Save
</template>


<script>
import textFieldRules from "../utils/textFieldRules.js";
import setting from "./setting";

export default {
    mixins: [textFieldRules],

    component: {
        setting
    },
    data() {
        return {
            drawer: true,
            showDetail: false,
            perPage: 20,
            pages: 0,
            searchText: "",
            filterData: [],
            headers: [
                {
                    text: "#",
                    align: "left",
                    sortable: false,
                    width: "80px",
                    value: "id"
                },
                {
                    text: "Domain Name",
                    align: "left",
                    sortable: true,
                    value: "name"
                },
                {
                    text: "CName",
                    align: "left",
                    sortable: true,
                    value: "cname"
                },
                {
                    text: "Actions",
                    align: "left",
                    value: "action",
                    width: "200px"
                }
            ],
            pagination: {
                rowsPerPage: 20
            },
            rowsPerPageItems: [
                { name: "20 per page", value: 20 },
                { name: "50 per pages", value: 50 }
            ],
            rawData: [],
            dialog: {
                edit: false
            },
            error: {
                status: false,
                message: ""
            },
            domain: {},
            editedIndex: -1,
            // groupData: [],
            operatorAuth: 0
            // userGroups: []
        };
    },
    methods: {
        getAllDomains: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getAllDomains")
                .then(
                    function(result) {
                        // console.log(result.data.domain);
                        this.filterData = result.data.domains;
                        // this.handleData();
                        this.setPages();
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
        // filterDataAction: function() {
        //     if (this.searchText != "") {
        //         this.filterData = this.filterData.filter(row => {
        //             return (
        //                 !this.searchText ||
        //                 row.name
        //                     .toLowerCase()
        //                     .indexOf(this.searchText.toLowerCase()) > -1 ||
        //                 row.cname
        //                     .toLowerCase()
        //                     .indexOf(this.searchText.toLowerCase()) > -1
        //             );
        //         });
        //     } else {
        //         this.filterData = this.filterData;
        //     }
        //     this.setPages();
        // },
        editItem: function(item, type) {
            this.editedIndex = this.filterData.indexOf(item);
            this.domain = Object.assign({}, item);
            if (type == 0) {
                this.dialog.edit = true;
            }
        },
        updateDomain: function() {
            if (this.$refs.editForm.validate()) {
                this.$store.dispatch("global/startLoading");
                if (this.editedIndex == -1) {
                    this.addNewDomain();
                } else {
                    this.$store.dispatch("global/startLoading");
                    this.$store
                        .dispatch("domains/updateDomain", this.domain)
                        .then(
                            function(result) {
                                this.$store.dispatch("global/finishLoading");
                                this.getAllDomains();
                                this.closeEditDialog();
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
            }
        },
        addItem: function() {
            this.$refs.editForm.reset();
            this.editedIndex = -1;
            this.dialog.edit = true;
        },
        addNewDomain: function() {
            this.domain.user_group_id = this.$store.getters[
                "account/accountGroupId"
            ]();
            // console.log(this.domain);
            var vm = this;
            if (this.$refs.editForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("domains/newDomain", this.domain)
                    .then(
                        function(result) {
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Update user success!"
                            );
                            this.getAllDomains();
                            this.$store.dispatch("global/finishLoading");
                        }.bind(this)
                    )
                    .catch(
                        function(error) {
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
        },
        setPages: function() {
            if (this.perPage == null || this.filterData == null) {
                this.pages = null;
            } else {
                this.pages = Math.ceil(this.filterData.length / this.perPage);
            }
        }
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "New Domain" : "Edit Domain";
        }
    },
    watch: {
        perPage: function(value) {
            this.pagination.rowsPerPage = value;
            this.setPages();
        }
    },
    mounted() {
        this.$router.push("admin/domains");
        this.getAllDomains();
    },
    created() {
        this.getAllDomains();
        // console.log("xx");
    }
};
</script>

<style lang="sass" scoped>
.child-table
    tr  
        background-color: #F5F5F5
    tr:hover
        background-color: #E0E0E0 !important
</style>