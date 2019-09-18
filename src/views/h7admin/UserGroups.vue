<template lang="pug">
    v-container#user-list(grid-list-lg)
        v-layout(wrap)
            v-flex(xs12)
                .title Groups
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading Group List
                        v-spacer
                        v-btn.my-0(color="primary" @click="addGroup()") Add Group
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)

                    h7-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" single-line disable-initial-sort="true" :per-page="10")
                        template(slot="items" slot-scope="{props, index}")
                            tr(:class="props.item.status? '': 'grey--text'")
                                td {{index}}
                                td {{props.item.name}}
                                td {{props.item.unique_id}}
                                td {{props.item.updated_at}}
                                td
                                    v-btn.ma-0(flat icon small color="primary" @click="goToGroupInfo(props.item)" title="edit" :disabled="!props.item.status")
                                        v-icon(small) edit
                                    v-menu(offset-y left) 
                                        template(v-slot:activator="{on}")
                                            v-btn.ma-0(flat icon small color="primary" v-on="on")
                                                v-icon( small) more_vert
                                        v-list
                                            v-list-tile(@click="updateGroupStatus(props.item, !props.item.status)")
                                                v-list-tile-title(v-if="props.item.status") inactive group
                                                v-list-tile-title(v-else) active group
            //- edit group dialog
            v-dialog(v-model="dialog.add" max-width="460" persistent)
                v-card
                    v-card-title.title Add Group
                    v-card-text
                        v-form(ref="editForm")
                            v-text-field(v-model="editedGroup.name" label="Name" name="name" :rules="[rules.required]")
                            v-text-field(v-model="editedGroup.unique_id" label="Client ID" name="client id" :rules="[rules.required]")
                    v-card-actions
                        v-spacer
                        v-btn(color="grey" flat @click="closeDialog()") CANCEL
                        v-btn(color="primary" flat @click="updateGroup()") SAVE
</template>

<script>
import textFieldRules from "../../utils/textFieldRules";

export default {
    mixins: [textFieldRules],

    data() {
        return {
            filterData: [],
            rawData: [],
            searchText: "",
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
                    text: "Client ID",
                    align: "left",
                    value: "unique_id",
                    sortable: true
                },
                {
                    text: "Updated Time",
                    align: "left",
                    value: "updated_at",
                    sortable: true
                },
                {
                    text: "Actions",
                    align: "left",
                    value: "action",
                    sortable: false,
                    width: "150px"
                }
            ],
            editedGroup: {},
            dialog: {
                add: false
            }
        };
    },
    methods: {
        getUserGroups: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("userGroup/getAll")
                .then(
                    function(result) {
                        this.filterData = result.data;
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
        addGroup() {
            this.dialog.add = true;
        },
        updateGroup() {
            if (this.$refs.editForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("userGroup/newUserGroup", this.editedGroup)
                    .then(
                        function(result) {
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Update user success!"
                            );
                            this.getUserGroups();
                            this.$store.dispatch("global/finishLoading");
                            this.closeDialog();
                        }.bind(this)
                    )
                    .catch(
                        function(error) {
                            this.$store.dispatch(
                                "global/showSnackbarError",
                                error.message
                            );
                            this.$store.dispatch("global/finishLoading");
                            this.closeDialog();
                        }.bind(this)
                    );
            }
        },
        updateGroupStatus: function(item, status) {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("userGroup/updateGroupStatus", {
                    id: item.id,
                    status: status
                })
                .then(
                    function(result) {
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change group status success!"
                        );
                        this.getUserGroups();
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
        closeDialog() {
            this.dialog.add = false;
            this.$refs.editForm.reset();
        },
        goToGroupInfo(data) {
            this.$router.push({
                name: "userGroupInfo",
                params: {
                    group_id: data.id,
                    info: data
                }
            });
        }
    },
    created() {
        this.getUserGroups();
    }
};
</script>

<style lang="scss" scoped>
</style>