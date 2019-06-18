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
                            .text {{domainInfo.name}}.{{domainInfo.user_group_id}}.{{dnsPodDomain}}
                        v-flex(sm5 md2)
                            .text.font-weight-bold Group
                        v-flex(sm5 md10)
                            .text group1
                        v-flex(sm5 md2)
                            .text.font-weight-bold Label
                        v-flex(sm5 md10)
                            .text {{domainInfo.label}}
                v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
                    v-card
                        v-card-title.title Edit Domain
                        v-card-text
                            v-form(ref="editDomainForm")
                                v-text-field(v-model="domainInfo.name" label="Domain" type="text" name="name" :rules="[rules.required]")
                                v-text-field(v-model="domainInfo.label" label="Label" type="text" name="label")
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="updateDomain") Save
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
                h7-data-table(:headers="headers" :items="cdnData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line)
                    template(slot="items" slot-scope="{props, index}")
                        tr(:class="props.item.cdn_provider.status ? '' : 'grey--text'")
                            td {{index}}
                            td {{props.item.cdn_provider.name}}
                            td {{props.item.cname}}
                            td
                                v-icon(large color="green darken-2" v-if="props.item.default == true") check
                            td
                                v-menu(offset-y left :disabled="props.item.cdn_provider.status?false:true") 
                                    v-tooltip(right slot="activator") 
                                        v-btn.ma-0(flat icon small color="primary" slot="activator" )
                                            v-icon(small) more_vert
                                        span More
                                    v-list.pa-0
                                        v-list-tile(@click="editItem(props.item, 'changeDefault')" :disabled="props.item.default == false ? false : true")
                                            v-list-tile-title Change to default
                                        v-list-tile(@click="editItem(props.item, 'delete')" :disabled="props.item.default == false ? false : true")
                                            v-list-tile-title Delete
            v-dialog.edit-dialog(v-model="dialog.editCDN" max-width="460" persistent)
                v-card
                    v-card-title.title New CDN
                    v-card-text
                        v-form(ref="editForm")
                            v-select(:items="cdnProvider" label="CDN Name" item-text="name" item-value="id" @change="chooseCDN(cdn.cdn_provider_id)" v-model="cdn.cdn_provider_id" )
                            v-text-field(v-model="cdn.cname" label="CDN CName" type="text" name="cname" :rules="[rules.domain]")
                    v-card-actions  
                        v-spacer
                        v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                        v-btn(color="primary" flat="flat" @click="updateCDN('newCDN')") Save
            v-dialog.edit-dialog(v-model="dialog.changeDefault" max-width="460" persistent)
                v-card
                    v-card-title.title Change CDN Default
                    v-card-text Are you sure want to change your CDN provider to  "{{cdn.cdn_provider.name}}" ?
                    v-card-actions  
                        v-spacer
                        v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                        v-btn(color="primary" flat="flat" @click="updateCDN('changeDefault')") Save
            v-dialog.edit-dialog(v-model="dialog.delete" max-width="460" persistent)
                v-card
                    v-card-title.title Delete CDN Provider
                    v-card-text Are you sure want to delete your CDN provider "{{cdn.cdn_provider.name}}" ?
                    v-card-actions  
                        v-spacer
                        v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                        v-btn(color="primary" flat="flat" @click="updateCDN('deleteCDN')") Save
</template>
<script>
import textFieldRules from "../../utils/textFieldRules.js";

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
            domainInfo: {},
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
            type: ""
        };
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
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/getAllCdnProvider")
                .then(
                    function(result) {
                        this.cdnProvider = result.data;
                        // console.log(this.cdnProvider);
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
        getCdnData() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdns/getCDNsByDomainId", this.domain_id)
                .then(
                    function(result) {
                        this.cdnData = result.data;
                        // console.log(this.cdnData, "cdndata");
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
            this.dialog.editCDN = true;
            this.type = "NewCdn";
        },
        editItem: function(item, type) {
            this.type = type;
            // console.log(item);
            if (type == "domainInfo") {
                // console.log(item);
                this.editedIndex = this.filterData.indexOf(item);
                this.dialog.edit = true;
                this.domainInfo = Object.assign({}, item);
            } else if (type == "changeDefault") {
                //changeDefault
                this.dialog.changeDefault = true;
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
                    .dispatch("domains/updateDomain", this.domainInfo)
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
            if (type == "newCDN") {
                this.addNewCdn();
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
                            this.getCdnData();
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
        changeDefaultCdnProvider() {
            this.cdn.default = !this.cdn.default;
            // console.log(this.cdn);

            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdns/updateCDN", this.cdn)
                .then(
                    function(result) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change default CDN provider success!"
                        );
                        this.getCdnData();
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
                        this.getCdnData();
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
        this.getAllCdnProvider();
        this.getCdnData();
    }
};
</script>
<style lang="sass">

</style>
