<template lang="pug">
    v-container#domainsSetting.grid-list-lg
        v-layout(wrap)
            v-flex(xs12)
                .title Domains
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading Domains
                        v-spacer
                        v-btn.my-0(color="primary" @click="addItem") Add Domain
                        v-menu(offset-y left) 
                            template(v-slot:activator="{on}")
                                v-btn.ma-0(flat icon small color="primary" v-on="on")
                                    v-icon( small) more_vert
                            v-list
                                v-list-tile(@click="pickFile")
                                    v-list-tile-title Import domain's info
                                        input.d-none(ref="file" type="file" @change="handleFileUpload()")
                                v-list-tile(@click="")
                                    v-list-tile-title Export domain's data
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    h7-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="3" single-line)
                        template(slot="items" slot-scope="{props, index}")
                            tr(@click="goToNextPage(props.item)" style="cursor: pointer")
                                td {{ props.index + 1}}
                                td {{ props.item.name }}
                                td {{ props.item.name }}.{{props.item.user_group_id}}.{{dnsPodDomain}}
                                td {{ props.item.cdnArray }}
                                td {{ props.item.group.name }}
                                td
                                    v-icon(small) keyboard_arrow_right
                v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
                    v-card
                        v-card-title.title {{formTitle}}
                        v-card-text
                            v-form(ref="editForm")
                                v-text-field(v-model="domain.name" label="Domain" type="text" name="name" :rules="[rules.required]")
                                v-text-field(v-model="domain.label" label="Label" type="text" name="label")
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="updateDomain") Save
</template>
<script>
import textFieldRules from "../../utils/textFieldRules.js";

