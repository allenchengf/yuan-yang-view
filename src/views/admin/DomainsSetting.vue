<template lang="pug">
    v-container#domainsSetting.grid-list-lg
        v-layout(wrap column)
            v-flex(xs12)
                .title Domains
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading Domains
                        v-spacer
                        v-btn.my-0(color="primary" @click="clearBtn") Clear Filter
                        v-btn.my-0(color="primary" @click="addItem") Add Domain
                        v-menu(offset-y left) 
                            template(v-slot:activator="{on}")
                                v-btn.ma-0(flat icon small color="primary" v-on="on")
                                    v-icon( small) more_vert
                            v-list
                                v-list-tile(@click="pickFile")
                                    v-list-tile-title Import domain's info
                                        input.d-none(ref="file" type="file" @change="handleFileUpload()")
                                v-list-tile(@click="exportFile")
                                    v-list-tile-title Export domain's data
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                            v-flex(xs12 sm6 md3)
                                v-select(:items="cdnArray" label="Select CDN" item-text="name" item-value="name" @change="chooseCdnFilter(selectedCDN)" multiple v-model="selectedCDN")
                            v-flex(xs12 sm6 md3)
                                v-select(:items="groupArray" label="Select Group" item-text="name" item-value="name" @change="chooseGroupFilter(selectedGroup)" v-model="selectedGroup")
                    h7-data-table(:headers="headers" :items="filteredItems" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line)
                        template(slot="items" slot-scope="{props, index}")
                            tr
                                td {{ index }}
                                td {{ props.item.name }}
                                td {{ props.item.cname }}.{{dnsPodDomain}}
                                td
                                    span(v-for="item in props.item.cdnArray" v-if="item.default == true" :style="item.default == true ? 'color:green;font-weight: 600' : 'color: black'") {{item.name}} 
                                    span(v-for="item in props.item.cdnArray" v-if="item.default !== true" ) {{ " , " + item.name }}
                                td {{props.item.domain_group.length !== 0? props.item.domain_group[0].name : ""}}
                                td
                                    v-btn.ma-0(flat icon small color="primary" @click="goToNextPage(props.item)")
                                        v-icon(small) edit
                                    v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item, 'delete')")
                                        v-icon(small) delete
                v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
                    v-card
                        v-card-title.title {{formTitle}}
                        v-card-text
                            v-form(ref="editForm")
                                v-text-field(v-model="domain.name" label="Domain" type="text" name="name" :rules="[rules.domain]")
                                v-text-field(v-model="domain.label" label="Note" type="text" name="label")
                                v-select(:items="cdnProvider" label="CDN Name" item-text="name" item-value="id" @change="chooseCDN" v-model="cdn.cdn_provider_id" :rules="[rules.required]")
                                v-text-field(v-model="cdn.cname" label="CDN CNAME" type="text" name="cname" :rules="[rules.domain]")
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="updateDomain('add')") Save
                v-dialog.delete-dialog(v-model="dialog.delete" max-width="460" persistent)
                    v-card
                        v-card-title.title Delete Domain
                        v-card-text Are you sure want to delete "{{domain.name}}" ?
                        v-card-actions  
                            v-spacer
                            v-btn(color="error" flat="flat" @click="updateDomain('delete')") Delete
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
</template>
<script>
import textFieldRules from "../../utils/textFieldRules.js";
import timeUtils from "../../utils/timeUtils.js";
import XLSX from "xlsx";
import _ from "lodash";

