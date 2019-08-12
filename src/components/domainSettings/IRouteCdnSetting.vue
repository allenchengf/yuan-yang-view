<template lang="pug">
    v-layout(wrap)
        v-flex(xs12)
            v-card(ref="irouteCdn")
                v-card-title
                    .subheading IRouteCDN
                    v-spacer
                    v-btn.my-0(color="primary" @click="clearBtn") Clear Filter
                    v-btn.my-0(color="primary" @click="goToIRoutePage") Route CDN
                v-divider
                v-card-text
                    v-layout(wrap)
                        v-flex(xs12 sm6 md3)
                            v-select(:items="continent" label="Select Continent" item-text="name" item-value="name" @change="chooseContinent(selectedContinent)" v-model="selectedContinent")
                        v-flex(xs12 sm6 md3)
                            v-select(:items="country" label="Select Country" item-text="name" item-value="name" @change="chooseCountry(selectedCountry)" v-model="selectedCountry")
                        v-flex(xs12 sm6 md3)
                            v-select(:items="isp" label="Select ISP" @change="chooseISP(selectedISP)" v-model="selectedISP")
                        v-flex(xs12 sm6 md3)
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
            domainInfo: {},
            group_id: "",
            selectedCdnProvider: "All",
            selectedISP: "All",
            selectedCountry: "All",
            selectedContinent: "All",
            searchText: "",
            country: [
                {
                    id: 1,
                    name: "china"
                },
                {
                    id: 2,
                    name: "not china"
                },
                {
                    id: 3,
                    name: "taiwan"
                }
            ],
            continent: [
                {
                    id: 2,
                    name: "africa"
                },
                {
                    id: 3,
                    name: "america"
                },
                {
                    id: 4,
                    name: "asia"
                },
                {
                    id: 5,
                    name: "europe"
                },
                {
                    id: 6,
                    name: "oceania"
                }
            ],
            isp: [],
            cdnProvider: [
                {
                    id: 1,
                    name: "aaa",
                    status: true,
                    user_group_id: 1,
                    ttl: 615
                },
                {
                    id: 2,
                    name: "ab",
                    status: true,
                    user_group_id: 1,
                    ttl: 600
                }
            ],
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
                    sortable: false,
                    value: "Location"
                },
                {
                    text: "ISP",
                    align: "left",
                    sortable: false,
                    value: "isp"
                },
                {
                    text: "CDN Provider",
                    align: "left",
                    sortable: false,
                    value: "CDN Provider"
                }
            ]
        };
    },
    watch: {
        currentTab: function(value) {
            this.getAlliRouteCDNs();
        },
        selectedContinent: function() {
            this.filterAction();
        },
        selectedCountry: function() {
            this.filterAction();
        },
        selectedISP: function() {
            this.filterAction();
        },
        selectedCdnProvider: function() {
            this.filterAction();
        }
    },
    methods: {
        filterAction() {
            if (this.selectedContinent !== "All") {
                this.filteredItems = this.filterData.filter(i => {
                    return i.continent.name === this.selectedContinent;
                });
            }
            if (this.selectedCountry !== "All") {
                this.filteredItems = this.filterData.filter(i => {
                    return i.country.name === this.selectedCountry;
                });
            }
            if (this.selectedISP !== "All") {
                this.filteredItems = this.filterData.filter(i => {
                    return i.isp === this.selectedISP;
                });
            }
            if (this.selectedCdnProvider !== "All") {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.cdn.cdn_provider.name === this.selectedCdnProvider
                        );
                    }
                });
            }
            if (
                this.selectedContinent !== "All" &&
                this.selectedCountry !== "All" &&
                this.selectedISP == "All" &&
                this.selectedCdnProvider == "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    return (
                        i.continent.name === this.selectedContinent &&
                        i.country.name === this.selectedCountry
                    );
                });
            }
            if (
                this.selectedContinent !== "All" &&
                this.selectedCountry == "All" &&
                this.selectedISP !== "All" &&
                this.selectedCdnProvider == "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    return (
                        i.continent.name === this.selectedContinent &&
                        i.isp === this.selectedISP
                    );
                });
            }
            if (
                this.selectedContinent !== "All" &&
                this.selectedCountry == "All" &&
                this.selectedISP == "All" &&
                this.selectedCdnProvider !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.continent.name === this.selectedContinent &&
                            i.cdn.cdn_provider.name === this.selectedCdnProvider
                        );
                    }
                });
            }
            if (
                this.selectedContinent == "All" &&
                this.selectedCountry !== "All" &&
                this.selectedISP !== "All" &&
                this.selectedCdnProvider == "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    return (
                        i.country.name === this.selectedCountry &&
                        i.isp === this.selectedISP
                    );
                });
            }
            if (
                this.selectedContinent == "All" &&
                this.selectedCountry !== "All" &&
                this.selectedISP == "All" &&
                this.selectedCdnProvider !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.country.name === this.selectedCountry &&
                            i.cdn.cdn_provider.name === this.selectedCdnProvider
                        );
                    }
                });
            }
            if (
                this.selectedContinent !== "All" &&
                this.selectedCountry !== "All" &&
                this.selectedISP !== "All" &&
                this.selectedCdnProvider == "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    return (
                        i.continent.name === this.selectedContinent &&
                        i.country.name === this.selectedCountry &&
                        i.isp === this.selectedISP
                    );
                });
            }
            if (
                this.selectedContinent !== "All" &&
                this.selectedCountry == "All" &&
                this.selectedISP !== "All" &&
                this.selectedCdnProvider !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.continent.name === this.selectedContinent &&
                            i.isp === this.selectedISP &&
                            i.cdn.cdn_provider.name === this.selectedCdnProvider
                        );
                    }
                });
            }
            if (
                this.selectedContinent == "All" &&
                this.selectedCountry !== "All" &&
                this.selectedISP !== "All" &&
                this.selectedCdnProvider !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.country.name === this.selectedCountry &&
                            i.isp === this.selectedISP &&
                            i.cdn.cdn_provider.name === this.selectedCdnProvider
                        );
                    }
                });
            }
            if (
                this.selectedContinent !== "All" &&
                this.selectedCountry !== "All" &&
                this.selectedISP == "All" &&
                this.selectedCdnProvider !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.continent.name === this.selectedContinent &&
                            i.country.name === this.selectedCountry &&
                            i.cdn.cdn_provider.name === this.selectedCdnProvider
                        );
                    }
                });
            }
            if (
                this.selectedContinent !== "All" &&
                this.selectedCountry !== "All" &&
                this.selectedISP !== "All" &&
                this.selectedCdnProvider !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.continent.name === this.selectedContinent &&
                            i.country.name === this.selectedCountry &&
                            i.isp === this.selectedISP &&
                            i.cdn.cdn_provider.name === this.selectedCdnProvider
                        );
                    }
                });
            }
            if (
                this.selectedContinent === "All" &&
                this.selectedCountry === "All" &&
                this.selectedISP === "All" &&
                this.selectedCdnProvider === "All"
            ) {
                this.filteredItems = this.filterData;
            }
        },
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
                        this.cdnProvider.unshift("All");

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
                .dispatch("iRouteCdn/getDomainIRouteCDNs", this.domain_id)
                .then(
                    function(result) {
                        this.filterData = result.data;
                        this.filteredItems = this.filterData;
                        this.isp.push(
                            ...new Set(this.filterData.map(x => x.isp))
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
        getDomainInfo() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getDomainById", this.domain_id)
                .then(
                    function(result) {
                        this.domainInfo = result.data.domain;
                        // console.log(this.domainInfo);
                        if (this.domainInfo.domain_group.length !== 0) {
                            this.group_id = this.domainInfo.domain_group[0].id;
                        }
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
        clearBtn() {
            this.selectedCdnProvider = "All";
            this.selectedISP = "All";
            this.selectedCountry = "All";
            this.selectedContinent = "All";
            this.filteredItems = this.filterData;
        },
        goToIRoutePage() {
            if (this.domainInfo.domain_group.length == 0) {
                this.$router.push({
                    name: "iRouteCdnSettingById",
                    query: {
                        domain_id: this.domain_id
                    }
                });
            } else {
                this.$router.push({
                    name: "iRouteCdnSettingById",
                    query: {
                        group_id: this.group_id
                    }
                });
            }
        }
    },
    mounted() {
        this.domain_id = this.$route.params.domain_id;
        this.getAlliRouteCDNs();
        this.getContinentList();
        this.getCountriesList();
        this.getAllCdnProvider();
        this.getDomainInfo();
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
