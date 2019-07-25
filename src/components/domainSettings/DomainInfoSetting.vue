<template lang="pug">
    v-layout(wrap)
        v-flex(xs12)
            v-card
                v-card-title 
                    .subheading Domain Info
                    v-spacer
                    v-btn.my-0(color="primary" title="edit" @click="editItem(domainInfo,'domainInfo')") Edit
                v-divider
                v-card-text
                    v-layout(wrap row)
                        v-flex(sm5 md2)
                            .text.font-weight-bold Domain Name
                        v-flex(sm5 md10)
                            .text {{domainInfo.name}}
                        v-flex(sm5 md2)
                            .text.font-weight-bold Cname
                        v-flex(sm5 md10)
                            .text {{domainInfo.cname}}.{{dnsPodDomain}}
                        v-flex(sm5 md2)
                            .text.font-weight-bold Group
                        v-flex(sm5 md10)
                            .text {{domainInfo.domain_group.length == 0 ? '' : domainInfo.domain_group[0].name}}
                        v-flex(sm5 md2)
                            .text.font-weight-bold Label
                        v-flex(sm5 md10)
                            .text {{domainInfo.label}}
                v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
                        v-card
                            v-card-title.title Edit Domain
                            v-card-text
                                v-form(ref="editDomainForm")
                                    v-text-field(v-model="domainEditedInfo.name" label="Domain" type="text" name="name" :rules="[rules.required]")
                                    v-text-field(v-model="domainEditedInfo.label" label="Label" type="text" name="label")
                            v-card-actions  
                                v-spacer
                                v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                                v-btn(color="primary" flat="flat" @click="updateDomain") Save
        v-flex(xs12)
            v-card
                v-card-title
                    .subheading CDN
                    v-spacer
                    v-btn.my-0(color="primary" @click="addItem" :disabled="domainInfo.domain_group.length !== 0") Add CDN
                v-divider
                v-card-text
                    v-layout(wrap v-if="domainInfo.domain_group.length !== 0")
                        v-flex(xs12 sm12 md12 )
                            v-alert(:value="true" type="warning" outline icon="priority_high") You can not change this domain's cdn setting because this domain's cdn setting depend on its group. 
                    v-layout(wrap)
                        v-flex(xs12 sm6 md4)
                            v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                h7-data-table(:headers="headers" :items="cdnData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line)
                    template(slot="items" slot-scope="{props, index}")
                        tr(:class="props.item.cdn_provider.status ? '' : 'grey--text'")
                            td {{index}}
                            td {{props.item.cdn_provider.name}}
                            td {{props.item.cname}}
                            td
                                v-icon(large color="green" v-if="props.item.default == true") check
                            td
                                v-btn.ma-0(flat icon small color="primary" slot="activator" v-if="domainInfo.domain_group.length !== 0" :disabled="domainInfo.domain_group.length !== 0")
                                    v-icon(small) more_vert
                                v-menu(offset-y left v-else) 
                                    v-tooltip(right slot="activator") 
                                        v-btn.ma-0(flat icon small color="primary" slot="activator" )
                                            v-icon(small) more_vert
                                        span More
                                    v-list.pa-0
                                        v-list-tile(@click="editItem(props.item, 'edit')" :disabled="props.item.default == false ? false : true")
                                            v-list-tile-title Edit cname
                                        v-list-tile(@click="editItem(props.item, 'changeDefault')" :disabled="props.item.default == false ? false : true ")
                                            v-list-tile-title Change to default
                                        v-list-tile(@click="editItem(props.item, 'delete')" :disabled="props.item.default == false ? false : true ")
                                            v-list-tile-title Delete

            v-dialog.edit-dialog(v-model="dialog.editCDN" max-width="460" persistent)
                v-card
                    v-card-title.title {{formTitle}}
                    v-card-text
                        v-form(ref="editForm")
                            v-select(:items="filteredCdnProvider" label="CDN Name" item-text="name" item-value="id" @change="chooseCDN(cdn.cdn_provider_id)" v-model="cdn.cdn_provider_id" v-if="editedIndex == -1")
                            v-text-field(v-model="cdn.cname" label="CDN CName" type="text" name="cname" :rules="[rules.domain]")
                    v-card-actions  
                        v-spacer
                        v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                        v-btn(color="primary" flat="flat" @click="updateCDN('newCDN')") Save
            v-dialog.change-default-dialog(v-model="dialog.changeDefault" max-width="460" persistent)
                v-card
                    v-card-title.title Change Default CDN Provider
                    v-card-text Are you sure want to change your CDN provider to  "{{cdn.cdn_provider.name}}" ?
                    v-card-actions  
                        v-spacer
                        v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                        v-btn(color="primary" flat="flat" @click="updateCDN('changeDefault')") Save
            v-dialog.delete-dialog(v-model="dialog.delete" max-width="460" persistent)
                v-card
                    v-card-title.title Delete CDN Provider
                    v-card-text Are you sure want to delete your CDN provider "{{cdn.cdn_provider.name}}" ?
                    v-card-actions  
                        v-spacer
                        v-btn(color="error" flat="flat" @click="updateCDN('deleteCDN')") Delete
                        v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel

</template>
<script>
import textFieldRules from "../../utils/textFieldRules.js";
import _ from "lodash";

export default {
    mixins: [textFieldRules],
    props: ["domain_id"],
    data() {
        return {
            searchText: "",
            dnsPodDomain: "",
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
                    text: "CDN CName",
                    align: "left",
                    sortable: true,
                    value: "cname"
                },
                {
                    text: "Default",
                    align: "left",
                    sortable: false,
                    value: "default"
                },
                {
                    text: "Actions",
                    align: "left",
                    sortable: false,
                    width: "150px"
                }
            ],
            filterData: [],
            cdnData: [],
            domainInfo: {
                domain_group: []
            },
            domainEditedInfo: {},
            cdn: {
                cdn_provider: {
                    name: ""
                }
            },

            dialog: {
                edit: false,
                editCDN: false,
                changeDefault: false,
                delete: false
            },
            cdnProvider: [],
            cdnProviderMapping: {},
            type: "",
            editedIndex: -1,
            filteredCdnProvider: []
        };
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "New CDN" : "Edit CDN";
        }
    },
    methods: {
        chooseCDN(value) {
            // console.log(value);
        },

        getDomainInfo() {
            // this.domainInfo = this.filterData[0];
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getDomainById", this.domain_id)
                .then(
                    function(result) {
                        this.domainInfo = result.data.domain;
                        // console.log(this.domainInfo, "domainInfo");
                        this.dnsPodDomain = result.data.dnsPodDomain;
                        // console.log(result.data, "inner");
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
        getAllCdnProvider() {
            return this.$store
                .dispatch("cdnProviders/getAllCdnProvider")
                .then(
                    function(result) {
                        this.cdnProvider = result.data;

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
        getCdnData() {
            return this.$store
                .dispatch("cdns/getCDNsByDomainId", this.domain_id)
                .then(
                    function(result) {
                        this.cdnData = result.data;
                        // console.log(this.cdnData);
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
            Promise.all([this.getCdnData(), this.getAllCdnProvider()])
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
            this.cdnProvider.forEach((o, i) => {
                this.cdnData.forEach((obj, idx) => {
                    if (o.id == obj.cdn_provider_id) {
                        // console.log(i);
                        delete this.cdnProvider[i];
                    }
                });
            });
            this.filteredCdnProvider = _.compact(this.cdnProvider);
        },
        addItem: function() {
            this.$refs.editForm.reset();
            this.editedIndex = -1;
            this.dialog.editCDN = true;
            this.type = "NewCdn";
        },
        editItem: function(item, type) {
            this.type = type;
            if (type == "domainInfo") {
                // console.log(item);
                this.editedIndex = this.filterData.indexOf(item);
                this.dialog.edit = true;
                this.domainEditedInfo = Object.assign({}, item);
            } else if (type == "changeDefault") {
                //changeDefault
                this.dialog.changeDefault = true;
                this.cdn = Object.assign({}, item);
            } else if (type == "edit") {
                // edit cname
                this.editedIndex = this.cdnData.indexOf(item);
                this.dialog.editCDN = true;
                this.cdn = Object.assign({}, item);
            } else {
                //delete
                this.dialog.delete = true;
                this.cdn = Object.assign({}, item);
            }
        },
        updateDomain: function() {
            // console.log(this.domainInfo, "edit");
            if (this.$refs.editDomainForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("domains/updateDomain", this.domainEditedInfo)
                    .then(
                        function(result) {
                            this.$store.dispatch("global/finishLoading");
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Update domain info success!"
                            );
                            this.getDomainInfo();
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
        updateCDN: function(type) {
            // console.log(type);
            // console.log(this.cdn, type);
            this.cdn.domain_id = this.domain_id;
            if (type == "newCDN" && this.type == "NewCdn") {
                this.addNewCdn();
            } else if (type == "newCDN" && this.type == "edit") {
                this.changeCdnCname();
            } else if (type == "changeDefault") {
                this.changeDefaultCdnProvider();
            } else {
                this.deleteCdn();
            }
        },
        addNewCdn() {
            // console.log(this.cdn);
            if (this.$refs.editForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("cdns/newCDN", this.cdn)
                    .then(
                        function(result) {
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Add CDN success!"
                            );
                            this.initialApis();
                            this.closeEditDialog();
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
            }
        },
        changeCdnCname() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdns/updateCdnCname", this.cdn)
                .then(
                    function(result) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change CDN cname success!"
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
        changeDefaultCdnProvider() {
            this.cdn.default = !this.cdn.default;
            // console.log(this.cdn);

            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdns/updateDefaultCDN", this.cdn)
                .then(
                    function(result) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change default CDN provider success!"
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
        deleteCdn() {
            // console.log(this.cdn);
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdns/deleteCDN", this.cdn)
                .then(
                    function(result) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change default CDN provider success!"
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
            if (this.type == "domainInfo") {
                this.dialog.edit = false;
                this.getDomainInfo();
            } else {
                this.dialog.editCDN = false;
                this.dialog.changeDefault = false;
                this.dialog.delete = false;
                this.cdn = {
                    cdn_provider: {
                        name: ""
                    }
                };
            }
        }
    },
    mounted() {
        this.getDomainInfo();
        this.initialApis();
    }
};
</script>
<style lang="sass">

</style>
