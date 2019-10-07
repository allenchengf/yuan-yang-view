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
                            v-btn(color="primary" dark @click="pickFile") Batch Add Domain
                                v-icon attach_file 
                                input.d-none(ref="file" type="file" @change="handleFileUpload()")

                    v-data-table.elevation-1(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :pagination.sync="pagination"  hide-actions :search="searchText")
                        v-progress-linear(v-slot:progress color="primary")
                        template(slot="items" slot-scope="props")
                            tr
                                td.text-xs-left {{props.index +1}}
                                td.text-xs-left() 
                                    .name.font-weight-medium {{props.item.name}}
                                td.text-xs-left {{props.item.cname}}.{{dnsPodDomain}}
                                td.text-xs-left
                                    v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item, 0)" title="edit domain")
                                        v-icon(small) edit
                                    v-btn(color="primary" dark small outline :to="{ name: 'domainSettings', query :{ data:  props.item , dnsPodDomain} }") More
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
                        v-text-field(v-model="domain.name" label="Domain Name" type="text" name="name" :rules="[rules.domain]")
                        v-alert.text-md-left(:value="error.status" color="error" icon="warning" outline transition="scale-transition") {{error.message}}
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                    v-btn(color="primary" flat="flat" @click="updateDomain") Save
</template>


<script>
import textFieldRules from "../utils/textFieldRules.js";
import DomainSettings from "./DomainSettings";
import XLSX from "xlsx";

export default {
    mixins: [textFieldRules],

    component: {
        DomainSettings
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
                    text: "CNAME",
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
            operatorAuth: 0,
            dnsPodDomain: "",
            form: [],
            batchData: {
                domains: []
            },
            domains: []
        };
    },
    methods: {
        pickFile() {
            this.$refs.file.click();
            this.$refs.file.value = "";
        },
        handleFileUpload() {
            var vm = this;
            var fileUpload = this.$refs.file;
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
            if (regex.test(fileUpload.value.toLowerCase())) {
                if (typeof FileReader != "undefined") {
                    var reader = new FileReader();
                    if (reader.readAsBinaryString) {
                        reader.onload = function(e) {
                            vm.ProcessExcel(e.target.result);
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
        ProcessExcel(data) {
            var workbook = XLSX.read(data, {
                type: "binary"
            });
            var firstSheet = workbook.SheetNames[0];
            var excelRows = XLSX.utils.sheet_to_row_object_array(
                workbook.Sheets[firstSheet]
            );
            this.transformData(excelRows);
        },
        transformData(excelRows) {
            this.batchData.domains = [];
            this.batchData.domains = excelRows;
            this.batchData.domains.forEach((o, i) => {
                o.cdns = [];
                o.cdns = Object.entries(o).map(([name, cname]) => ({
                    name,
                    cname
                }));
                o.cdns.forEach((obj, idx) => {
                    obj["ttl"] = 600;
                });
                o.cdns.splice(0, 1);
                o.cdns.pop();
                o.name = o.Domain;
                delete o.H7CDN;
                delete o.Cloudflare;
                delete o.Cloudfront;
                delete o.Domain;
            });
            this.batchAddDomains();
        },
        batchAddDomains() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/batchNewDomainsAndCdns", this.batchData)
                .then(
                    function(result) {
                        this.getAllDomains();
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
        getAllDomains: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getAllDomains")
                .then(
                    function(result) {
                        this.filterData = result.data.domains;
                        this.dnsPodDomain = result.data.dnsPodDomain;
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
                    // this.domain.cname = this.domain.name;
                    this.$store.dispatch("global/startLoading");
                    this.$store
                        .dispatch("domains/updateDomain", this.domain)
                        .then(
                            function(result) {
                                this.$store.dispatch("global/finishLoading");
                                this.$store.dispatch(
                                    "global/showSnackbarSuccess",
                                    "Change domain name success!"
                                );
                                this.getAllDomains();
                                this.closeEditDialog();
                            }.bind(this)
                        )
                        .catch(
                            function(error) {
                                this.$store.dispatch("global/finishLoading");
                                this.closeEditDialog();
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
            this.domain.cname = this.domain.name;
            var vm = this;
            if (this.$refs.editForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("domains/newDomain", this.domain)
                    .then(
                        function(result) {
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Add new domain success!"
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
        // transformData() {
        //     console.log(this.batchData);
        //     this.batchData.domains.forEach((o, i) => {
        //         o.cdns = [];
        //         o.cdns = Object.entries(o).map(([name, cname]) => ({
        //             name,
        //             cname
        //         }));
        //         o.cdns.forEach((obj, idx) => {
        //             obj["ttl"] = 600;
        //         });
        //         o.cdns.splice(2, 1);
        //         o.cdns.pop();
        //         o.name = o.Domain;
        //         delete o.H7CDN;
        //         delete o.Cloudflare;
        //         delete o.Cloudfront;
        //         delete o.Domain;
        //     });
        // }
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
        // console.log(this.batchData);
        this.transformData();
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