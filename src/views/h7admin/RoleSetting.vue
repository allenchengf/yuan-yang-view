<template lang="pug">
    v-container#roles.grid-list-lg
        v-layout(wrap column)
            v-flex(xs12)
                .title Roles
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading Roles
                        v-spacer
                        v-btn.my-0(color="primary" @click="addItem") Add Role
                    v-divider                    
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    h7-data-table(:headers="headers" :items="items" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" )
                        template(slot="items" slot-scope="{props, index}")
                            tr
                                td.text-xs-left {{ index}}
                                td.text-xs-left {{ props.item.name }}
                                td.text-xs-left
                                    v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item)" title="edit")
                                        v-icon(small) edit
                                    v-btn.ma-0(flat icon small color="primary" @click="deleteItem(props.item)" title="delete")
                                        v-icon(small) delete

        //- Dialogs
        v-dialog.edit-dialog(v-model="dialog.add" max-width="460" persistent)
            v-card
                v-card-title.title Add Role
                v-card-text 
                    v-form(ref="addForm")
                        v-text-field(v-model="editedRoleSetting.name" label="Name" type="text" name="name" :rules="[rules.required]")
                        v-flex Permission Setting
                        v-layout(row v-for="item in permissionSetting" style="display: space-between;align-items: center;justify-content: space-between" )
                            span.px-2 {{item.permission.name}}
                            .checkbox
                                v-layout(row)
                                    v-checkbox(label="Read Only" v-model="item.actions.read" @change="readOnlyStatusChange(item.permission.name,item.actions.read)")
                                    v-checkbox(label="Full Access" v-model="item.actions.create" @change="fullAccessStatusChange(item.permission.name,item.actions.create)") 
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="dialog.add = false") Cancel
                    v-btn(color="primary" flat="flat" @click="newRole") Save
        v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
            v-card
                v-card-title.title Edit Role: {{ editedRoleSetting.name }}
                v-card-text 
                    v-text-field(v-model="editedRoleSetting.name" label="Name" type="text" name="name" :rules="[rules.required]")
                    v-flex Permission Setting
                    v-layout(row v-for="item in permissionSetting" style="display: space-between;align-items: center;justify-content: space-between" )
                        span.px-2 {{item.permission.name}}
                        .checkbox
                            v-layout(row)
                                v-checkbox(label="Read" v-model="item.actions.read" @change="readOnlyStatusChange(item.permission.name,item.actions.read)")
                                v-checkbox(label="Full Access" v-model="item.actions.create" @change="fullAccessStatusChange(item.permission.name,item.actions.create)") 
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="dialog.edit = false") Cancel
                    v-btn(color="primary" flat="flat" @click="updatePermission") Save

        v-dialog.delete-dialog(v-model="dialog.delete" max-width="460")
            v-card
                v-card-title.title Delete Role
                v-card-text.text-xs-left Are you sure you want to delete this role : {{editedRolePermission.name}} ?
                v-card-actions  
                    v-spacer
                    v-btn(color="red" flat="flat" @click="deleteRole") Delete
                    v-btn(color="grey" flat="flat" @click="dialog.delete=false") Cancel
</template>


<script>
import textFieldRules from "../../utils/textFieldRules.js";

