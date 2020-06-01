<template lang="pug">
    v-container#grouping.grid-list-lg
        v-layout(wrap column)
            v-flex(xs12)
                .title Grouping
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
                                    v-combobox(:items="domainsData" label="Inherited settings by domain" item-text="name" item-value="id" @change="chooseDomain(group.domain.id)" v-model="group.domain" hide-selected :rules="[rules.required]")
                                        template(v-slot:no-data)
                                            v-card-text No results matching 
                                    v-text-field(v-model="group.label" label="Note" type="text" name="label")

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
import textFieldRules from '../../utils/textFieldRules.js'

export default {
    mixins: [textFieldRules],

    data() {
        return {
            searchText: '',
            filterData: [],
            headers: [
                {
                    text: '#',
                    align: 'left',
                    sortable: false,
                    width: '80px',
                    value: 'index'
                },
                {
                    text: 'Name',
                    align: 'left',
                    sortable: true,
                    value: 'name'
                },
                {
                    text: 'Number of Domains',
                    align: 'left',
                    sortable: false,
                    value: 'number'
                },
                {
                    text: 'Default CDN',
                    align: 'left',
                    sortable: false,
                    value: 'default_cdn_name'
                },
                {
                    text: 'Note',
                    align: 'left',
                    sortable: false,
                    value: 'label'
                },
                {
                    text: 'Actions',
                    align: 'left',
                    value: 'action',
                    sortable: false,
                    width: '150px'
                }
            ],
            dialog: {
                edit: false,
                delete: false
            },
            group: {
                domain_id: ''
            },
            editedIndex: -1,
            domainsData: [],
            user_group_id: '',
            permission: [],
            permission_id: 0
        }
    },
    methods: {
        chooseDomain(value) {
            this.group.domain_id = value
            delete this.group.domain
        },
        getGroupData() {
            // this.filterData = this.filterData;
            this.$store.dispatch('global/startLoading')
            this.$store
                .dispatch('grouping/getAllGroups', this.permission_id)
                .then(
                    function(result) {
                        this.filterData = result.data
                        // console.log(this.filterData, "allGroupData");
                        this.$store.dispatch('global/finishLoading')
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch(
                            'global/showSnackbarError',
                            error.message
                        )
                        this.$store.dispatch('global/finishLoading')
                    }.bind(this)
                )
        },
        addItem: function() {
            this.$refs.editForm.reset()
            this.editedIndex = -1
            this.dialog.edit = true
            this.type = 'NewGroup'
        },
        editItem: function(item, type) {
            // this.type = type;
            if (type == 'delete') {
                // console.log(item);
                this.dialog.delete = true
                this.group = Object.assign({}, item)
            }
            // console.log(this.group);
        },
        updateGroup(type) {
            if (type == 'newGroup') {
                this.addNewGroup()
            } else if (type == 'deleteGroup') {
                //delete
                this.deleteGroup()
            }
            // console.log(this.group, type);
        },
        addNewGroup() {
            this.group.permission_id = this.permission_id

            if (!this.group.domain_id) {
                this.$store.dispatch(
                    'global/showSnackbarError',
                    'Please select correct Domain'
                )
                return
            }

            if (this.$refs.editForm.validate()) {
                this.$store.dispatch('global/startLoading')
                this.$store
                    .dispatch('grouping/newGroup', this.group)
                    .then(
                        function(result) {
                            this.$store.dispatch(
                                'global/showSnackbarSuccess',
                                'Add group success!'
                            )
                            this.getAllDomains()
                            this.getGroupData()
                            this.closeEditDialog()
                            this.$store.dispatch('global/finishLoading')
                        }.bind(this)
                    )
                    .catch(
                        function(error) {
                            this.$store.dispatch(
                                'global/showSnackbarError',
                                error.message
                            )
                            this.$store.dispatch('global/finishLoading')
                        }.bind(this)
                    )
            }
        },
        deleteGroup() {
            this.group.permission_id = this.permission_id
            this.$store.dispatch('global/startLoading')
            this.$store
                .dispatch('grouping/deleteGroup', this.group)
                .then(
                    function(result) {
                        this.$store.dispatch(
                            'global/showSnackbarSuccess',
                            'Delete group success!'
                        )
                        this.getAllDomains()

                        this.getGroupData()
                        this.closeEditDialog()
                        this.$store.dispatch('global/finishLoading')
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch(
                            'global/showSnackbarError',
                            error.message
                        )
                        this.$store.dispatch('global/finishLoading')
                    }.bind(this)
                )
        },
        closeEditDialog: function() {
            this.dialog.delete = false
            this.dialog.edit = false
        },
        getAllDomains: function() {
            var domain = {
                id: this.user_group_id,
                permission_id: this.permission_id
            }
            this.$store.dispatch('global/startLoading')
            this.$store
                // .dispatch("domains/getAllDomains", domain)
                .dispatch('domains/getAllDomainsBySql', domain)
                .then(
                    function(result) {
                        // 調整至原本 API 格式 justin 2020-03-09
                        for (var i = 0; i < result.data.domains.length; i++) {
                            var cdn_provider_id =
                                result.data.domains[i].cdn_provider_id === null
                                    ? null
                                    : result.data.domains[
                                          i
                                      ].cdn_provider_id.split(',')
                            var cdn_cname =
                                result.data.domains[i].cdn_cname === null
                                    ? null
                                    : result.data.domains[i].cdn_cname.split(
                                          ','
                                      )
                            var cdn_default =
                                result.data.domains[i].cdn_default === null
                                    ? null
                                    : result.data.domains[i].cdn_default.split(
                                          ','
                                      )

                            result.data.domains[i].domain_group = [
                                { name: result.data.domains[i].group_name }
                            ]
                            result.data.domains[i].cdns = []
                            if (cdn_provider_id !== null) {
                                for (
                                    var j = 0;
                                    j < cdn_provider_id.length;
                                    j++
                                ) {
                                    result.data.domains[i].cdns.push({
                                        cdn_provider_id: parseInt(
                                            cdn_provider_id[j]
                                        ),
                                        cname: cdn_cname[j],
                                        default:
                                            cdn_default[j] === '1'
                                                ? true
                                                : false
                                    })
                                }
                            }
                        }

                        this.domainsData = result.data.domains.filter(i => {
                            return i.group_id === null
                        })
                        this.$store.dispatch('global/finishLoading')
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch('global/finishLoading')
                        this.$store.dispatch(
                            'global/showSnackbarError',
                            error.message
                        )
                    }.bind(this)
                )
        },
        goToNextPage(data) {
            this.$router.push({
                name: 'groupInfo',
                params: {
                    groupId: data.id
                    // info: data
                }
            })
        },
        checkPagePermission() {
            this.permission = JSON.parse(localStorage.getItem('permission'))

            this.permission.forEach((o, i) => {
                if (o.permission.name == this.$route.meta.sideBar) {
                    this.permission_id = o.permission.id
                }
            })
            // console.log(this.permission_id);
        }
    },
    mounted() {
        this.user_group_id = this.$store.getters['account/accountGroupId']()
        this.getGroupData()
        this.getAllDomains()
    },
    created() {
        this.checkPagePermission()
    }
}
</script>