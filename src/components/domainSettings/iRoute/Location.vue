<template lang="pug">
    v-container#iRouteCdnSetting
        v-layout(wrap)
            v-flex(xs12 sm3 d-flex)
                v-select(:items="continent" :filter="customFilter" label="Continent" item-text="name" v-model="continentFilter" )
            v-flex(xs12 sm3 d-flex)
                v-select(:items="country" :filter="customFilter" label="Country" item-text="name" v-model="countryFilter" )
            v-flex(xs12 sm3 d-flex)
                v-select(:items="network" :filter="customFilter" label="Network" item-text="name" v-model="networkFilter" )
            v-flex(xs12 sm3 d-flex)
                v-select(:items="cdnProvider" :filter="customFilter" label="CDN Provider" item-text="name" v-model="cdnProviderFilter" )
        v-card
            v-card-title
                v-layout(row align-center)
                    //- v-flex(xs12 sm6)
                        v-text-field.pt-0.mt-0(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    v-spacer
                    v-btn(color="primary" dark) Batch Override
            v-data-table.elevation-1(:headers="headers" :items="filteredItems" :loading="$store.state.global.isLoading" :pagination.sync="pagination" hide-actions v-model="selected" select-all :custom-filter="customFilter")
                v-progress-linear(v-slot:progress color="primary")
                template(slot="items" slot-scope="props")
                    tr
                        td.text-xs-left
                            v-checkbox(v-model="props.selected" primary hide-details)
                        td.text-xs-left {{props.index +1}}
                        td.text-xs-left.location {{props.item.country_name}} / {{props.item.location}}
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
    props: ["domain_id", "tab"],
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
            filterData: [],
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
            continentFilter: "",
            countryFilter: "",
            networkFilter: "",
            cdnProviderFilter: "",
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
    computed: {
        filteredItems() {
            return this.filterData.filter(i => {
                return (
                    (!this.continentFilter ||
                        i.continent_name === this.continentFilter) &&
                    (!this.networkFilter || i.isp === this.networkFilter) &&
                    (!this.countryFilter ||
                        i.country_name === this.countryFilter) &&
                    (!this.cdnProviderFilter ||
                        i.cdn_name === this.cdnProviderFilter)
                );
            });
        }
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
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch("global/finishLoading");
                        // this.$store.dispatch(
                        //     "global/showSnackbarError",
                        //     error.message
                        // );
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
                        console.log(this.filterData);
                        this.handleData();
                        this.setPages();
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch("global/finishLoading");
                        // this.$store.dispatch(
                        //     "global/showSnackbarError",
                        //     error.message
                        // );
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
        },
        editItem: function(item, type) {
            this.editedIndex = this.filterData.indexOf(item);
            this.iRouteCDN = Object.assign({}, item);
            this.iRouteCDN.domain_id = this.domain_id;
            console.log(this.iRouteCDN, "dx");
            if (type == 0) {
                // 打api
                console.log(this.iRouteCDN, "dx");

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
                        // this.$store.dispatch(
                        //     "global/showSnackbarError",
                        //     error.message
                        // );
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
        domain_id: function() {
            console.log(this.domain_id, "domain");
            this.getAllCDNs();
            this.getAlliRouteCDNs();
            this.continentFilter = "";
            this.countryFilter = "";
            this.networkFilter = "";
            this.cdnProviderFilter = "";
        }
    },
    mounted() {
        this.getAllCDNs();
        this.getAlliRouteCDNs();
    }
};
</script>

<style lang="sass" scoped>
.v-input
    padding: 0 10px
td.location
  text-transform: capitalize

</style>