export default {
    mixins: [textFieldRules, timeUtils],

    data() {
        return {
            cdnArray: [],
            groupArray: [],
            selectedCDN: [],
            selectedGroup: "",
            cdn: {},
            user_group_id: "",
            editedIndex: -1,
            domain: {},
            searchText: "",
            dialog: {
                edit: false,
                changeStatus: false,
                delete: false
            },
            dnsPodDomain: "shiftcdn.com",
            form: [],
            batchData: {
                domains: []
            },
            filteredItems: [],
            filterData: [],
            rawData: [],
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
                    text: "CNAME",
                    align: "left",
                    sortable: true,
                    value: "cname"
                },
                {
                    text: "CDNs",
                    align: "left",
                    sortable: false,
                    value: ""
                },
                {
                    text: "Group",
                    align: "left",
                    sortable: false,
                    value: "domain_group[0].name"
                },
                {
                    text: "Actions",
                    align: "left",
                    value: "",
                    sortable: false,
                    width: "150px"
                }
            ],
            exportData: [],
            cdnProvider: [],
            cdnProviderMapping: {}
        };
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "New Domain" : "Edit Domain";
        }
    },
    methods: {
        chooseCdnFilter() {
            // console.log(this.selectedCDN.length);
            this.selectedCDN.sort();
            this.filterAction();
        },
        chooseGroupFilter() {
            // console.log(this.selectedGroup);

            this.filterAction();
        },
        chooseCDN() {},
        filterAction() {
            if (this.selectedCDN.length !== 0 && this.selectedGroup == "") {
                // console.log(this.selectedCDN);
                var filteredItems = [];
                this.filterData.forEach((o, i) => {
                    o.cdnArrayName.sort();
                    this.selectedCDN.forEach((obj, idx) => {
                        // console.log(_.indexOf(o.cdnArrayName, obj));

                        if (_.indexOf(o.cdnArrayName, obj) !== -1) {
                            filteredItems.push(this.filterData[i]);
                        }
                    });
                });
                var filteredData = [];
                filteredData.push(filteredItems);
                this.filteredItems = filteredData[0];
            }
            if (this.selectedCDN.length !== 0 && this.selectedGroup !== "") {
                // console.log("B");

                var filteredItems = [];
                this.filterData.forEach((o, i) => {
                    o.cdnArrayName.sort();
                    this.selectedCDN.forEach((obj, idx) => {
                        if (
                            _.indexOf(o.cdnArrayName, obj) !== -1 &&
                            o.domain_group.length !== 0 &&
                            o.domain_group[0].name === this.selectedGroup
                        ) {
                            // console.log(i);
                            filteredItems.push(this.filterData[i]);
                        }
                    });
                });
                var filteredData = [];
                filteredData.push(filteredItems);
                this.filteredItems = filteredData[0];
            }
            if (
                this.selectedCDN.length == 0 &&
                this.selectedGroup == undefined
            ) {
                // console.log("c");

                this.filteredItems = this.filterData;
            }
            if (this.selectedCDN.length == 0 && this.selectedGroup == "") {
                // console.log("D");

                this.filteredItems = this.filterData;
            }
            if (this.selectedGroup !== "" && this.selectedGroup !== undefined) {
                // console.log("E");

                this.filteredItems = this.filterData.filter(item => {
                    if (item.domain_group.length !== 0) {
                        return item.domain_group[0].name == this.selectedGroup;
                    }
                });
            }
        },
        pickFile() {
            this.$refs.file.click();
            // console.log(this.batchData);
            // console.log("cchh");
        },
        handleFileUpload() {
            // console.log(this.$refs.file, "newfile");
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
            // console.log(excelRows);
            this.batchData.domains.forEach((o, i) => {
                o.cdns = [];
                o.cdns = Object.entries(o).map(([name, cname]) => ({
                    name,
                    cname
                }));
                // o.cdns.forEach((obj, idx) => {
                //     obj["ttl"] = 600;
                // });
                o.cdns.splice(0, 1);
                o.cdns.pop();
                o.name = o.Domain;
                o.cdns.forEach((obj, idx) => {
                    delete o[obj.name];
                });
                delete o.Domain;
            });
            this.batchAddDomains();
            // console.log(this.batchData.domains);
        },
        batchAddDomains() {
            // console.log(this.batchData, "ccc");
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/batchNewDomainsAndCdns", this.batchData)
                .then(
                    function(result) {
                        // this.$refs.file = "";
                        this.initialApis();
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Batch add domains & cdns success!"
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
        exportFile() {
            // console.log(this.cdnProvider, "cc");
            // this.getAllDomains();
            this.exportData = [];
            // console.log(this.filterData, "ff");
            // this.exportData = this.filterData;
            this.filterData.forEach((o, i) => {
                var exportData = {};
                exportData.Domain = o.name;
                exportData.cdns = [];
                o.cdns.forEach((obj, idx) => {
                    var cdnData = {};
                    this.cdnProvider.forEach((object, index) => {
                        if (obj.cdn_provider_id == object.id) {
                            obj.name = object.name;
                        }
                    });
                    cdnData.name = obj.name;
                    cdnData.cname = obj.cname;
                    exportData.cdns.push(cdnData);
                });
                this.exportData.push(exportData);
            });
            this.exportData.forEach((o, i) => {
                o.cdns.forEach((obj, idx) => {
                    o[obj.name] = obj.cname;
                });
                delete o.cdns;
            });
            // console.log(this.exportData, "export");
            var domainWS = XLSX.utils.json_to_sheet(this.exportData);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, domainWS, "domain");
            XLSX.writeFile(
                wb,
                "domains" +
                    timeUtils.methods.timestampToString(
                        new Date().getTime() / 1000
                    ) +
                    ".xlsx"
            );
        },
        getAllCdnProvider() {
            return this.$store
                .dispatch("cdnProviders/getAllCdnProvider")
                .then(
                    function(result) {
                        this.cdnProvider = result.data;
                        this.cdnProvider.forEach(
                            (item => {
                                this.cdnProviderMapping[item.id] = item.name;
                            }).bind(this)
                        );
                        // console.log(this.cdnProvider);
                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        return Promise.reject(error);
                    }.bind(this)
                );
        },
        mapping() {
            this.rawData.forEach((o, i) => {
                o.cdnArray = [];
                o.cdnArrayName = [];

                o.cdns.forEach((obj, idx) => {
                    o.cdnArrayName.push(
                        this.cdnProviderMapping[obj.cdn_provider_id]
                    );
                    var cdn = {};
                    cdn.default = obj.default;
                    cdn.name = this.cdnProviderMapping[obj.cdn_provider_id];
                    o.cdnArray.push(cdn);
                });
            });
            this.filterData = this.rawData;
            this.filteredItems = this.filterData;
            this.filterData.forEach((o, i) => {
                if (o.domain_group.length !== 0) {
                    this.groupArray.push(o.domain_group[0].name);
                }
                o.cdnArray.forEach((obj, idx) => {
                    this.cdnArray.push(obj.name);
                });
            });
            // console.log(this.cdnArray);
            // console.log(this.filterData, "mm");
        },
        getAllDomains: function() {
            return this.$store
                .dispatch("domains/getAllDomains", this.user_group_id)
                .then(
                    function(result) {
                        this.rawData = result.data.domains;
                        this.dnsPodDomain = result.data.dnsPodDomain;
                        // console.log(this.rawData);
                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        return Promise.reject(error);
                    }.bind(this)
                );
        },
        initialApis: function() {
            this.$store.dispatch("global/startLoading");
            Promise.all([this.getAllDomains(), this.getAllCdnProvider()])
                .then(
                    function() {
                        this.mapping();
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
        editItem: function(item, type) {
            // this.type = type;
            if (type == "delete") {
                // console.log(item);
                this.dialog.delete = true;
                this.domain = Object.assign({}, item);
            }
            // console.log(this.domain);
        },
        updateDomain: function(type) {
            // console.log(type);
            if (this.editedIndex == -1 && type !== "delete") {
                this.addNewDomain();
            } else if (type == "delete") {
                this.deleteDomain();
            }
        },
        addNewDomain: function() {
            // console.log(this.domain, "add");
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
                            this.addNewCdn(result.data.id);
                            this.initialApis();
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
        addNewCdn(domain_id) {
            this.cdn.domain_id = domain_id;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdns/newCDN", this.cdn)
                .then(
                    function(result) {
                        this.initialApis();
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
        },
        deleteDomain() {
            // console.log(this.domain, "deleteApi");
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/deleteDomain", this.domain.id)
                .then(
                    function(result) {
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Delete domain success!"
                        );
                        this.initialApis();
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
        },
        closeEditDialog: function() {
            this.dialog.edit = false;
            this.dialog.changeStatus = false;
            this.dialog.delete = false;
        },
        clearBtn() {
            this.selectedCDN = [];
            this.selectedGroup = "";
            this.filteredItems = this.filterData;
        },
        goToNextPage(data) {
            this.$router.push({
                name: "domainInfo",
                params: {
                    domain_id: data.id,
                    info: data
                }
            });
        }
    },
    created() {
        this.user_group_id = this.$store.getters["account/accountGroupId"]();
        this.initialApis();
        // this.getAllDomains();
        // this.getAllCdnProvider();
        // this.mapping();
    }
};
</script>