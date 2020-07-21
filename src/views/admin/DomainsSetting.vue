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
                                v-list-tile(@click="batchDeleteDomainCdns")
                                    v-list-tile-title Quick delete CDN
                                v-list-tile(@click="batchDelete")
                                    v-list-tile-title Batch Delete Domain
                                v-list-tile(@click="pickFile")
                                    v-list-tile-title Import domain's info
                                        input.d-none(ref="file" type="file" @change="handleFileUpload()")
                                v-list-tile(@click="exportFile")
                                    v-list-tile-title Export domain's data
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details @keydown.enter="onSearch" @click:append="onSearch")
                            v-flex(xs12 sm6 md3)
                                v-select(:items="cdnArray" label="Select CDN" item-text="name" item-value="name" @change="chooseCdnFilter(selectedCDN)" multiple v-model="selectedCDN" :item-disabled="['disable', 'status']")
                            v-flex(xs12 sm6 md3)
                                v-select(:items="groupArray" label="Select Group" item-text="name" item-value="name" @change="chooseGroupFilter(selectedGroup)" v-model="selectedGroup")
                    v-card-text(v-if="batchStatus")
                        span Progress of Batch Add Domains
                        v-layout(wrap)
                            v-flex(xs10 md10)
                                v-progress-linear(color="brown lighten-4" height="20" :value="progress" width="180") {{progressData.done}} / {{progressData.all}}
                            v-flex(xs2 md2)
                                v-btn.my-0(v-show="showGetResultBtn" color="primary" @click="getProcessResult") Get Result
                    h7-selectable-data-table(:headers="headers" :items="filteredItems" :loading="$store.state.global.isLoading" :search-text="doSearchText" :per-page="25" single-line v-model="selectedArray" :selectedArray="selectedArray")
                        template(slot="items" slot-scope="{props, index}")
                            tr 
                                td
                                    v-checkbox(v-model="props.selected" primary hide-details)
                                td {{ props.item.index }}
                                td {{ props.item.name }}
                                td {{ props.item.cname }}
                                td
                                    span(v-for="item in props.item.cdnArray" v-if="item.default == true" :style="item.default == true ? 'color:green;font-weight: 600' : 'color: black'") {{item.name}} 
                                    span(v-for="item in props.item.cdnArray" v-if="item.default !== true" ) {{ " , " + item.name }}
                                td {{props.item.domain_group.length !== 0? props.item.domain_group[0].name : ""}}
                                td {{props.item.label}}
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
                                v-combobox(:items="cdnProvider" label="CDN Name" item-text="name" item-value="id" @change="chooseCDN" v-model="cdn.cdn_provider" :rules="[rules.required]")
                                        template(v-slot:no-data)
                                            v-card-text No results matching 
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
                v-dialog.delete-dialog(v-model="dialog.batchDelete" max-width="460" persistent)
                    v-card
                        v-card-title.title Batch Delete Domain
                        v-card-text Are you sure want to delete 
                            span(v-for="item in selectedArray") "{{item.name}}"
                            span ?
                        v-card-actions  
                            v-spacer
                            v-btn(color="error" flat="flat" @click="batchDeleteAction") Delete
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                v-dialog.alert-dialog(v-model="dialog.alert" max-width="460")
                    v-card 
                        v-card-title.title Batch delete domain
                        v-card-text Please at least choose one domain to batch delete.
                        v-card-actions  
                            v-spacer
                            v-btn(color="primary" flat="flat" @click="closeAlertDialog") OK
                v-dialog.check-dialog(v-model="dialog.check" max-width="960" persistent)
                    v-card 
                        v-card-title.title Detail info of domains
                        v-card-text 
                            h7-data-table(:headers="infoHeaders" :items="detailInfo" :loading="$store.state.global.isLoading" :per-page="10" single-line)
                                template(slot="items" slot-scope="{props, index}")
                                    td.text-xs-center {{index}}
                                    td.text-xs-center {{props.item.domain_name}}
                                    td.text-xs-center
                                        span(style="color: green;font-weight:600" :style="props.item.status[0] === 'Success'  ? 'color:green;font-weight: 600' : 'color: red'" v-for="item in props.item.status") {{item}} </br>
                        v-card-actions  
                            v-spacer
                            v-btn(color="primary" flat="flat" @click="closeCheckDialog") OK
                v-dialog.check-dialog(v-model="dialog.batchDeleteCdn" max-width="960" persistent)
                    v-card
                        v-window(v-model="step")
                            v-window-item(:value="1")
                                v-card-title.title Please choose a CDN
                                v-card-text
                                    v-flex(xs12 sm6 md3)
                                        //- v-select(:items="cdnArray" label="Select CDN" item-text="name" item-value="id" v-model="wantDeleteCdn")
                                        v-combobox(:items="cdnArray" label="Select CDN" item-text="name" item-value="id" v-model="wantDeleteCdn")
                                            template(v-slot:no-data)
                                                v-card-text No results matching 
                                v-card-actions  
                                    v-spacer
                                    v-btn(color="grey" flat="flat" @click="closeDialog") Cancel
                                    v-btn(color="primary" flat="flat" @click="chooseDomains") Next
                            v-window-item(:value="2")
                                v-card-title.title Please choose domains

                                v-card-text 
                                    v-flex(xs12 sm6 md4)
                                        v-text-field(v-model="innerSearchText" append-icon="search" label="Search" single-line hide-details)
                                    h7-selectable-data-table(:headers="domainListHeaders" :items="domainList" :loading="$store.state.global.isLoading" :search-text="innerSearchText" :per-page="10" single-line @childMethod="parentMethod")
                                        template(slot="items" slot-scope="{props, index}")
                                            tr 
                                                td
                                                    v-checkbox(v-model="props.selected" primary hide-details)
                                                td {{ index }}
                                                td {{ props.item.name }}
                                                td {{ props.item.cname }}
                                                td
                                                    span(v-for="item in props.item.cdnArray" v-if="item.default == true" :style="item.default == true ? 'color:green;font-weight: 600' : 'color: black'") {{item.name}} 
                                                    span(v-for="item in props.item.cdnArray" v-if="item.default !== true" ) {{ " , " + item.name }}
                                v-card-actions 
                                    v-btn(color="grey" flat="flat" @click="step = 1") Back
                                    v-spacer
                                    v-btn(color="grey" flat="flat" @click="closeDialog") Cancel
                                    v-btn(color="primary" flat="flat" @click="batchDeleteCdnAction") Yes

                            
