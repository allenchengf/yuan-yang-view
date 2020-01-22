<template lang="pug">
    v-container#iroutecdn.grid-list-lg
        v-layout(wrap column)
            v-flex(xs12)
                .title iRouteCDN
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading iRouteCDN
                        v-spacer
                        v-btn.my-0(color="primary" @click="goToAllPage()") All
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    
                    h7-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line)
                        template(slot="items" slot-scope="{props, index}")
                            tr(@click="goToNextPage(props.item)" style="cursor: pointer")
                                td {{index}}
                                td {{props.item.name}}
                                td.text-xs-right
                                    v-icon(small) keyboard_arrow_right
                            
</template>
<script>
export default {
    data() {
        return {
            searchText: "",
            filterData: [],
            rawData: {
                domainGroup: [
                    {
                        id: 2,
                        user_group_id: 1,
                        name: "Group1",
                        label: "Label",
                        edited_by: "111-11-1-11-111"
                    },
                    {
                        id: 3,
                        user_group_id: 2,
                        name: "Group2",
                        label: "Label2",
                        edited_by: "111-11-1-11-111"
                    }
                ],
                domains: [
                    {
                        id: 6,
                        user_group_id: 1,
                        name: "Yuan6.com",
                        cname: "Yuan6com.1",
                        label: null,
                        edited_by: "111-11-1-11-111",
                        domain_group: []
                    },
                    {
                        id: 7,
                        user_group_id: 1,
                        name: "Yuan7.com",
                        cname: "Yuan7com.1",
                        label: null,
                        edited_by: "111-11-1-11-111",
                        domain_group: []
                    },
                    {
                        id: 8,
                        user_group_id: 1,
                        name: "Yuan8.com",
                        cname: "Yuan8com.1",
                        label: null,
                        edited_by: "111-11-1-11-111",
                        domain_group: []
                    },
                    {
                        id: 9,
                        user_group_id: 1,
                        name: "Yuan9.com",
                        cname: "Yuan9com.1",
                        label: null,
                        edited_by: "111-11-1-11-111",
                        domain_group: []
                    },
                    {
                        id: 10,
                        user_group_id: 1,
                        name: "Yuan10.com",
                        cname: "Yuan10com.1",
                        label: null,
                        edited_by: "111-11-1-11-111",
                        domain_group: []
                    },
                    {
                        id: 11,
                        user_group_id: 1,
                        name: "Yuan11.com",
                        cname: "Yuan11com.1",
                        label: null,
                        edited_by: "111-11-1-11-111",
                        domain_group: []
                    },
                    {
                        id: 12,
                        user_group_id: 1,
                        name: "Yuan12.com",
                        cname: "Yuan12com.1",
                        label: null,
                        edited_by: "111-11-1-11-111",
                        domain_group: []
                    }
                ]
            },
            headers: [
                {
                    text: "#",
                    align: "left",
                    sortable: false,
                    width: "80px",
                    value: "index"
                },
                {
                    text: "Group/Domain",
                    align: "left",
                    sortable: true,
                    value: "name"
                },
                {
                    text: "",
                    align: "",
                    value: "",
                    sortable: false
                }
            ],
            permission: [],
            permission_id: 0
        };
    },
    methods: {
        getData() {
            // console.log(this.rawData);

            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("iRouteCdn/getIRouteCdnList", this.permission_id)
                .then(
                    function(result) {
                        this.rawData = result.data;
                        this.rawData.domainGroup.forEach((o, i) => {
                            this.filterData.push(o);
                        });
                        this.rawData.domains.forEach((o, i) => {
                            this.filterData.push(o);
                        });
                        // console.log(this.filterData, "filterData");
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
        goToAllPage() {
            this.$router.push({
                name: "iRouteCdnSettingById",
                query: {
                    id: "all"
                }
            });
        },
        goToNextPage(data) {
            // console.log(data);

            if (data.cname !== undefined) {
                this.$router.push({
                    name: "iRouteCdnSettingById",
                    query: {
                        domain_id: data.id
                    }
                });
            } else {
                this.$router.push({
                    name: "iRouteCdnSettingById",
                    query: {
                        group_id: data.id
                    }
                });
            }
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
    mounted() {
        this.getData();
    },
    created() {
        if (this.$route.query !== "") {
            this.$router.push("/iroutecdn");
        }
        this.checkPagePermission();
    }
};
</script>