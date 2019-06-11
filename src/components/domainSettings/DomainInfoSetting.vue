<template lang="pug">
    v-container#domainInfoSetting
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
                                .text {{domainInfo.group.name}}
                    v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
                        v-card
                            v-card-title.title Edit Domain
                            v-card-text
                                v-form(ref="editForm")
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
                    h7-data-table(:headers="headers" :items="cdnData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="3" single-line)
                        template(slot="items" slot-scope="{props, index}")
                            tr
                                td {{props.index +1}}
                                td {{props.item.name}}
                                td {{props.item.cname}}
                                td
                                    v-icon(large color="green darken-2" v-if="props.item.default == true") check
                                td
                                    v-menu(offset-y left) 
                                        v-tooltip(right slot="activator") 
                                            v-btn.ma-0(flat icon small color="primary" slot="activator")
                                                v-icon( small) more_vert
                                            span More
                                        v-list.pa-0
                                            v-list-tile(@click="editItem(props.item, 0)" :disabled="props.item.default == false ? false : true")
                                                v-list-tile-title Change to default
                                            v-list-tile(@click="editItem(props.item, 1)" :disabled="props.item.default == false ? false : true")
                                                v-list-tile-title Delete
                v-dialog.edit-dialog(v-model="dialog.editCDN" max-width="460" persistent)
                    v-card
                        v-card-title.title New CDN
                        v-card-text
                            v-form(ref="editForm")
                                v-text-field(v-model="cdn.name" label="CDN Name" type="text" name="name" :rules="[rules.required]")
                                v-text-field(v-model="cdn.cname" label="CDN CName" type="text" name="cname" :rules="[rules.domain]")
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="updateCDN('newCDN')") Save
                v-dialog.edit-dialog(v-model="dialog.changeDefault" max-width="460" persistent)
                    v-card
                        v-card-title.title Change CDN Default
                        v-card-text Are you sure want to change your CDN provider to  "{{cdn.name}}" ?
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="updateCDN('changeDefault')") Save
                v-dialog.edit-dialog(v-model="dialog.delete" max-width="460" persistent)
                    v-card
                        v-card-title.title Delete CDN Provider
                        v-card-text Are you sure want to delete your CDN provider "{{cdn.name}}" ?
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="updateCDN('deleteCDN')") Save
            //- v-flex(xs12)
            //-     v-layout(column)
            //-         h3 Domain Name : {{domain.name}}
            //-         h3 CName : {{domain.cname}}.{{dnsPodDomain}}
</template>
<script>
import textFieldRules from "../../utils/textFieldRules.js";

export default {
    mixins: [textFieldRules],
    props: ["domain_id"],
    data() {
        return {
            searchText: "",
            dnsPodDomain: "shiftcdn.com",
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
                }
            ],
            cdnData: [
                {
                    cname: "leo.pod.com",
                    default: true,
                    dns_provider_id: 428438012,
                    domain_id: 1,
                    edited_by: "be81b1f9-24ac-4de2-86a2-5575356e2a47",
                    id: 1,
                    name: "DNSPod",
                    ttl: 6000
                },
                {
                    cname: "leo.cdn.com",
                    default: false,
                    dns_provider_id: 0,
                    domain_id: 1,
                    edited_by: "be81b1f9-24ac-4de2-86a2-5575356e2a47",
                    id: 2,
                    name: "LeoCDN",
                    ttl: 5040
                }
            ],
            domainInfo: {},
            cdn: {},
            dialog: {
                edit: false,
                editCDN: false,
                changeDefault: false,
                delete: false
            }
        };
    },
    methods: {
        getDomainInfo() {
            this.domainInfo = this.filterData[0];
        },
        addItem: function() {
            this.$refs.editForm.reset();
            this.editedIndex = -1;
            this.dialog.editCDN = true;
        },
        editItem: function(item, type) {
            if (type == "domainInfo") {
                console.log(item);
                this.editedIndex = this.filterData.indexOf(item);
                this.dialog.edit = true;
                this.domainInfo = Object.assign({}, item);
            } else if (type == 0) {
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
            console.log(this.domainInfo, "edit");
            this.closeEditDialog();
        },
        updateCDN: function(type) {
            console.log(type);
            console.log(this.cdn, type);
            this.closeEditDialog();
        },
        closeEditDialog: function() {
            this.dialog.edit = false;
            this.dialog.editCDN = false;
            this.dialog.changeDefault = false;
            this.dialog.delete = false;
            this.cdn = {};
        }
        // getAllDomains: function() {
        //     this.$store.dispatch("global/startLoading");
        //     this.$store
        //         .dispatch("domains/getAllDomains")
        //         .then(
        //             function(result) {
        //                 this.filterData = result.data.domains;
        //                 this.dnsPodDomain = result.data.dnsPodDomain;
        //                 this.mapping();
        //                 this.$store.dispatch("global/finishLoading");
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
        // },
        // mapping() {
        //     this.filterData.forEach((o, i) => {
        //         if (o.name == this.select) {
        //             this.domain = o;
        //         }
        //     });
        // }
    },
    watch: {
        // select: function() {
        //     this.mapping();
        // }
    },
    mounted() {
        this.getDomainInfo();
        // this.getAllDomains();
        // this.mapping();
        console.log(this.domain_id);
    }
};
</script>
<style lang="sass">

</style>