export default {
    mixins: [textFieldRules],
    data() {
        return {
            roleList: [
                {
                    id: 3,
                    user_group_id: 3,
                    name: "Admin",
                    edited_by: null,
                    created_at: "2019-11-28 11:49:19",
                    updated_at: "2019-11-28 11:49:19"
                },
                {
                    id: 6,
                    user_group_id: 3,
                    name: "Operator",
                    edited_by: null,
                    created_at: "2019-11-28 11:49:19",
                    updated_at: "2019-11-28 11:49:19"
                }
            ],
            userGroupId: "",
            perPage: 25,
            lineInfo: {},
            tabs: [],
            currentTab: null,
            loading: false,
            searchText: "",
            headers: [
                {
                    key: "id",
                    text: "#",
                    align: "left",
                    sortable: true,
                    width: "40px",
                    auth: 0,
                    control: true,
                    searchable: false,
                    value: "id"
                },
                {
                    key: "name",
                    text: "Name",
                    align: "left",
                    sortable: true,
                    control: true,
                    searchable: true,
                    value: "name"
                },
                {
                    key: "action",
                    text: "Action",
                    align: "left",
                    value: "",
                    width: "120px",
                    control: false,
                    searchable: false,
                    sortable: true
                }
            ],
            items: [],
            editedRoleSetting: {},
            editedNetwork: {},
            editedLoaction: {},
            editedIndex: -1,
            continents: [],
            countries: [],
            dialog: {
                alert: false,
                add: false,
                edit: false,
                delete: false
            },
            permissionSetting: [],
            newRolePermission: {},
            editedRolePermission: {}
        };
    },
    watch: {},
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
        fullAccessStatusChange(permissionName, fullAccessStatus) {
            // console.log(permissionName, fullAccessStatus);
            if (fullAccessStatus == true) {
                this.permissionSetting.forEach((o, i) => {
                    if (o.permission.name == permissionName) {
                        o.actions.read = 1;
                        o.actions.update = 1;
                        o.actions.delete = 1;
                    }
                });
            } else {
                this.permissionSetting.forEach((o, i) => {
                    if (o.permission.name == permissionName) {
                        o.actions.read = 0;
                        o.actions.update = 0;
                        o.actions.delete = 0;
                    }
                });
            }
            // console.log(this.permissionSetting);
        },
        getAllPermission() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("permission/getAllPermission")
                .then(
                    function(result) {
                        // console.log(result.data);
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
        getRolesByGroupId() {
            // console.log(this.roleList);
            // this.items = this.roleList;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("roles/getRolesByGroupId", this.userGroupId)
                .then(
                    function(result) {
                        this.roleList = result.data;
                        this.items = this.roleList;
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
        getRolePermissionByRoleId() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch(
                    "permission/getRolePermissionByRoleId",
                    this.editedRolePermission.roleId
                )
                .then(
                    function(result) {
                        // console.log(result.data);
                        this.permissionSetting = result.data;
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
        addItem() {
            this.dialog.add = true;
            this.$refs.addForm.reset();
            this.editedRoleSetting = {};
            this.permissionSetting.forEach((o, i) => {
                o.actions.read = 0;
                o.actions.update = 0;
                o.actions.create = 0;
                o.actions.delete = 0;
            });
        },
        newRole() {
            // console.log(this.editedRoleSetting);
            this.editedRoleSetting.user_group_id = this.userGroupId;
            var permissions = [];
            this.permissionSetting.forEach((o, i) => {
                var permissionObject = {
                    permission_id: o.permission_id,
                    actions: o.actions
                };
                permissions.push(permissionObject);
            });
            // console.log(permissions);
            this.newRolePermission.permissions = permissions;
            // console.log(this.newRolePermission);
            this.$store
                .dispatch("roles/newRole", this.editedRoleSetting)
                .then(
                    function(result) {
                        var newRoleId = result.data.id;
                        this.newRolePermission.roleId = newRoleId;
                        this.updateRolePermission(this.newRolePermission);
                        this.getRolesByGroupId();
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
            this.$store
                .dispatch("permission/updateRolePermission", permission)
                .then(
                    function(result) {
                        // console.log(result.data);
                        this.dialog.edit = false;
                        this.dialog.add = false;
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
        editItem: function(item) {
            var editedRoleSetting = {};
            this.editedRoleSetting.name = item.name;
            this.dialog.edit = true;
            this.editedRolePermission.roleId = item.id;
            // console.log(this.editedRolePermission);
            this.getRolePermissionByRoleId();
        },
        updateRole() {
            this.editedRoleSetting["id"] = this.editedRolePermission.roleId;
            // console.log(this.editedRoleSetting);

            this.$store
                .dispatch("roles/updateRole", this.editedRoleSetting)
                .then(
                    function(result) {
                        this.getRolesByGroupId();
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
        updatePermission() {
            this.updateRole();
            // console.log(this.permissionSetting);
            var permissions = [];
            this.permissionSetting.forEach((o, i) => {
                var permissionObject = {
                    permission_id: o.permission_id,
                    actions: o.actions
                };
                permissions.push(permissionObject);
            });
            // console.log(permissions);
            this.editedRolePermission.permissions = permissions;
            // console.log(this.editedRolePermission);
            this.updateRolePermission(this.editedRolePermission);
        },
        deleteItem: function(item) {
            this.editedRolePermission = Object.assign({}, item);
            // console.log(item);
            this.editedIndex = item.user_group_id;
            this.dialog.delete = true;
        },
        deleteRole: function() {
            this.$store
                .dispatch("roles/deleteRole", this.editedRolePermission.id)
                .then(
                    function(result) {
                        this.getRolesByGroupId();
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
            this.dialog.delete = false;
        }
    },
    created() {
        this.userGroupId = this.$store.getters["account/accountGroupId"]();
        this.getRolesByGroupId();
        this.getAllPermission();
    }
};
</script>

<style lang="scss" scoped>
td {
    text-transform: capitujcvy 12345ialize;
}
* {
    // border: 1px solid black;
}
</style>
