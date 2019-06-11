<template lang="pug">
    v-container#iRouteCdnSetting
        v-layout(wrap)
            v-flex(xs12)
                v-card
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
                                v-select(:items="cdnProvider" label="Select CDN" @change="chooseCdnProvider(selectedCdnProvider)" v-model="selectedCdnProvider")
                            

                    h7-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="3" single-line)
                        template(slot="items" slot-scope="{props, index}")
                            tr
                                td {{index}}
                                td {{props.item.continent.name}} / {{props.item.country.name}} / {{props.item.location}}
                                td {{props.item.isp}}
                                td {{props.item.network.name}}
        //- v-layout(wrap column) 
        //-     v-flex(xs12 sm4 md4)
        //-         v-tabs(slider-color="primary")
        //-             v-tab(v-for="item in items" @click="currentItem = item" v-model="currentItem" :disabled="item.disabled") {{item.name}} 
        //-             v-tabs-items
        //-                 v-tab-item(v-for="item in items" )
        //-                     component(:is="item.component" :domain_id="domain_id" :select="select")
</template>
<script>
export default {
    // props: ["domain_id"],
    data() {
        return {
            selectedCdnProvider: "",
            selectedISP: "",
            selectedCountry: "",
            selectedContinent: "",
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
            cdnProvider: [],
            cdnData: [],
            filterData: [
                {
                    id: 1,
                    continent_id: 1,
                    country_id: 2,
                    location: "All",
                    isp: "All",
                    network_id: 2,
                    cdn_id: null,
                    continent: {
                        id: 1,
                        name: "all"
                    },
                    country: {
                        id: 2,
                        name: "not china"
                    },
                    network: {
                        id: 2,
                        scheme_id: 1,
                        name: "国外"
                    }
                },
                {
                    id: 2,
                    continent_id: 4,
                    country_id: 1,
                    location: "All",
                    isp: "All",
                    network_id: 1,
                    cdn_id: null,
                    continent: {
                        id: 4,
                        name: "asia"
                    },
                    country: {
                        id: 1,
                        name: "china"
                    },
                    network: {
                        id: 1,
                        scheme_id: 1,
                        name: "国内"
                    }
                },
                {
                    id: 3,
                    continent_id: 4,
                    country_id: 1,
                    location: "All",
                    isp: "Dian xin",
                    network_id: 3,
                    cdn_id: null,
                    continent: {
                        id: 4,
                        name: "asia"
                    },
                    country: {
                        id: 1,
                        name: "china"
                    },
                    network: {
                        id: 3,
                        scheme_id: 1,
                        name: "电信"
                    }
                },
                {
                    id: 4,
                    continent_id: 4,
                    country_id: 1,
                    location: "All",
                    isp: "Lian tong",
                    network_id: 4,
                    cdn_id: null,
                    continent: {
                        id: 4,
                        name: "asia"
                    },
                    country: {
                        id: 1,
                        name: "china"
                    },
                    network: {
                        id: 4,
                        scheme_id: 1,
                        name: "联通"
                    }
                }
            ],
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
            ]
        };
    },
    methods: {
        chooseContinent(name) {
            console.log(name, "continent");
        },
        chooseCountry(name) {
            console.log(name, "country");
        },
        chooseISP(name) {
            console.log(name, "isp");
        },
        chooseCdnProvider(name) {
            console.log(name, "CdnProvider");
        },
        getAllCDNs() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getAllCDNs", this.domain_id)
                .then(
                    function(result) {
                        this.cdnData = result.data;
                        this.cdnProvider.push(
                            ...new Set(this.cdnData.map(x => x.name))
                        );
                        console.log(this.cdnProvider);
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
            this.isp.push(...new Set(this.filterData.map(x => x.isp)));
            console.log(this.isp);
        },
        goToIRoutePage() {
            this.$router.push({
                name: "iRouteCDN"
            });
        }
    },
    mounted() {
        this.domain_id = this.$route.params.domain_id;
        // this.$router.push("/admin/domain/" + this.domain_id);
        this.getAlliRouteCDNs();
        console.log(this.domain_id);
        this.getAllCDNs();
    }
};
</script>

<style lang="sass">
</style>