export default {
    mixins: [textFieldRules],
    data() {
        return {
            editedIndex: -1,
            domain: {},
            searchText: "",
            dialog: {
                edit: false,
                changeStatus: false
            },

            dnsPodDomain: "shiftcdn.com",
            form: [],
            batchData: {
                domains: [
                    {
                        Cloudflare: "www.hiero9.com.cloudflare.com",
                        Cloudfront: "efsfijdd.cloudfront.com",
                        Domain: "www.hiero9.com",
                        H7CDN: "wwefdsf.speedxxx.com"
                    },
                    {
                        Cloudflare: "www.hiero10.com.cloudflare.com",
                        Cloudfront: "esfijfodd.cloudfront.com",
                        Domain: "www.hiero10.com",
                        H7CDN: "2wdsf.speedxxx.com"
                    },
                    {
                        Cloudflare: "www.hiero11.com.cloudflare.com",
                        Cloudfront: "efsjfodd.cloudfront.com",
                        Domain: "www.hiero11.com",
                        H7CDN: "2weff.speedxxx.com"
                    },
                    {
                        Cloudflare: "www.hiero12.com.cloudflare.com",
                        Cloudfront: "efsodd.cloudfront.com",
                        Domain: "www.hiero12.com",
                        H7CDN: "2efdsf.speedxxx.com"
                    }
                ]
            },
            filterData: [
                {
                    id: 3,
                    user_group_id: 2,
                    name: "rd.test1.com",
                    cname: "rd.test1.com",
                    group: {
                        name: "group1"
                    },
                    cdns: [{ name: "H7CDN" }, { name: "CloudFlare" }],
                    edited_by: null,
                    created_at: null,
                    updated_at: null
                },
                {
                    id: 4,
                    user_group_id: 2,
                    name: "rd.test2.com",
                    cname: "rd.test2.com",
                    group: {
                        name: "group2"
                    },
                    cdns: [{ name: "H7CDN" }, { name: "CloudFront" }],
                    edited_by: null,
                    created_at: null,
                    updated_at: null
                }
            ],
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
                    text: "CName",
                    align: "left",
                    sortable: true,
                    value: ""
                },
                {
                    text: "CDNs",
                    align: "left",
                    sortable: false,
                    value: "cdns"
                },
                {
                    text: "Group",
                    align: "left",
                    sortable: false,
                    value: "group"
                },
                {
                    text: "",
                    align: "left",
                    value: "",
                    sortable: false,
                    width: "150px"
                }
            ]
        };
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "New Domain" : "Edit Domain";
        }
    },
    methods: {
        pickFile() {
            this.$refs.file.click();
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
            console.log(this.batchData);
            // this.$store.dispatch("global/startLoading");
            // this.$store
            //     .dispatch("domains/batchNewDomainsAndCdns", this.batchData)
            //     .then(
            //         function(result) {
            //             this.getAllDomains();
            //             this.$store.dispatch("global/finishLoading");
            //         }.bind(this)
            //     )
            //     .catch(
            //         function(error) {
            //             this.$store.dispatch("global/finishLoading");
            //             this.$store.dispatch(
            //                 "global/showSnackbarError",
            //                 error.message
            //             );
            //         }.bind(this)
            //     );
        },
        getAllDomains: function() {
            this.filterData.forEach((o, i) => {
                o.cdnArray = [];
                o.cdns.forEach((obj, idx) => {
                    o.cdnArray.push(obj.name);
                });
            });
            console.log(this.filterData);
            // this.$store.dispatch("global/startLoading");
            // this.$store
            //     .dispatch("domains/getAllDomains")
            //     .then(
            //         function(result) {
            //             this.filterData = result.data.domains;
            //             this.dnsPodDomain = result.data.dnsPodDomain;
            //             this.setPages();
            //             this.$store.dispatch("global/finishLoading");
            //         }.bind(this)
            //     )
            //     .catch(
            //         function(error) {
            //             this.$store.dispatch("global/finishLoading");
            //             this.$store.dispatch(
            //                 "global/showSnackbarError",
            //                 error.message
            //             );
            //         }.bind(this)
            //     );
        },
        addItem: function() {
            this.$refs.editForm.reset();
            this.editedIndex = -1;
            this.dialog.edit = true;
        },
        editItem: function(item) {
            console.log(item);
            this.editedIndex = this.filterData.indexOf(item);
            this.dialog.edit = true;
            this.domain = Object.assign({}, item);
        },
        updateDomain: function() {
            if (this.editedIndex == -1) {
                this.addNewDomain();
            } else {
                console.log(this.cdn, "edit");
                this.closeEditDialog();
            }

            // this.cdn.domain_id = this.domain_id;
            // this.$store.dispatch("global/startLoading");
            // if (this.editedIndex == -1) {
            //     this.addNewCDN();
            // } else {
            //     if (this.cdn.default == false) {
            //         this.cdn.default = 0;
            //     } else {
            //         this.cdn.default = 1;
            //     }
            //     this.$store.dispatch("global/startLoading");
            //     this.$store
            //         .dispatch("domains/updateCDN", this.cdn)
            //         .then(
            //             function(result) {
            //                 this.$store.dispatch("global/finishLoading");
            //                 this.$store.dispatch(
            //                     "global/showSnackbarSuccess",
            //                     "Change default CDN provider success!"
            //                 );
            //                 this.getAllCDNs();
            //                 this.closeChangeDialog();
            //             }.bind(this)
            //         )
            //         .catch(
            //             function(error) {
            //                 this.$store.dispatch("global/finishLoading");
            //                 this.$store.dispatch(
            //                     "global/showSnackbarError",
            //                     error.message
            //                 );
            //             }.bind(this)
            //         );
            // }
        },
        updateStatus() {
            console.log(this.switchItem, "status");
        },
        addNewDomain: function() {
            console.log(this.cdn, "add");
            this.closeEditDialog();
            // this.cdn.domain_id = this.domain_id;
            // var vm = this;
            // if (this.$refs.editForm.validate()) {
            //     this.$store.dispatch("global/startLoading");
            //     this.$store
            //         .dispatch("domains/newCDN", this.cdn)
            //         .then(
            //             function(result) {
            //                 this.$store.dispatch(
            //                     "global/showSnackbarSuccess",
            //                     "Update user success!"
            //                 );
            //                 this.getAllCDNs();
            //                 this.$store.dispatch("global/finishLoading");
            //             }.bind(this)
            //         )
            //         .catch(
            //             function(error) {
            //                 this.$store.dispatch(
            //                     "global/showSnackbarError",
            //                     error.message
            //                 );
            //                 this.$store.dispatch("global/finishLoading");
            //             }.bind(this)
            //         );
            //     this.closeEditDialog();
            // }
        },
        closeEditDialog: function() {
            this.dialog.edit = false;
            this.dialog.changeStatus = false;
        },
        goToNextPage(data) {
            console.log(data);
            this.$router.push({
                name: "domainInfo",
                params: {
                    domain_id: data.id
                    // info: data
                }
            });
        }
    },
    mounted() {
        this.getAllDomains();
    }
};
</script>