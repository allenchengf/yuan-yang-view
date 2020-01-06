<template lang="pug">
    v-container#logs.grid-list-lg
        v-layout(wrap column)
            v-flex(xs12)
                .title Operation Logs
            v-flex(xs12)
                v-card
                    v-card-title
                        v-btn-toggle(v-model="category" v-for="item in categoryList")
                            v-btn(flat :value='item') {{item}}
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    h7-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line must-sort) 
                        template(slot="items" slot-scope="{props, index}")
                            td.text-xs-left {{props.item.time}}
                            td.text-xs-left {{props.item.ip}}
                            td.text-xs-left {{props.item.name}}
                            td.text-xs-left {{props.item.change_type !== null ? props.item.change_type : ""}}
                            td.text-xs-left 
                                v-chip {{props.item.category}}
                            //- td.text-xs-left {{props.item.changed_from}}
                            td.text-xs-left {{props.item.changed_from.name !== undefined ? props.item.changed_from.name : "" }}
                            td.text-xs-left 
                                span(v-if="props.item.change_type !== 'Update'") {{props.item.changed_to.name !== undefined ? props.item.changed_to.name : "" }}
                                span(v-else v-for="item in props.item.changed_to") {{item + " . "}} 
</template>
<script>
export default {
    data() {
        return {
            usersMapping: {},
            users: [],
            searchText: "",
            category: "all",
            categoryList: [],
            filterData: [],
            rawData: [],
            headers: [
                {
                    text: "Time",
                    align: "left",
                    sortable: true,
                    value: "time"
                },
                {
                    text: "IP",
                    align: "left",
                    sortable: true,
                    value: "ip"
                },
                {
                    text: "Operator",
                    align: "left",
                    sortable: true,
                    value: "name"
                },
                {
                    text: "Action",
                    align: "left",
                    sortable: true,
                    value: "change_type"
                },
                {
                    text: "Category",
                    align: "left",
                    sortable: true,
                    value: "category"
                },

                {
                    text: "Change from",
                    align: "left",
                    sortable: true,
                    value: "change_from"
                },
                {
                    text: "Change to",
                    align: "left",
                    sortable: true,
                    value: "change_to"
                }
            ],
            permission: [],
            permission_id: 0
        };
    },
    methods: {
        getLogsData() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("logs/getLogsData", this.permission_id)
                .then(
                    function(result) {
                        this.rawData = result.data.filter(
                            item => item.change_type !== null
                        );
                        // this.rawData = result.data;
                        this.transformMessage();
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
        mappingUsers() {
            this.users.forEach((o, i) => {
                this.usersMapping[o.uid] = o.name + "(" + o.email + ")";
            });
            // console.log(this.usersMapping);
        },
        transformMessage() {
            // console.log(this.rawData, "transformMessage");

            this.rawData.forEach((o, i) => {
                o.name = this.usersMapping[o.uid];
                if (o.change_type !== null) {
                    switch (o.change_type) {
                        case "Create":
                            if (o.changed_to.domain !== undefined) {
                                o.changed_to["name"] = o.changed_to.domain;
                            }

                            break;
                        case "Update":
                            var changedTo = [];
                            changedTo = Object.keys(o.changed_to);
                            changedTo.forEach((obj, idx) => {
                                o.changed_to[obj] =
                                    obj + " : " + o.changed_to[obj];
                            });
                            if (o.changed_from.domain !== undefined) {
                                o.changed_from["name"] = o.changed_from.domain;
                            }
                            break;
                        case "Delete":
                            break;
                        default:
                            break;
                    }
                }
            });
            this.filterData = this.rawData;
        },
        filterDataAction: function() {
            // console.log(this.category, "category");
            if (this.category !== "all")
                this.filterData = this.rawData.filter(data => {
                    return (
                        data.category.toLowerCase() ===
                        this.category.toLowerCase()
                    );
                    // .includes(this.category.toLowerCase());
                });
            else this.filterData = this.rawData;
            // console.log(this.filterData, "filterData");
        },
        getCategoryList: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("logs/getCategoryList", this.permission_id)
                .then(
                    function(result) {
                        this.categoryList = result.data;
                        this.categoryList.unshift("all");
                        // console.log(result.data);
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
        getUsers: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("users/getUsers")
                .then(
                    function(result) {
                        this.users = result.data;
                        // console.log(result.data, "users");
                        this.mappingUsers();
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
    watch: {
        category: function(value) {
            // console.log(value);
            this.category = value;
            this.filterDataAction();
        }
    },
    created() {
        this.checkPagePermission();
        this.getLogsData();
        this.getCategoryList();
        this.getUsers();
    }
};
</script>