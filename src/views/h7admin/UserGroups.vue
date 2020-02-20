<template lang="pug">
    v-container#user-list.grid-list-lg
        v-layout(wrap)
            v-flex(xs12)
                .title User Groups
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading User Group List
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
            v-dialog(v-model="dialog.add" max-width="660" persistent)
                v-card
                    v-card-title.title Add Group
                    v-card-text
                        v-form(ref="editForm")
                            v-text-field(v-model="editedGroup.name" label="Name" name="name" :rules="[rules.required]")
                            v-text-field(v-model="editedGroup.unique_id" label="Client ID" name="client id" :rules="[rules.required]")
                            v-text-field(v-model="editedGroup.pin" label="Pin" name="pin" :rules="[rules.required]")
                            v-text-field(v-model="editedRoleSetting.name" label="Role Name" type="text" name="name" :rules="[rules.required]")
                            v-flex Permission Setting
                            v-layout(row v-for="item in permissionSetting" style="display: space-between;align-items: center;justify-content: space-between" )
                                span.px-2 {{item.permission.name}}
                                .checkbox
                                    v-layout(row)
                                        v-checkbox(label="Read" v-model="item.actions.read" @change="readOnlyStatusChange(item.permission.name,item.actions.read)")
                                        v-checkbox(label="Create / Update" v-model="item.actions.create" @change="createUpdateStatusChange(item.permission.name,item.actions.create)") 
                                        v-checkbox(label="Delete" v-model="item.actions.delete" @change="deleteStatusChange(item.permission.name,item.actions.delete)") 
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
            },
            permissionSetting: [],
            editedRoleSetting: {},
            newRolePermission: {}
        };
    },
    methods: {
        readOnlyStatusChange(permissionName, readStatus) {
            // console.log(permissionName, readStatus);
            if (readStatus == false) {
                this.permissionSetting.forEach((o, i) => {
                    if (o.permission.name == permissionName) {
                        o.actions.create = 0;
                        o.actions.update = 0;
                        o.actions.delete = 0;
                        o.actions.read = 0;
                    }
                });
            }
            // console.log(this.permissionSetting);
        },
        createUpdateStatusChange(permissionName, createUpdateStatus) {
            // console.log(permissionName, fullAccessStatus);
            if (createUpdateStatus == true) {
                this.permissionSetting.forEach((o, i) => {
                    if (o.permission.name == permissionName) {
                        o.actions.read = 1;
                        o.actions.update = 1;
                        o.actions.create = 1;
                    }
                });
            } else {
                this.permissionSetting.forEach((o, i) => {
                    if (o.permission.name == permissionName) {
                        o.actions.read = 0;
                        o.actions.update = 0;
                        o.actions.create = 0;
                        o.actions.delete = 0;
                    }
                });
            }
            // console.log(this.permissionSetting);
        },
        deleteStatusChange(permissionName, deleteStatus) {
            if (deleteStatus == true) {
                this.permissionSetting.forEach((o, i) => {
                    if (o.permission.name == permissionName) {
                        o.actions.read = 1;
                        o.actions.update = 1;
                        o.actions.create = 1;
                        o.actions.delete = 1;
                    }
                });
            } else {
                this.permissionSetting.forEach((o, i) => {
                    if (o.permission.name == permissionName) {
                        o.actions.read = 0;
                        o.actions.update = 0;
                        o.actions.create = 0;
                        o.actions.delete = 0;
                    }
                });
            }
        },
        getAllPermission() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("permission/getAllPermission", this.permission_id)
                .then(
                    function(result) {
                        // console.log(result.data);
                        result.data.pop();
                        result.data.forEach((o, i) => {
                            var permission = {};
                            permission["permission"] = {
                                name: o.name,
                                id: o.id
                            };
                            permission.permission_id = o.id;
                            permission["actions"] = {
                                read: 0,
                                create: 0,
                                update: 0,
                                delete: 0
                            };
                            this.permissionSetting.push(permission);
                        });
                        // console.log(this.permissionSetting, "all");
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
        newRole() {
            // console.log(this.editedRoleSetting);
            // console.log(this.permissionSetting);
            // this.editedRoleSetting.user_group_id = this.userGroupId;
            var permissions = [];
            this.permissionSetting.forEach((o, i) => {
                var permissionObject = {
                    permission_id: o.permission_id,
                    actions: o.actions
                };
                permissions.push(permissionObject);
            });
            // console.log(permissions, "permission");
            this.newRolePermission.permissions = permissions;

            this.$store
                .dispatch("roles/newRole", this.editedRoleSetting)
                .then(
                    function(result) {
                        var newRoleId = result.data.id;
                        this.newRolePermission.roleId = newRoleId;
                        this.updateRolePermission(this.newRolePermission);
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
            // console.log(this.permissionSetting);
        },
        updateRolePermission(permission) {
            // console.log(permission, "permission");
            permission.permission_id = this.permission_id;
            this.$store
                .dispatch("permission/updateRolePermission", permission)
                .then(
                    function(result) {
                        // console.log(result.data);
                        this.$store.dispatch("global/finishLoading");
                        this.closeDialog();
                        this.getUserGroups();
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
            // console.log(this.editedGroup, "group");
            // this.newRole();

            if (this.$refs.editForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("userGroup/newUserGroup", this.editedGroup)
                    .then(
                        function(result) {
                            this.editedRoleSetting.user_group_id =
                                result.data.id;
                            this.newRole();
                            this.updateGroupPin(result.data.id);
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Update user success!"
                            );
                            // this.getUserGroups();
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
        updateGroupPin(ugid) {
            // console.log(this.editedGroup);
            this.editedGroup.user_group_id = ugid;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("userGroup/updateUserGroupPin", this.editedGroup)
                .then(function(result) {}.bind(this))
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
        },
        checkPagePermission() {
            this.permission = JSON.parse(localStorage.getItem("permission"));

            this.permission.forEach((o, i) => {
                if (o.permission.name == this.$route.meta.sideBar) {
                    this.permission_id = o.permission.id;
                }
            });
        }
    },
    created() {
        this.checkPagePermission();
        this.getUserGroups();
        this.getAllPermission();
    }
};
</script>

<style lang="scss" scoped>
</style>