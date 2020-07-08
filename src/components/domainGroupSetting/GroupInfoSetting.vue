<template lang="pug">
    v-layout(wrap)
        v-flex(xs12)
            v-card
                v-card-title 
                    .subheading Group Info
                    v-spacer
                    v-btn.my-0(color="primary" title="edit" @click="editItem(groupInfo,'groupInfo')") Edit
                v-divider
                v-card-text
                    v-layout(wrap row)
                        v-flex(sm5 md2)
                            .text.font-weight-bold Group Name
                        v-flex(sm5 md10)
                            .text {{groupInfo.name}}
                        v-flex(sm5 md2)
                            .text.font-weight-bold Note
                        v-flex(sm5 md10)
                            .text {{groupInfo.label}}
                        v-flex(sm5 md2)
                            .text.font-weight-bold CDNs
                        v-flex(sm5 md10)
                            .text {{this.cdnArray.join(', ')}}
                            //- v-layout(row wrap)
                            //-     v-flex(v-for="(item,index) in cdnProvider" :key="item.name" )
                            //-         v-checkbox(:label="item.name" v-model="item.selected" readonly=true color="primary")
                        v-flex(sm5 md2)
                            .text.font-weight-bold Default CDN Provider
                        v-flex(sm5 md2)    
                            v-select(:items="groupCdnProvider" item-text="name" item-value="name" @change="chooseCdnProvider(defaultCdnProvider)" v-model="defaultCdnProvider" :item-disabled="['disable', 'status']")
                            
                v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
                        v-card
                            v-card-title.title Edit Group
                            v-card-text
                                v-form(ref="editGroupForm")
                                    v-text-field(v-model="groupEditedInfo.name" label="Group" type="text" name="name" :rules="[rules.required]")
                                    v-text-field(v-model="groupEditedInfo.label" label="Label" type="text" name="label")
                            v-card-actions  
                                v-spacer
                                v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                                v-btn(color="primary" flat="flat" @click="updateGroup") Save
                v-dialog.change-default-dialog(v-model="dialog.changeDefault" max-width="460" persistent)
                    v-card
                        v-card-title.title Change Group Default CDN Provider
                        v-card-text Are you sure want to change this group's CDN provider to  "{{defaultCdnProvider}}" ?
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="updateGroupCdnProvider") Save
        v-flex(xs12)
            v-card
                v-card-title
                    .subheading Domain List
                    v-spacer
                    v-btn.my-0(color="primary" @click="addItem") Add Domain
                    v-btn.my-0(color="error" @click="deleteAction") Batch Delete Domain
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
                h7-selectable-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line @childMethod="deleteMethod")
                    template(slot="items" slot-scope="{props, index}")
                        tr 
                            td
                                v-checkbox(v-model="props.selected" primary hide-details)
                            td {{props.item.index}}
                            td {{props.item.name}}
                            td {{cdnArray.join(', ')}}
                            td
                                v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item, 'delete')")
                                            v-icon(small) delete
                //- h7-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line )
                //-     template(slot="items" slot-scope="{props, index}")
                //-         tr
                //-             td {{index}}
                //-             td {{props.item.name}}
                //-             td {{cdnArray.join(', ')}}
                //-             td
                //-                 v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item, 'delete')")
                //-                             v-icon(small) delete

            v-dialog.edit-dialog(v-model="dialog.editDomain" max-width="960" persistent)
                v-card
                    v-card-title.title Add Domain to {{groupInfo.name}}
                    v-card-text
                        v-flex(xs12 sm6 md4)
                            v-text-field(v-model="innerSearchText" append-icon="search" label="Search" single-line hide-details)
                        h7-selectable-data-table(:headers="domainListHeaders" :items="domainList" :loading="$store.state.global.isLoading" :search-text="innerSearchText" :per-page="10" single-line @childMethod="parentMethod")
                            template(slot="items" slot-scope="{props, index}")
                                tr 
                                    td
                                        v-checkbox(v-model="props.selected" primary hide-details)
                                    td.text-xs-center {{props.item.index}}
                                    td.text-xs-center {{props.item.name}}
                        //- v-data-table.elevation-1(v-model="selected" :headers="domainListHeaders" :items="domainList" select-all hide-actions)
                        //-     template(v-slot:items="props")
                        //-         td 
                        //-             v-checkbox(v-model="props.selected" primary hide-details)
                        //-         td {{props.index + 1}}
                        //-         td {{props.item.name}}
                                //- td {{props.item.cdnArray.join()}}

                    v-card-actions  
                        v-spacer
                        v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                        v-btn(color="primary" flat="flat" @click="updateDomain('newDomain')") Save
            v-dialog.delete-dialog(v-model="dialog.delete" max-width="960" persistent)
                v-card
                    v-card-title.title Delete Domain from {{groupInfo.name}}
                    v-card-text Are you sure want to delete "{{domainInfo.name}}" from {{groupInfo.name}} ?
                    v-card-actions  
                        v-spacer
                        v-btn(color="error" flat="flat" @click="updateDomain('deleteDomain')") Delete
                        v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
            v-dialog.delete-dialog(v-model="dialog.batchDelete" max-width="960" persistent)
                    v-card
                        v-card-title.title Batch Delete Domain from {{groupInfo.name}}
                        v-card-text Are you sure want to delete 
                            span(v-for="item in selectedDomains") "{{item.name}}"
                            span ?
                        v-card-actions  
                            v-spacer
                            v-btn(color="error" flat="flat" @click="batchDeleteAction") Delete
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
            v-dialog.alert-dialog(v-model="dialog.alert" max-width="960" persistent)
                v-card 
                    v-card-title.title Batch delete domain from this group
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
                                    span(style="color: green;font-weight:600" :style="props.item.status === 'Success' ? 'color:green;font-weight: 600' : 'color: red'") {{props.item.status}}
                    v-card-actions  
                        v-spacer
                        v-btn(color="primary" flat="flat" @click="closeCheckDialog") OK

