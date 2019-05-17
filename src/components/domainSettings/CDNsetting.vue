<template lang="pug">
    v-container#cdnSetting
        v-card
            v-card-title
                v-layout(row align-center)
                    v-flex.px-2(xs12 sm6 md3)
                        v-text-field.pt-0.mt-0(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    v-spacer
                    v-btn(color="primary" dark @click="addItem") Add CDN
                    h4 {{tab.domain_id}}

            v-data-table.elevation-1(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :pagination.sync="pagination"  hide-actions :search="searchText")
                v-progress-linear(v-slot:progress color="primary")
                template(slot="items" slot-scope="props")
                    tr
                        td.text-xs-left {{props.index +1}}
                        td.text-xs-left() 
                            .name.font-weight-medium {{props.item.name}}
                        td.text-xs-left {{props.item.cname}}
                        td.text-xs-left {{props.item.ttl}}
                        td.text-xs-left
                            v-icon(large color="green darken-2" v-if="props.item.default == true") check
                        td.text-xs-left
                            v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item, 0)" title="edit cdn")
                                v-icon(small) edit
                            v-menu(offset-y left) 
                                template(v-slot:activator="{on}")
                                    v-btn.ma-0(flat icon small color="primary" v-on="on" )
                                        v-icon( small) more_vert
                                v-list.pa-0
                                    v-list-tile()
                                        v-list-tile-title Change to default
                                        
            v-layout.px-2(row align-center)
                v-flex.text-xs-left.py-3(xs4)
                v-flex.text-xs-right.py-3(xs8)
                    v-pagination(v-model="pagination.page" :length="pages" :total-visible="7" color="primary")
        //- Dialogs
        v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
            v-card
                v-card-title.title {{formTitle}}
                v-card-text
                    v-form(ref="editForm")
                        v-text-field(v-model="cdn.name" label="CDN Name" type="text" name="name" :rules="[rules.required]")
                        v-text-field(v-model="cdn.cname" label="CDN CName" type="text" name="cname")
                        v-text-field(v-model="cdn.ttl" label="TTL" type="number" name="ttl" :rules="[rules.ttl]")
                        v-alert.text-md-left(:value="error.status" color="error" icon="warning" outline transition="scale-transition") {{error.message}}
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                    v-btn(color="primary" flat="flat" @click="updateCDN") Save
</template>

<script>
import textFieldRules from "../../utils/textFieldRules.js";

export default {
    mixins: [textFieldRules],
    props: ["tab", "domain_id"],
    data() {
        return {
            pagination: {
                rowsPerPage: 20
            },
            rowsPerPageItems: [
                { name: "20 per page", value: 20 },
                { name: "50 per pages", value: 50 }
            ],
            perPage: 20,
            pages: 0,
            dialog: {
                edit: false
            },
            error: {
                status: false,
                message: ""
            },
            domain: {},
            editedIndex: -1,
            operatorAuth: 0,
            searchText: "",
            filterData: [],
            headers: [
                {
                    text: "#",
                    align: "left",
                    sortable: false,
                    width: "80px",
                    value: "id"
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
                    text: "TTL",
                    align: "left",
                    sortable: true,
                    value: "ttl"
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
                    width: "200px"
                }
            ],
            cdn: {}
        };
    },
    methods: {
        getAllCDNs: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getAllCDNs", this.tab.domain_id)
                .then(
                    function(result) {
                        this.filterData = result.data;
                        this.cdn.domain_id = this.tab.domain_id;
                        this.setPages();
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
        editItem: function(item, type) {
            this.editedIndex = this.filterData.indexOf(item);
            this.cdn = Object.assign({}, item);
            if (type == 0) {
                this.dialog.edit = true;
            }
        },
        updateCDN: function() {
            this.cdn.domain_id = this.tab.domain_id;
            if (this.$refs.editForm.validate()) {
                this.$store.dispatch("global/startLoading");
                if (this.editedIndex == -1) {
                    this.addNewCDN();
                } else {
                    if (this.cdn.default == false) {
                        this.cdn.default = 0;
                    } else {
                        this.cdn.default = 1;
                    }
                    this.$store.dispatch("global/startLoading");
                    this.$store
                        .dispatch("domains/updateCDN", this.cdn)
                        .then(
                            function(result) {
                                this.$store.dispatch("global/finishLoading");
                                this.getAllCDNs();
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
                }
            }
        },
        addItem: function() {
            this.$refs.editForm.reset();
            this.editedIndex = -1;
            this.dialog.edit = true;
        },
        addNewCDN: function() {
            this.cdn.domain_id = this.tab.domain_id;
            var vm = this;
            if (this.$refs.editForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("domains/newCDN", this.cdn)
                    .then(
                        function(result) {
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Update user success!"
                            );
                            this.getAllCDNs();
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
        closeEditDialog: function() {
            this.dialog.edit = false;
        },
        setPages: function() {
            if (this.perPage == null || this.filterData == null) {
                this.pages = null;
            } else {
                this.pages = Math.ceil(this.filterData.length / this.perPage);
            }
        }
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "New CDN" : "Edit CDN";
        }
    },
    watch: {
        perPage: function(value) {
            this.pagination.rowsPerPage = value;
            this.setPages();
        },
        domain_id: function() {
            this.getAllCDNs();
        }
    },
    mounted() {
        this.getAllCDNs();
        // console.log(this.editedIndex);
    }
};
</script>
