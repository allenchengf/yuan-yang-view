<template lang="pug">
    v-container#iRouteCdnSetting
        v-layout(wrap)
            v-flex(xs12 sm3 d-flex)
                v-autocomplete(:items="continent" :filter="customFilter" label="Continent" item-text="name" v-model="searchText")
            v-flex(xs12 sm3 d-flex)
                v-autocomplete(:items="country" :filter="customFilter" label="Country" item-text="name" v-model="searchText")
            v-flex(xs12 sm3 d-flex)
                v-autocomplete(:items="network" :filter="customFilter" label="Network" item-text="name" v-model="searchText")
            v-flex(xs12 sm3 d-flex)
                v-autocomplete(:items="cdnProvider" :filter="customFilter" label="CDN Provider" item-text="name" v-model="searchText")
        v-card
            v-card-title
                v-layout(row align-center)
                    v-flex(xs12 sm6)
                        v-text-field.pt-0.mt-0(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    v-spacer
                    v-btn(color="primary" dark) Batch Override
            v-data-table.elevation-1(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :pagination.sync="pagination"  hide-actions :search="searchText" v-model="selected" select-all)
                v-progress-linear(v-slot:progress color="primary")
                template(slot="items" slot-scope="props")
                    tr
                        td.text-xs-left
                            v-checkbox(v-model="props.selected" primary hide-details)
                        td.text-xs-left {{props.index +1}}
                        td.text-xs-left {{props.item.country_name}} / {{props.item.location}}
                        td.text-xs-left {{props.item.isp}}
                        td.text-xs-left
                            v-select(:items="cdnProvider" v-model="props.item.cdn_name" @change="editItem(props.item, 0)")
                                        
            v-layout.px-2(row align-center)
                v-flex.text-xs-left.py-3(xs4)
                v-flex.text-xs-right.py-3(xs8)
                    v-pagination(v-model="pagination.page" :length="pages" :total-visible="7" color="primary")
</template>
<script>
export default {
    props: ["domain_id"],
    data() {
        return {
            selected: [],
            location: [],
            country: [],
            continent: [],
            network: [],
            cdnProvider: [],
            selectedCDN: [],
            iRouteCDN: {},
            filterData: [
                // {
                //     id: 1,
                //     continent_id: 1,
                //     country_id: 2,
                //     location: "All",
                //     isp: "All",
                //     network_id: 2,
                //     edited_by: null,
                //     created_at: "2019-05-15 15:29:18",
                //     updated_at: "2019-05-15 15:29:18",
                //     deleted_at: null,
                //     continent_name: "all",
                //     country_name: "not china",
                //     network_name: "国外",
                //     cdn_id: 2,
                //     cdn_name: "dnspod"
                // },
                // {
                //     id: 2,
                //     continent_id: 4,
                //     country_id: 1,
                //     location: "All",
                //     isp: "All",
                //     network_id: 1,
                //     edited_by: null,
                //     created_at: "2019-05-15 15:29:18",
                //     updated_at: "2019-05-15 15:29:18",
                //     deleted_at: null,
                //     continent_name: "asia",
                //     country_name: "china",
                //     network_name: "国内",
                //     cdn_id: null,
                //     cdn_name: "hiero7"
                // },
                // {
                //     id: 3,
                //     continent_id: 4,
                //     country_id: 1,
                //     location: "All",
                //     isp: "Dian xin",
                //     network_id: 3,
                //     edited_by: null,
                //     created_at: "2019-05-15 15:29:18",
                //     updated_at: "2019-05-15 15:29:18",
                //     deleted_at: null,
                //     continent_name: "asia",
                //     country_name: "china",
                //     network_name: "电信",
                //     cdn_id: null,
                //     cdn_name: "hiero7"
                // },
                // {
                //     id: 4,
                //     continent_id: 4,
                //     country_id: 1,
                //     location: "All",
                //     isp: "Lian tong",
                //     network_id: 4,
                //     edited_by: null,
                //     created_at: "2019-05-15 15:29:18",
                //     updated_at: "2019-05-15 15:29:18",
                //     deleted_at: null,
                //     continent_name: "asia",
                //     country_name: "china",
                //     network_name: "联通",
                //     cdn_id: null,
                //     cdn_name: "hiero7"
                // },
                // {
                //     id: 5,
                //     continent_id: 1,
                //     country_id: 2,
                //     location: "All",
                //     isp: "All",
                //     network_id: 15,
                //     edited_by: null,
                //     created_at: "2019-05-15 15:29:18",
                //     updated_at: "2019-05-15 15:29:18",
                //     deleted_at: null,
                //     continent_name: "all",
                //     country_name: "not china",
                //     network_name: "国外",
                //     cdn_id: null,
                //     cdn_name: "hiero7"
                // },
                // {
                //     id: 6,
                //     continent_id: 4,
                //     country_id: 1,
                //     location: "All",
                //     isp: "All",
                //     network_id: 16,
                //     edited_by: null,
                //     created_at: "2019-05-15 15:29:18",
                //     updated_at: "2019-05-15 15:29:18",
                //     deleted_at: null,
                //     continent_name: "asia",
                //     country_name: "china",
                //     network_name: "国内",
                //     cdn_id: null,
                //     cdn_name: "hiero7"
                // },
                // {
                //     id: 7,
                //     continent_id: 4,
                //     country_id: 1,
                //     location: "Beijing",
                //     isp: "Yidong",
                //     network_id: 101,
                //     edited_by: null,
                //     created_at: "2019-05-15 15:29:18",
                //     updated_at: "2019-05-15 15:29:18",
                //     deleted_at: null,
                //     continent_name: "asia",
                //     country_name: "china",
                //     network_name: "北京移动",
                //     cdn_id: null,
                //     cdn_name: "hiero7"
                // },
                // {
                //     id: 8,
                //     continent_id: 4,
                //     country_id: 1,
                //     location: "Beijing",
                //     isp: "Dian xin",
                //     network_id: 33,
                //     edited_by: null,
                //     created_at: "2019-05-15 15:29:18",
                //     updated_at: "2019-05-15 15:29:18",
                //     deleted_at: null,
                //     continent_name: "asia",
                //     country_name: "china",
                //     network_name: "北京电信",
                //     cdn_id: null,
                //     cdn_name: "hiero7"
                // }
            ],
            pagination: {
                rowsPerPage: 20
            },
            rowsPerPageItems: [
                { name: "20 per page", value: 20 },
                { name: "50 per pages", value: 50 }
            ],
            perPage: 20,
            pages: 0,
            error: {
                status: false,
                message: ""
            },
            editedIndex: -1,
            searchText: "",
            headers: [
                {
                    text: "#",
                    align: "left",
                    sortable: false,
                    width: "80px",
                    value: "id"
                },
                {
                    text: "Location",
                    align: "left",
                    sortable: true,
                    value: "Location"
                },
                {
                    text: "Network",
                    align: "left",
                    sortable: true,
                    value: "Network"
                },
                {
                    text: "CDN Provider",
                    align: "left",
                    sortable: true,
                    value: "CDN Provider"
                }
            ]
        };
    },
    methods: {
        getAllCDNs: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getAllCDNs", this.domain_id)
                .then(
                    function(result) {
                        var cdnData = result.data;
                        this.cdnProvider = [
                            ...new Set(cdnData.map(x => x.name))
                        ];
                        console.log(this.cdnProvider, "vv");
                        // this.cdn.domain_id = this.tab.domain_id;
                        // this.setPages();
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
        getAlliRouteCDNs() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getAlliRouteCDNs", this.domain_id)
                .then(
                    function(result) {
                        this.filterData = result.data;
                        this.handleData();
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
        customFilter(item, queryText, itemText) {
            const textOne = item.toLowerCase();
            // const textTwo = item.cname.toLowerCase();
            const searchText = queryText.toLowerCase();

            return (
                textOne.indexOf(searchText) > -1
                // textTwo.indexOf(searchText) > -1
            );
        },
        handleData() {
            this.location = [...new Set(this.filterData.map(x => x.location))];
            this.country = [
                ...new Set(this.filterData.map(x => x.country_name))
            ];
            this.continent = [
                ...new Set(this.filterData.map(x => x.continent_name))
            ];
            this.network = [...new Set(this.filterData.map(x => x.isp))];
            // this.cdnProvider = [
            //     ...new Set(this.filterData.map(x => x.cdn_name))
            // ];
            // console.log(this.cdnProvider);

            this.setPages();
        },
        editItem: function(item, type) {
            console.log(item);
            this.editedIndex = this.filterData.indexOf(item);
            this.iRouteCDN = Object.assign({}, item);
            this.iRouteCDN.domain_id = this.domain_id;
            console.log(this.iRouteCDN, "dx");
            if (type == 0) {
                // 打api
                this.updateiRouteCDN();
                console.log("dd");
            }
        },
        updateiRouteCDN: function() {
            this.iRouteCDN.domain_id = this.domain_id;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/updateiRouteCDN", this.iRouteCDN)
                .then(
                    function(result) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change CDN Provider Success!"
                        );
                        this.getAlliRouteCDNs();
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
        setPages: function() {
            if (this.perPage == null || this.filterData == null) {
                this.pages = null;
            } else {
                this.pages = Math.ceil(this.filterData.length / this.perPage);
            }
        }
    },
    watch: {
        perPage: function(value) {
            this.pagination.rowsPerPage = value;
            this.setPages();
        },
        searchText: function() {
            // this.getAllCDNs();
            // console.log(this.searchText);
        },
        domain_id: function(value) {
            this.getAllCDNs();
            this.getAlliRouteCDNs();
        }
    },
    mounted() {
        console.log(this.domain_id, "domain_id");
        this.getAllCDNs();
        this.getAlliRouteCDNs();
    }
};
</script>
<style lang="sass">
.v-input
    padding: 0 10px
</style>

