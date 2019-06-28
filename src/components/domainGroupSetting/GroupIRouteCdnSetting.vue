<template lang="pug">
    v-layout(wrap)
        v-flex(xs12)
            v-card(ref="irouteCdn")
                v-card-title
                    .subheading IRouteCDN
                    v-spacer
                    v-btn.my-0(color="primary" @click="goToIRoutePage") Route CDN
                v-divider
                v-card-text
                    v-layout(wrap)
                        v-flex(xs12 sm6 md4)
                            v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                        v-flex(xs12 sm6 md2)
                            v-select(:items="continent" label="Select Continent" item-text="name" item-value="name" @change="chooseContinent(selectedContinent)" v-model="selectedContinent")
                        v-flex(xs12 sm6 md2)
                            v-select(:items="country" label="Select Country" item-text="name" item-value="name" @change="chooseCountry(selectedCountry)" v-model="selectedCountry")
                        v-flex(xs12 sm6 md2)
                            v-select(:items="isp" label="Select ISP" @change="chooseISP(selectedISP)" v-model="selectedISP")
                        v-flex(xs12 sm6 md2)
                            v-select(:items="cdnProvider" label="Select CDN" item-text="name" item-value="name" @change="chooseCdnProvider(selectedCdnProvider)" v-model="selectedCdnProvider")
                        
                h7-data-table(:headers="headers" :items="filteredItems" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line)
                    template(slot="items" slot-scope="{props, index}")
                        td {{index}}
                        td {{props.item.continent.name}} / {{props.item.country.name}} / {{props.item.location}}
                        td {{props.item.isp}}
                        td {{props.item.cdn == null ? props.item.cdn : props.item.cdn.cdn_provider.name}}
</template>
<script>
export default {
    props: ["currentTab"],
    data() {
        return {
            selectedCdnProvider: "",
            selectedISP: "",
            selectedCountry: "",
            selectedContinent: "",
            searchText: "",
            country: [],
            continent: [],
            isp: [],
            cdnProvider: [],
            cdnData: [],
            filteredItems: [],
            filterData: [],
            headers: [
                {
                    text: "#",
                    align: "left",
                    sortable: false,
                    width: "80px",
                    value: "index"
                },
                {
                    text: "Continent / Country / Region",
                    align: "left",
                    sortable: true,
                    value: "Location"
                },
                {
                    text: "ISP",
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
            ],
            groupId: ""
        };
    },
    watch: {
        currentTab: function(value) {
            this.getAlliRouteCDNs();
        },
        selectedContinent: function() {
            if (this.selectedContinent == "All") {
                this.filteredItems = this.filterData.filter(i => {
                    return i.continent.name !== this.selectedContinent;
                });
            } else {
                this.filteredItems = this.filterData.filter(i => {
                    return (
                        !this.selectedContinent ||
                        i.continent.name === this.selectedContinent
                    );
                });
            }
        },
        selectedCountry: function() {
            if (this.selectedCountry == "All") {
                this.filteredItems = this.filterData.filter(i => {
                    return i.country.name !== this.selectedCountry;
                });
            } else {
                this.filteredItems = this.filterData.filter(i => {
                    return (
                        !this.selectedCountry ||
                        i.country.name === this.selectedCountry
                    );
                });
            }
        },
        selectedISP: function() {
            this.filteredItems = this.filterData.filter(i => {
                return !this.selectedISP || i.isp === this.selectedISP;
            });
        },
        selectedCdnProvider: function() {
            this.filteredItems = this.filterData.filter(i => {
                return (
                    !this.selectedCdnProvider ||
                    i.cdn.cdn_provider.name === this.selectedCdnProvider
                );
            });
        }
    },
    methods: {
        chooseContinent(name) {
            // console.log(name, "continent");
        },
        chooseCountry(name) {
            // console.log(name, "country");
        },
        chooseISP(name) {
            // console.log(name, "isp");
        },
        chooseCdnProvider(name) {
            // console.log(name, "CdnProvider");
        },
        getContinentList() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("locationInfo/getContinentList")
                .then(
                    function(result) {
                        this.continent[0] = "All";
                        var continentData = result.data;
                        continentData.forEach((o, i) => {
                            this.continent.push(o.name);
                        });
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
        getCountriesList() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("locationInfo/getCountriesList")
                .then(
                    function(result) {
                        this.country[0] = "All";
                        var countriesData = result.data;
                        countriesData.forEach((o, i) => {
                            this.country.push(o.name);
                        });
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
        getAllCdnProvider() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/getAllCdnProvider")
                .then(
                    function(result) {
                        this.cdnProvider = result.data;

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
                .dispatch("grouping/getGroupIRouteCdn", this.groupId)
                .then(
                    function(result) {
                        this.filterData = result.data;
                        this.filteredItems = this.filterData.location_network;
                        this.isp.push(
                            ...new Set(
                                this.filterData.location_network.map(x => x.isp)
                            )
                        );
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
        goToIRoutePage() {
            this.$router.push({
                name: "iRouteCDN"
            });
        }
    },
    mounted() {
        this.groupId = this.$route.params.groupId;
        this.getAlliRouteCDNs();
        this.getContinentList();
        this.getCountriesList();
        this.getAllCdnProvider();
    }
};
</script>

<style lang="sass" scoped>
.v-select
    text-transform: capitalize
.v-select-list
    text-transform: capitalize
td
  text-transform: capitalize
</style>
