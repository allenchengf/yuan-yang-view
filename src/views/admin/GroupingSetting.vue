<template lang="pug">
    v-container#grouping
        v-layout(wrap column)
            v-flex(xs12)
                .title.text-xs-left.mb-4 Grouping
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading Grouping
                        v-spacer
                        v-btn.my-0(color="primary" @click="addItem") Add Group
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    h7-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line)
                        template(slot="items" slot-scope="{props, index}")
                            td {{ index }}
                            td {{ props.item.name }}
                            td {{ props.item.domains.length }}
                            td {{ props.item.default_cdn_name }}
                            td {{props.item.label}}
                            td
                                v-btn.ma-0(flat icon small color="primary" @click="goToNextPage(props.item)")
                                    v-icon(small) edit
                                v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item, 'delete')")
                                    v-icon(small) delete
        v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
                v-card
                    v-card-title.title New Group
                    v-card-text
                        v-form(ref="editForm")
                            v-text-field(v-model="group.name" label="Group Name" type="text" name="name" :rules="[rules.required]")
                            v-select(:items="domainsData" label="Inherited settings by domain" item-text="name" item-value="id" @change="chooseDomain(group.domain_id)" v-model="group.domain_id" )
                            v-text-field(v-model="group.label" label="Label" type="text" name="label")

                    v-card-actions  
                        v-spacer
                        v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                        v-btn(color="primary" flat="flat" @click="updateGroup('newGroup')") Save
        v-dialog.delete-dialog(v-model="dialog.delete" max-width="460" persistent)
                v-card
                    v-card-title.title Delete Group
                    v-card-text Are you sure want to delete this group "{{group.name}}" ?
                    v-card-actions  
                        v-spacer
                        v-btn(color="error" flat="flat" @click="updateGroup('deleteGroup')") Delete
                        v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
</template>
<script>
import textFieldRules from "../../utils/textFieldRules.js";

export default {
    mixins: [textFieldRules],

    data() {
        return {
            searchText: "",
            filterData: [
                {
                    id: 1,
                    user_group_id: 1,
                    name: "Group1",
                    label: "This is Group1",
                    edited_by: null,
                    default_cdn_name: "Hiero7",
                    domains: [
                        {
                            id: 1,
                            user_group_id: 1,
                            name: "hiero7.test1.com",
                            cname: "hiero7.test1.com",
                            label: null,
                            edited_by: null,
                            created_at: null,
                            updated_at: null,
                            domain_group_mapping: {
                                domain_group_id: 1,
                                domain_id: 1
                            }
                        }
                    ]
                },
                {
                    id: 2,
                    user_group_id: 1,
                    name: "Group2",
                    label: "This is Group2",
                    edited_by: null,
                    domains: []
                },
                {
                    id: 3,
                    user_group_id: 0,
                    name: "Group3",
                    label: null,
                    edited_by: null,
                    domains: []
                },
                {
                    id: 4,
                    user_group_id: 2,
                    name: "Group4",
                    label: "LabelForGroup4",
                    edited_by: "e41c63b9-7c95-469a-9271-22b75a9b3239",
                    domains: [
                        {
                            id: 3,
                            user_group_id: 2,
                            name: "rd.test1.com",
                            cname: "rd.test1.com",
                            label: null,
                            edited_by: null,
                            created_at: null,
                            updated_at: null,
                            domain_group_mapping: {
                                domain_group_id: 4,
                                domain_id: 3
                            }
                        }
                    ]
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
                    text: "Number of Domains",
                    align: "left",
                    sortable: false,
                    value: "number"
                },
                {
                    text: "Default CDN",
                    align: "left",
                    sortable: false,
                    value: "default_cdn_name"
                },
                {
                    text: "label",
                    align: "left",
                    sortable: false,
                    value: "label"
                },
                {
                    text: "Actions",
                    align: "left",
                    value: "action",
                    sortable: false,
                    width: "150px"
                }
            ],
            dialog: {
                edit: false,
                delete: false
            },
            group: {
                domain_id: ""
            },
            editedIndex: -1,
            domainsData: [],
            user_group_id: ""
        };
    },
    methods: {
        chooseDomain(value) {
            console.log(value);
        },
        getGroupData() {
            this.filterData = this.filterData;
        },
        addItem: function() {
            this.$refs.editForm.reset();
            this.editedIndex = -1;
            this.dialog.edit = true;
            this.type = "NewGroup";
        },
        editItem: function(item, type) {
            // this.type = type;
            if (type == "delete") {
                console.log(item);
                this.dialog.delete = true;
                this.group = Object.assign({}, item);
            }
            console.log(this.group);
        },
        updateGroup(type) {
            if (this.editedIndex == -1) {
                this.addNewGroup();
            } else {
                //delete
                this.deleteGroup();
            }
            console.log(this.group, type);
        },
        addNewGroup() {
            if (this.$refs.editForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("grouping/newGroup", this.group)
                    .then(
                        function(result) {
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Add group success!"
                            );
                            this.getGroupData();
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
        deleteGroup() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("grouping/deleteGroup", this.group.id)
                .then(
                    function(result) {
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Delete group success!"
                        );
                        this.getGroupData();
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
        },
        closeEditDialog: function() {
            this.dialog.delete = false;
            this.dialog.edit = false;
        },
        getAllDomains: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getAllDomains", this.user_group_id)
                .then(
                    function(result) {
                        this.domainsData = result.data.domains;
                        console.log(this.domainsData);
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
        goToNextPage(data) {
            this.$router.push({
                name: "groupInfo",
                params: {
                    group_id: data.id
                    // info: data
                }
            });
        }
    },
    mounted() {
        this.user_group_id = this.$store.getters["account/accountGroupId"]();
        this.getGroupData();
        this.getAllDomains();
    }
};
</script>