</template>
<script>
import textFieldRules from "../../utils/textFieldRules.js";
import _ from "lodash";
import XLSX from "xlsx";
import timeUtils from "../../utils/timeUtils.js";

export default {
    mixins: [textFieldRules, timeUtils],
    data() {
        return {
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
            page: [10, 25, 50, 200, 500, "All"],
            pagination: {
                rowsPerPage: 20
            },
            rowsPerPageItems: [
                { name: "20 per page", value: 20 },
                { name: "50 per pages", value: 50 }
            ],
            perPage: 5,
            pages: 0,
            domainListHeaders: [
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
                }
                // {
                //     text: "CDNs",
                //     align: "center",
                //     sortable: false,
                //     value: "cdnArray"
                // }
            ],
            // selected: [],
            selectedArray: [],
            selectedDomains: [],
            items: [
                {
                    text: "a",
                    disabled: false,
                    a: {
                        b: false
                    }
                },
                {
                    text: "b",
                    disabled: false,
                    a: {
                        b: true
                    }
                }
            ],
            groupId: "",
            searchText: "",
            innerSearchText: "",
            headers: [
                {
                    text: "#",
                    align: "left",
                    sortable: false,
                    width: "80px",
                    value: "index"
                },
                {
                    text: "Domain Name",
                    align: "left",
                    sortable: true,
                    value: "name"
                },
                {
                    text: "CDNs",
                    align: "left",
                    sortable: false,
                    value: "cdnArray"
                },
                {
                    text: "Actions",
                    align: "left",
                    sortable: false,
                    width: "150px"
                }
            ],
            filterData: [],
            groupCdnProvider: [],
            groupInfo: {},
            domainInfo: {
                domainId: ""
            },
            dialog: {
                edit: false,
                editDomain: false,
                changeDefault: false,
                delete: false,
                batchDelete: false,
                alert: false,
                check: false
            },
            selectedCdnProvider: {},
            cdnProvider: [],
            cdnProviderMapping: {},
            cdnProviderIdMapping: {},
            type: "",
            allDomainsData: [],
            cdnArray: [],
            domainList: [],
            batchData: {
                domains: []
            },
            defaultCdnProvider: "",
            groupEditedInfo: {},
            permission: [],
            permission_id: 0
        };
    },
    methods: {
        chooseDomainList(val) {
            // console.log(val);
        },
        parentMethod(data) {
            this.selectedArray = data;
            // console.log(this.selectedArray);
        },
        deleteMethod(data) {
            // console.log(data);
            this.selectedDomains = data;
        },
        deleteAction() {
            if (this.selectedDomains.length == 0) {
                this.dialog.alert = true;
            } else {
                this.dialog.batchDelete = true;
            }
            // console.log(this.selectedDomains);
        },
        batchDeleteAction() {
            var domainName = [];
            var selectObject = [];
            selectObject = this.selectedDomains;
            this.info = [];
            this.detailInfo = [];
            this.dialog.check = true;

            this.$store.dispatch("global/startLoading");
            this.selectedDomains.forEach((o, i) => {
                o.groupId = this.groupInfo.id;
                o.permission_id = this.permission_id;
                this.$store
                    .dispatch("grouping/deleteDomainFromGroup", o)
                    .then(
                        function(result) {
                            var detail = {};
                            detail.domain_name = result.data.name;
                            detail.status = result.message;
                            domainName.push(detail);
                            this.info = domainName;
                            if (this.dialog.check == true) {
                                this.detailInfo = this.info;
                            }

                            var selectArrayLength = 0;
                            selectArrayLength = selectObject.length;
                            // console.log(selectArrayLength, this.info.length);
                            if (selectArrayLength == this.info.length) {
                                this.initialApis();
                            }
                        }.bind(this)
                    )
                    .catch(
                        function(error) {
                            // console.log(error);
                            var detail = {};
                            detail.domain_name = error.data.name;
                            detail.status = error.message;
                            domainName.push(detail);

                            this.info = domainName;
                            if (this.dialog.check == true) {
                                this.detailInfo = this.info;
                            }
                            this.$store.dispatch("global/finishLoading");
                        }.bind(this)
                    );
            });
            this.closeEditDialog();
        },
        chooseCdnProvider(defaultCdnProvider) {
            this.defaultCdnProvider = defaultCdnProvider;
            this.selectedCdnProvider = this.cdnProviderMapping[
                this.defaultCdnProvider
            ];
            this.dialog.changeDefault = true;
        },
        chooseDomain(value) {
            this.domainInfo.domainId = value;
        },
        pickFile() {
            this.$refs.file.click();
            this.$refs.file.value = "";
        },
        handleFileUpload() {
            // console.log(this.$refs.file, "newfile");
            var vm = this;
            var fileUpload = this.$refs.file;
            // console.log(fileUpload)
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
            // console.log(excelRows, "excel");
            this.batchData.domains = [];
            this.batchData.domains = excelRows;
            // console.log(excelRows);
            this.batchData.domains.forEach((o, i) => {
                o.name = o.Domain;
                delete o.Domain;
            });
            this.batchAddDomains();
            // console.log(this.batchData);
        },
        batchAddDomains() {
            var batchData = [];
            batchData.groupId = this.groupId;
            batchData.data = this.batchData;
            batchData.permission_id = this.permission_id;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("grouping/batchNewDomainByGroupId", batchData)
                .then(
                    function(result) {
                        this.initialApis();
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Batch add domains to this group success!"
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
            this.exportData = [];
            this.filterData.forEach((o, i) => {
                var exportData = {};
                exportData.Domain = o.name;
                this.exportData.push(exportData);
            });
            // console.log(this.exportData, "export");

            var domainWS = XLSX.utils.json_to_sheet(this.exportData);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, domainWS, "domain");
            XLSX.writeFile(
                wb,
                this.groupInfo.name +
                    timeUtils.methods.timestampToString(
                        new Date().getTime() / 1000
                    ) +
                    ".xlsx"
            );
        },
        getGroupInfo() {
            var group = {
                id: this.groupId,
                permission_id: this.permission_id
            };
            return this.$store
                .dispatch("grouping/getGroupById", group)
                .then(
                    function(result) {
                        this.groupInfo = result.data;
                        this.filterData = this.groupInfo.domains;
                        this.filterData.forEach((o, i) => {
                            o.index = i + 1;
                        });
                        this.groupCdnProvider = this.groupInfo.domains[0].cdn_provider;
                        this.groupCdnProvider.forEach((o, i) => {
                            o.disable = {};
                            o.disable.status = !o.status;
                        });
                        this.defaultCdnProvider = this.groupInfo.default_cdn_name;
                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        // if (error == 404) {
                        //     this.goBackPage();
                        // }
                        // return Promise.reject(error);
                    }.bind(this)
                );
        },
        goBackPage() {
            this.$router.push({
                name: "grouping"
            });
        },
        getAllDomains: function() {
            var domain = {
                ugid: this.$store.getters["account/accountGroupId"](),
                permission_id: this.permission_id
            };
            return this.$store
                // .dispatch("domains/getDomainsByNullGroup", domain)
                .dispatch("domains/getDomainsByNullGroupBySql", domain)
                .then(
                    function(result) {
                        // 調整至原本 API 格式 justin 2020-03-09
                        for (var i = 0; i < result.data.domains.length; i++) {
                            var cdn_provider_id = result.data.domains[i].cdn_provider_id === null ? null : result.data.domains[i].cdn_provider_id.split(",");
                            var cdn_cname = result.data.domains[i].cdn_cname === null ? null : result.data.domains[i].cdn_cname.split(",");
                            var cdn_default = result.data.domains[i].cdn_default === null ? null : result.data.domains[i].cdn_default.split(",");

                            result.data.domains[i].domain_group = [{name: result.data.domains[i].group_name}];
                            result.data.domains[i].cdns = [];
                            if (cdn_provider_id !== null) {
                                for (var j = 0; j < cdn_provider_id.length; j++) {
                                    result.data.domains[i].cdns.push({
                                        "cdn_provider_id": parseInt(cdn_provider_id[j]),
                                        "cname": cdn_cname[j],
                                        "default": cdn_default[j] === "1" ? true : false,
                                    });
                                }
                            }
                        }
                        
                        this.allDomainsData = result.data.domains;
                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        return Promise.reject(error);
                    }.bind(this)
                );
        },
        getAllCdnProvider() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/getAllCdnProvider", this.permission_id)
                .then(
                    function(result) {
                        this.cdnProvider = result.data;
                        this.cdnProvider.forEach(
                            (item => {
                                this.cdnProviderMapping[item.name] = item.id;
                            }).bind(this)
                        );
                        this.cdnProvider.forEach(
                            (item => {
                                this.cdnProviderIdMapping[item.id] = item.name;
                            }).bind(this)
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
        initialApis: function() {
            this.$store.dispatch("global/startLoading");
            Promise.all([
                this.getGroupInfo(),
                this.getAllCdnProvider(),
                this.getAllDomains()
            ])
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
        mapping() {
            //把group的cdnArray塞到此group的domain裡
            this.filterData.forEach((o, i) => {
                o.cdnArray = [];
                o.cdn_provider.forEach((obj, idx) => {
                    o.cdnArray.push(obj.name);
                });
                this.cdnArray = o.cdnArray;
            });
            this.cdnArray.sort();
            //把每個孤兒domain的cdn name提出來到cdnArray & sort
            this.allDomainsData.forEach((o, i) => {
                o.cdnArray = [];
                o.cdns.forEach((obj, idx) => {
                    // console.log(this.cdnProviderIdMapping);
                    // console.log(this.cdnProviderIdMapping[obj.cdn_provider_id]);
                    o.cdnArray.push(
                        this.cdnProviderIdMapping[obj.cdn_provider_id]
                    );
                });
                o.cdnArray.sort();
            });
            //從孤兒domainList篩掉不同cdn的domain
            this.domainList = [];
            this.allDomainsData.forEach((o, i) => {
                if (o.cdnArray.join(", ") === this.cdnArray.join(", ")) {
                    this.domainList.push(o);
                }
            });
            //篩掉已經被新增在group裡的domain

            this.domainList.forEach((o, i) => {
                this.filterData.forEach((obj, idx) => {
                    if (o.name == obj.name) {
                        delete this.domainList[i];
                    }
                });
            });
            this.domainList = _.compact(this.domainList);
            this.domainList.forEach((o, i) => {
                o.index = i + 1;
            });
            // console.log(this.domainList, "domainList");
        },
        addItem: function() {
            // this.$refs.editForm.reset();
            this.editedIndex = -1;
            this.dialog.editDomain = true;
            this.type = "NewDomain";
        },
        editItem: function(item, type) {
            this.type = type;
            if (type == "groupInfo") {
                // console.log(item);

                this.editedIndex = this.filterData.indexOf(item);
                this.dialog.edit = true;
                this.groupEditedInfo = Object.assign({}, item);
            } else {
                //delete
                this.dialog.delete = true;
                this.domainInfo = Object.assign({}, item);
                // console.log(this.domainInfo, "delete");
            }
        },
        updateGroup: function() {
            // console.log(this.groupInfo, "edit");
            this.groupEditedInfo.permission_id = this.permission_id;
            if (this.$refs.editGroupForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("grouping/updateGroup", this.groupEditedInfo)
                    .then(
                        function(result) {
                            this.$store.dispatch("global/finishLoading");
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Update group info success!"
                            );
                            this.initialApis();
                            this.$emit("childMethod");
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
        },
        updateGroupCdnProvider() {
            this.dialog.changeDefault = false;
            var defaultCdnData = [];
            defaultCdnData.groupId = this.groupId;
            defaultCdnData.defaultCdnId = this.selectedCdnProvider;
            defaultCdnData.permission_id = this.permission_id;

            this.$store.dispatch(
                "global/showSnackbarWarning",
                "Changing default CDN provider!"
            );

            // console.log(defaultCdnData, "changeDefault");
            // this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("grouping/changeGroupCdnProvider", defaultCdnData)
                .then(
                    function(result) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change group's default CDN provider success!"
                        );
                        this.initialApis();
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
        },
        updateDomain: function(type) {
            // console.log(type);
            // console.log(this.domainInfo, type);
            this.domainInfo.groupId = this.groupInfo.id;
            if (type == "newDomain") {
                this.addNewDomain();
            } else {
                this.deleteDomain();
            }
        },
        addNewDomain() {
            var selectObject = [];
            selectObject = this.selectedArray;
            this.info = [];
            this.detailInfo = [];
            this.dialog.check = true;
            var domainName = [];
            this.$store.dispatch("global/startLoading");
            this.selectedArray.forEach((o, i) => {
                this.domainInfo.domainId = o.id;
                this.domainInfo.permission_id = this.permission_id;
                this.$store
                    .dispatch("grouping/newDomainByGroupId", this.domainInfo)
                    .then(
                        function(result) {
                            var detail = {};
                            detail.domain_name = result.data.domain.name;
                            detail.status = "Success";
                            domainName.push(detail);
                            this.info = domainName;
                            if (this.dialog.check == true) {
                                this.detailInfo = this.info;
                            }

                            var selectArrayLength = 0;
                            selectArrayLength = selectObject.length;
                            // console.log(selectArrayLength, this.info.length);
                            if (selectArrayLength == this.info.length) {
                                this.initialApis();
                            }
                            // this.$store.dispatch("global/finishLoading");
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
            });
            this.closeEditDialog();
        },
        deleteDomain() {
            // console.log(this.domainInfo, "delete");
            this.domainInfo.permission_id = this.permission_id;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("grouping/deleteDomainFromGroup", this.domainInfo)
                .then(
                    function(result) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Delete domain from group success!"
                        );
                        this.initialApis();
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
        },

        closeEditDialog: function() {
            // console.log(this.type);
            if (this.type == "groupInfo") {
                this.dialog.edit = false;
                this.getGroupInfo();
            } else {
                this.dialog.editDomain = false;
                this.dialog.changeDefault = false;
                this.dialog.delete = false;
                this.dialog.batchDelete = false;
            }
        },
        closeAlertDialog() {
            this.dialog.alert = false;
        },
        closeCheckDialog() {
            this.$store.dispatch("global/finishLoading");
            this.dialog.check = false;
            this.initialApis();
        },
        checkPagePermission() {
            this.permission = JSON.parse(localStorage.getItem("permission"));

            this.permission.forEach((o, i) => {
                if (o.permission.name == this.$route.meta.sideBar) {
                    this.permission_id = o.permission.id;
                }
            });
            // console.log(this.permission_id);
        }
    },
    mounted() {
        this.groupId = this.$route.params.groupId;
        this.initialApis();
    },
    created() {
        this.checkPagePermission();
    }
};
</script>
<style lang="sass">
.v-card
    word-break: break-all
</style>