</template>
<script>
import textFieldRules from "../../utils/textFieldRules.js";
import timeUtils from "../../utils/timeUtils.js";
import XLSX from "xlsx";
import _ from "lodash";
import { setTimeout } from "timers";

export default {
    name: 'DomainSetting',

    mixins: [textFieldRules, timeUtils],

    data() {
        return {
            permission_id: 0,
            showGetResultBtn: false,
            step: 1,
            wantDeleteCdn: "",
            infoHeaders: [
                {
                    text: "#",
                    align: "center",
                    sortable: false,
                    width: "80px",
                    value: "index"
                },
                {
                    text: "Domain Name",
                    align: "center",
                    sortable: true,
                    value: "name"
                },
                {
                    text: "Status",
                    align: "center",
                    sortable: true,
                    value: "status"
                }
            ],
            info: [],
            detailInfo: [],
            batchStatus: false,
            progressData: {},
            progress: 0,
            // selected: [],
            selectedArray: [],
            cdnArray: [],
            groupArray: [],
            selectedCDN: [],
            selectedGroup: "",
            cdn: {},
            user_group_id: "",
            editedIndex: -1,
            domain: {},
            searchText: "",
            doSearchText: "",
            innerSearchText: "",
            dialog: {
                edit: false,
                changeStatus: false,
                delete: false,
                batchDelete: false,
                alert: false,
                check: false,
                batchDeleteCdn: false
            },
            dnsPodDomain: "shiftcdn.com",
            form: [],
            batchData: {
                domains: []
            },
            filteredItems: [],
            filterData: [],
            rawData: [],
            domainListHeaders: [
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
                    value: "cdnArrayName"
                }
            ],
            headers: [
                {
                    text: "#",
                    align: "left",
                    sortable: true,
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
                    value: "cdnArrayName"
                },
                {
                    text: "Group",
                    align: "left",
                    sortable: false,
                    value: "domain_group[0].name"
                },
                {
                    text: "Note",
                    align: "left",
                    sortable: false,
                    value: "label"
                },
                {
                    text: "Actions",
                    align: "left",
                    value: "cdnArrayCname",
                    sortable: false,
                    width: "150px"
                }
            ],
            exportData: [],
            cdnProvider: [],
            cdnProviderMapping: {},
            domainList: []
        };
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "New Domain" : "Edit Domain";
        }
    },
    watch: {
        selectedCDN: function() {
            if (this.selectedCDN.join() == "Not Set") {
                this.cdnArray.forEach((o, i) => {
                    if (o.name !== "Not Set") {
                        o.disable.status = true;
                    }
                });
            } else {
                this.cdnArray.forEach((o, i) => {
                    if (o.name !== "Not Set") {
                        o.disable.status = false;
                    }
                });
            }
            if (this.selectedCDN.join().includes("Not Set") == false) {
                this.cdnArray.forEach((o, i) => {
                    if (o.name == "Not Set") {
                        o.disable.status = true;
                    }
                });
            } else {
                // console.log(this.selectedCDN.join());
                this.cdnArray.forEach((o, i) => {
                    if (o.name == "Not Set") {
                        o.disable.status = false;
                    }
                });
            }
            if (this.selectedCDN.length == 0) {
                this.cdnArray.forEach((o, i) => {
                    o.disable.status = false;
                });
            }
        }
    },
    methods: {
        onSearch() {
            this.doSearchText = this.searchText;
        },
        closeDialog() {
            this.dialog.batchDeleteCdn = false;
            this.wantDeleteCdn = "";
            this.step = 1;
        },
        chooseDomains() {
            if(!this.wantDeleteCdn.id){
                alert("Please select correct CDN Provider name")
                this.wantDeleteCdn = ""
                return
            }
            this.domainList = [];
            // console.log(this.filteredItems);
            this.filteredItems.forEach((o, i) => {
                if (o.cdns.length > 1 && o.domain_group[0].name == null) {
                    o.cdns.forEach((obj, idx) => {
                        if (
                            obj.cdn_provider_id == this.wantDeleteCdn.id &&
                            obj.default !== true
                        ) {
                            this.domainList.push(o);
                        }
                    });
                }
            });
            // console.log(this.domainList);
            this.step = 2;
        },
        parentMethod(data) {
            // console.log("ccc");
            // console.log(data);
            this.selectedArray = data;
        },
        batchDelete() {
            // console.log(this.selectedArray);
            if (this.selectedArray.length == 0) {
                this.dialog.alert = true;
            } else {
                this.dialog.batchDelete = true;
            }
        },
        batchDeleteDomainCdns() {
            this.dialog.batchDeleteCdn = true;
        },
        batchDeleteCdnAction() {
            // console.log(this.selectedArray);
            // console.log(this.wantDeleteCdn);
            this.deleteCdn();
        },
        deleteCdn(index = 0) {
            if (!this.checkCurrentPage()) {
                return
            }

            var domainInfo = {};
            var selectedDomain = this.selectedArray[index]

            domainInfo.domain_id = selectedDomain.id;
            domainInfo.permission_id = this.permission_id;
            selectedDomain.cdns.forEach((obj, idx) => {
                if (obj.cdn_provider_id == this.wantDeleteCdn.id) {
                    domainInfo.id = obj.id;
                }
            });

            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdns/deleteCDN", domainInfo)
                .then(
                    function() {
                        index++

                        if (!this.checkCurrentPage()) {
                            return
                        }

                        if(this.selectedArray.length === index){
                            this.initialApis()

                            this.closeDialog()

                            this.selectedArray = []

                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Quick delete CDN success!"
                            );
                            this.$store.dispatch("global/finishLoading")
                        }else{
                            this.deleteCdn(index)
                        }
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                        this.selectedArray = []
                        this.closeDialog()
                    }.bind(this)
                );
        },
        batchDeleteAction() {
            this.$store.dispatch("global/startLoading");

            this.dialog.check = true;
            this.info = [];
            this.detailInfo = [];
            
            this.closeEditDialog()
            this.batchDeleteDomain()
        },
        batchDeleteDomain(selectedKey = 0){
            if (!this.checkCurrentPage()) {
                return
            }
            var data = {};
            data.id = this.selectedArray[selectedKey].id;
            data.permission_id = this.permission_id;

            this.$store
                .dispatch("domains/deleteDomain", data)
                .then(
                    function(result) {
                        if (!this.checkCurrentPage()) {
                            return
                        }

                        var detail = {};
                        var msg = [];

                        detail.domain_name = result.data.domain_name;
                        msg.push("Success");
                        detail.status = msg;
                        this.info.push(detail);

                        if (this.dialog.check == true) {
                            this.detailInfo = this.info;
                        }

                        selectedKey++
                        if(this.selectedArray.length === selectedKey){
                            this.closeDialog()
                            this.selectedArray = []
                            this.$store.dispatch("global/finishLoading")
                        }else{
                            this.batchDeleteDomain(selectedKey)
                        }
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
        chooseCdnFilter() {
            // console.log(this.selectedCDN);
            this.selectedCDN.sort();
            this.filterAction();
        },
        chooseGroupFilter() {
            // console.log(this.selectedGroup);

            this.filterAction();
        },
        chooseCDN() {
            var id = this.cdn.cdn_provider.id
            this.cdn.cdn_provider_id = id
            delete this.cdn.cdn_provider
        },
        filterAction() {
            console.log(this.filterData);
            console.log(this.selectedCDN);
            // console.log(this.selectedCDN.length, this.selectedGroup);
            if (this.selectedCDN.length !== 0 && this.selectedGroup == "") {
                this.filteredItems = [];
                // console.log("type A");
                if (this.selectedCDN.join() == "Not Set") {
                    this.filterData.forEach((o, i) => {
                        if (o.cdns.length == 0) {
                            this.filteredItems.push(o);
                        }
                    });
                } else {
                    this.filterData.forEach((o, i) => {
                        o.cdnArrayName.sort();
                        if (
                            // o.cdnArrayName.join().includes(this.selectedCDN.join()) == true
                            o.cdnArrayName.find(cdnName => {
                                return this.selectedCDN.includes(cdnName)
                            })
                        ) {
                            this.filteredItems.push(o);
                        }
                    });
                }
            }
            if (this.selectedCDN.length !== 0 && this.selectedGroup !== "") {
                // console.log("type B");
                this.filteredItems = [];

                if (
                    this.selectedCDN.join() == "Not Set" &&
                    this.selectedGroup == "Not Set"
                ) {
                    this.filterData.forEach((o, i) => {
                        if (o.cdns.length == 0 && o.domain_group.length == 0) {
                            this.filteredItems.push(o);
                        }
                    });
                } else if (
                    this.selectedCDN.join() !== "Not Set" &&
                    this.selectedGroup == "Not Set"
                ) {
                    this.filterData.forEach((o, i) => {
                        if (
                            o.domain_group.length == 0 &&
                            // o.cdnArrayName.join().includes(this.selectedCDN.join()) == true
                            o.cdnArrayName.find(cdnName => {
                                return this.selectedCDN.includes(cdnName)
                            })
                        ) {
                            this.filteredItems.push(o);
                        }
                    });
                } else {
                    this.filterData.forEach((o, i) => {
                        o.cdnArrayName.sort();
                        if (
                            o.domain_group.length !== 0 &&
                            // o.cdnArrayName.join().includes(this.selectedCDN.join()) == true
                            o.cdnArrayName.find(cdnName => {
                                return this.selectedCDN.includes(cdnName)
                            }) &&
                            o.domain_group[0].name == this.selectedGroup
                        ) {
                            this.filteredItems.push(o);
                        }
                    });
                }
            }
            if (this.selectedCDN.length == 0 && this.selectedGroup == "") {
                // console.log("type C");
                this.filteredItems = this.filterData;
            }
            if (this.selectedCDN.length == 0 && this.selectedGroup !== "") {
                // console.log("type D");
                this.filteredItems = [];
                if (this.selectedGroup == "Not Set") {
                    // console.log("null");
                    this.filterData.forEach((o, i) => {
                        if (o.domain_group.length == 0) {
                            this.filteredItems.push(o);
                        }
                    });
                } else {
                    this.filterData.forEach((o, i) => {
                        if (
                            o.domain_group.length !== 0 &&
                            o.domain_group[0].name === this.selectedGroup
                        ) {
                            this.filteredItems.push(o);
                        }
                    });
                }
            }
        },
        pickFile() {
            this.$refs.file.click();
            this.$refs.file.value = "";
        },
        handleFileUpload() {
            // console.log(this.$refs.file.value.toLowerCase(), "newfile");

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
            this.batchData.permission_id = this.permission_id;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/batchNewDomainsAndCdns", this.batchData)
                .then(
                    function(result) {
                        this.initialApis();
                        this.getProcess();
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
        getProcess() {
            var info = {
                ugid: this.user_group_id,
                permission_id: this.permission_id
            };
            this.$store
                .dispatch("process/getProcess", info)
                .then(
                    function(result) {
                        // console.log(result.data);
                        // var fakeResult = {
                        //     all: 5,
                        //     done: 5,
                        //     process: 0
                        // };
                        // result.data = fakeResult;
                        // console.log(result.data);

                        this.progressData = result.data;
                        this.progress =
                            (result.data.done / result.data.all) * 100;

                        var vm = this;
                        if (result.data.done !== result.data.all) {
                            this.batchStatus = true;
                            this.showGetResultBtn = false;
                            setTimeout(function() {
                                vm.getProcess();
                            }, 5000);
                        } else if (
                            result.data.done == result.data.all &&
                            result.data.done !== 0 &&
                            result.data.all !== 0
                        ) {
                            //result按鈕
                            this.batchStatus = true;
                            this.showGetResultBtn = true;
                        } else {
                            this.batchStatus = false;
                            this.showGetResultBtn = false;
                        }
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
        getProcessResult() {
            this.dialog.check = true;
            this.info = [];
            this.detailInfo = [];
            var domainName = [];
            // console.log("getResult");
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("process/getProcessResult", this.permission_id)
                .then(
                    function(result) {
                        // console.log(result.data);
                        result.data.success.domain.forEach((o, i) => {
                            var msg = [];
                            msg.push("Success");
                            o.message = msg;
                            var detail = {};
                            detail.domain_name = o.name;
                            detail.status = o.message;
                            domainName.push(detail);
                        });
                        result.data.failure.domain.forEach((o, i) => {
                            if (o.message == null) {
                                var msg = [];
                                o.cdn.forEach((obj, idx) => {
                                    msg.push(obj.message);
                                });
                                o.message = msg;
                            } else if (
                                o.message == "Domain Already Existed." &&
                                o.cdn.length !== 0
                            ) {
                                var msg = [];
                                o.cdn.forEach((obj, idx) => {
                                    msg.push(obj.message);
                                });
                                o.message = msg;
                                // console.log(o.message);
                            } else {
                                var msg = [];
                                msg.push(o.message);
                                o.message = msg;
                            }
                            var detail = {};
                            detail.domain_name = o.name;
                            detail.status = o.message;
                            domainName.push(detail);
                        });
                        this.info = domainName;
                        if (this.dialog.check == true) {
                            this.detailInfo = this.info;
                        }
                        // console.log(this.info, "domainName");

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
        exportFile() {
            this.exportData = [];
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
                .dispatch("cdnProviders/getAllCdnProvider", this.permission_id)
                .then(
                    function(result) {
                        this.cdnProvider = result.data;
                        this.cdnProvider.forEach(
                            (item => {
                                this.cdnProviderMapping[item.id] = item.name;
                            }).bind(this)
                        );
                        // console.log(this.cdnProvider);

                        // (傻眼貓咪) 過濾器 Select CDN 
                        this.cdnArray = result.data;
                        var nullArray = {
                            name: "Not Set"
                        };
                        this.cdnArray.push(nullArray);
                        this.cdnArray.forEach((o, i) => {
                            o.disable = {};
                            o.disable.status = false;
                        });

                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        return Promise.reject(error);
                    }.bind(this)
                );
        },
        // mapping() {
        //     this.rawData.forEach((o, i) => {
        //         o.cdnArray = [];
        //         o.cdnArrayName = [];
        //         o.cdnArrayCname = [];

        //         o.cdns.forEach((obj, idx) => {
        //             o.cdnArrayName.push(
        //                 this.cdnProviderMapping[obj.cdn_provider_id]
        //             );
        //             o.cdnArrayCname.push(obj.cname);
        //             var cdn = {};
        //             cdn.default = obj.default;
        //             cdn.name = this.cdnProviderMapping[obj.cdn_provider_id];
        //             o.cdnArray.push(cdn);
        //         });
        //     });
        //     this.filterData = this.rawData;
        //     this.filteredItems = this.filterData;
        //     this.filterData.forEach((o, i) => {
        //         o.permission_id = this.permission_id;
        //         if (o.domain_group.length !== 0) {
        //             this.groupArray.push(o.domain_group[0].name);
        //         }
        //         // o.cdnArray.forEach((obj, idx) => {
        //         //     this.cdnArray.push(obj.name);
        //         // });
        //     });
        //     var nullArray = {
        //         name: "Not Set"
        //     };
        //     this.groupArray.push(nullArray);
        //     // console.log(this.cdnArray);
        //     // console.log(this.filterData, "mm");
        // },
        
        // 調整使用新 API justin 2020-03-09
        mappingDomainsBySql() {
            this.rawData.forEach((o, i) => {
                o.cdnArray = [];
                o.cdnArrayName = [];
                o.cdnArrayCname = [];

                o.cdns.forEach((obj, idx) => {
                    o.cdnArrayName.push(
                        this.cdnProviderMapping[obj.cdn_provider_id]
                    );
                    o.cdnArrayCname.push(obj.cname);
                    var cdn = {};
                    cdn.default = obj.default;
                    cdn.name = this.cdnProviderMapping[obj.cdn_provider_id];
                    o.cdnArray.push(cdn);
                });
            });
            this.filterData = this.rawData;
            this.filteredItems = this.filterData;
            this.filterData.forEach((o, i) => {
                if (o.group_name) {
                    this.groupArray.push(o.group_name);
                }
            });
            var nullArray = {
                name: "Not Set"
            };
            this.groupArray.push(nullArray);
        },
        getAllDomains: function() {
            var domain = {
                id: this.user_group_id,
                permission_id: this.permission_id
            };
            return this.$store
                // 調整使用新 API justin 2020-03-09
                // .dispatch("domains/getAllDomains", domain)
                .dispatch("domains/getAllDomainsBySql", domain)
                .then(
                    function(result) {
                        // 調整至原本 API 格式 justin 2020-03-09
                        for (var i = 0; i < result.data.domains.length; i++) {
                            var cdn_provider_id = result.data.domains[i].cdn_provider_id === null ? null : result.data.domains[i].cdn_provider_id.split(",");
                            var cdn_cname = result.data.domains[i].cdn_cname === null ? null : result.data.domains[i].cdn_cname.split(",");
                            var cdn_default = result.data.domains[i].cdn_default === null ? null : result.data.domains[i].cdn_default.split(",");
                            var cdn_id= result.data.domains[i].cdn_id === null ? null : result.data.domains[i].cdn_id.split(",");
                            result.data.domains[i].domain_group = [{name: result.data.domains[i].group_name}];
                            result.data.domains[i].cdns = [];
                            if (cdn_provider_id !== null) {
                                for (var j = 0; j < cdn_provider_id.length; j++) {
                                    result.data.domains[i].cdns.push({
                                        "cdn_provider_id": parseInt(cdn_provider_id[j]),
                                        "cname": cdn_cname[j],
                                        "default": cdn_default[j] === "1" ? true : false,
                                        "id": cdn_id[j],
                                    });
                                }
                            }
                        }

                        this.rawData = result.data.domains;
                        this.dnsPodDomain = result.data.dnsPodDomain;
                        this.rawData.forEach((o, i) => {
                            o.cname = o.cname + "." + this.dnsPodDomain;
                            o.index = i + 1;
                        });
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
                        // 效能調適 justin 2020-03-09
                        // this.mapping();
                        this.mappingDomainsBySql();
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
            if(!this.cdn.cdn_provider_id){
                this.$store.dispatch(
                    'global/showSnackbarError',
                    'Please select correct CDN Provider name'
                )
                return
            }

            this.domain.user_group_id = this.$store.getters[
                "account/accountGroupId"
            ]();
            this.domain.cname = this.domain.name;
            this.domain.permission_id = this.permission_id;
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
            this.cdn.permission_id = this.permission_id;
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
            this.domain.permission_id = this.permission_id;
            this.$store
                .dispatch("domains/deleteDomain", this.domain)
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
            this.dialog.batchDelete = false;
        },
        closeAlertDialog() {
            this.dialog.alert = false;
        },
        clearBtn() {
            this.selectedCDN = [];
            this.selectedGroup = "";
            this.searchText = "";
            this.doSearchText = "";
            this.filterAction();
        },
        goToNextPage(data) {
            // console.log(data);
            this.$router.push({
                name: "DomainInfo",
                params: {
                    domain_id: data.id,
                    info: data
                }
            });
        },
        closeCheckDialog() {
            this.$store.dispatch("global/finishLoading");
            this.dialog.check = false;
            this.batchStatus = false;
            this.info = [];
            this.detailInfo = [];
            this.initialApis();
            this.selectedArray = new Array();
        },
        checkPagePermission() {
            this.permission = JSON.parse(localStorage.getItem("permission"));

            this.permission.forEach((o, i) => {
                if (o.permission.name == this.$route.meta.sideBar) {
                    this.permission_id = o.permission.id;
                }
            });
        },
        checkCurrentPage(){
            const componentName = this.$options.name.toString()
            return componentName == 'DomainSetting'
        }
    },
    created() {
        this.checkPagePermission();
        this.user_group_id = this.$store.getters["account/accountGroupId"]();
        this.initialApis();
        this.getProcess();
    }
};
</script>