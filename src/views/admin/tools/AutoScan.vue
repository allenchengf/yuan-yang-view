<template lang="pug">
    v-container#autoscan.grid-list-lg
        v-layout(wrap column)
            v-flex(xs12)
                .title Auto Scan
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading Auto Scan
                        v-spacer
                        .xs4.sm2.md2
                            v-select(:items="crawlerGroup" v-model="selectedCrawler" label="Select crawler" item-text="name" item-value="id")
                        v-btn.my-0(color="primary" @click="startScan") Scan
                        v-btn.my-0(color="primary" @click="changeAll") Change
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                            v-flex.ma-4.text-xs-right.grey--text
                                span Scanned at : {{scannedDate}}
                    h7-data-table(:headers="headers" :items="filteredItems" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line )
                        template(slot="items" slot-scope="{props, index}")
                            tr
                                td {{ index }}
                                td {{ props.item.continent.name }} / {{props.item.country.name}} / {{props.item.location}} / {{props.item.isp}}
                                td(v-for="item in props.item.scanned")
                                    span(:style="item.min == true ? 'color:green;font-weight: 600' : 'color: black'") {{item.latency}}
</template>
<script>
export default {
    data() {
        return {
            scannedDate: "2019-09-24 16:58:47",
            searchText: "",
            selectedCrawler: "",
            selectedCdnProvider: [],
            crawlerGroup: [],
            cdnProviderList: [],
            scanData: [],
            tableSettings: {},
            filteredItem: [],
            filteredItems: [
                // {
                //     continent: {
                //         name: "American"
                //     },
                //     country: {
                //         name: "NY"
                //     },
                //     location: "DD",
                //     isp: "CT",
                //     scanned: [
                //         { name: "Cloudfront", latency: 146 },
                //         {
                //             name: "Cloudflare",
                //             latency: 249
                //         },
                //         {
                //             name: "Hiero7",
                //             latency: 99
                //         }
                //     ]
                // },
                // {
                //     continent: {
                //         name: "Asia"
                //     },
                //     country: {
                //         name: "China"
                //     },
                //     location: "CC",
                //     isp: "CM",
                //     scanned: [
                //         { name: "Cloudfront", latency: 126 },
                //         {
                //             name: "Cloudflare",
                //             latency: 289
                //         },
                //         {
                //             name: "Hiero7",
                //             latency: 90
                //         }
                //     ]
                // }
            ],
            filterHeaders: [],
            regionMapping: {},
            headers: [
                {
                    key: "id",
                    text: "#",
                    align: "left",
                    sortable: false,
                    width: "80px",
                    value: "index",
                    control: false
                },
                {
                    key: "continent",
                    text: "Continent / Country / Region / ISP",
                    align: "left",
                    sortable: false,
                    value: "continent.name",
                    control: false
                }
            ]
        };
    },
    computed: {
        currentTitle() {
            return this.step === 1
                ? "Choose a crawler to scan"
                : "Choose CDN providers to scan";
        }
    },
    methods: {
        headerSetting() {
            this.headers.splice(2, this.headers.length - 2);
            this.filteredItems[0].scanned.forEach((o, i) => {
                var headers = {
                    align: "left",
                    control: true,
                    key: "",
                    text: "",
                    sortable: false,
                    value: ""
                };
                headers.key = o.name;
                headers.value = o.name;
                headers.text = o.name + " (ms)";
                this.headers.push(headers);
            });
            // console.log(this.headers, "headers");
        },
        tableHeaderChanged: function() {
            this.filterHeaders = this.headers.filter(
                ((item, i) => {
                    return this.tableSettings[item.key] || !item.control;
                }).bind(this)
            );
            // console.log(this.filterHeaders);
        },
        isShownColumn: function(key) {
            return this.tableSettings[key];
        },
        getScanProvider() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("crawlers/getScanProvider")
                .then(
                    function(result) {
                        this.crawlerGroup = result.data;
                        this.selectedCrawler = this.crawlerGroup[1].id;

                        // this.$store.dispatch("global/finishLoading");
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
        getCdnProvider() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/getAllCdnProvider")
                .then(
                    function(result) {
                        result.data.forEach((o, i) => {
                            if (o.scannable == true) {
                                this.cdnProviderList.push(o);
                                // this.tableSettings[o.name] = o.name;
                            }
                        });
                        this.getLastScanData();
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

        startScan() {
            this.$store.dispatch("global/startLoading");

            this.getScanData();
        },
        getScanData() {
            this.scanData = [];

            this.cdnProviderList.forEach((o, i) => {
                o.scan_platform = this.selectedCrawler;
                o.cdn_provider_id = o.id;
                this.$store
                    .dispatch("crawlers/getScanData", o)
                    .then(
                        function(result) {
                            this.scanData.push(result.data);
                            this.transformData();
                        }.bind(this)
                    )
                    .catch(
                        function(error) {
                            // this.$store.dispatch("global/finishLoading");
                            // this.$store.dispatch(
                            //     "global/showSnackbarError",
                            //     error.message
                            // );
                        }.bind(this)
                    );
            });

            // this.$store.dispatch("global/finishLoading");
        },
        transformData() {
            this.filteredItem = [];
            this.filteredItems = [];
            // console.log(this.scanData, "scanData");
            this.scannedDate = this.scanData[0].scannedAt;

            this.scanData.forEach((o, i) => {
                o.scanned.forEach((obj, idx) => {
                    obj.cdnProvider = o.cdnProvider;
                    obj.location_networks.scanned = {};
                    var scanned = {};
                    scanned.name = obj.cdnProvider.name;
                    if (obj.latency == null) {
                        scanned.latency = "No Data";
                    } else {
                        scanned.latency = obj.latency;
                    }
                    obj.location_networks.scanned = scanned;
                });
            });

            this.scanData.forEach((o, i) => {
                o.scanned.forEach((obj, idx) => {
                    this.regionMapping[obj.location_networks.id] = [];
                });
            });
            this.scanData.forEach((o, i) => {
                o.scanned.forEach((obj, idx) => {
                    this.regionMapping[obj.location_networks.id].push(
                        obj.location_networks.scanned
                    );
                });
            });
            // console.log(this.regionMapping, "regionMapping");

            this.scanData[0].scanned.forEach((o, i) => {
                this.filteredItem.push(o.location_networks);
            });
            this.filteredItem.forEach((o, i) => {
                o.scanned = this.regionMapping[o.id];
            });

            // console.log(this.filteredItem, "filteredItem");
            this.filteredItems = this.filteredItem;
            this.headerSetting();
            this.$store.dispatch("global/finishLoading");
            this.findMinByRow();
        },
        findMinByRow() {
            this.filteredItems.forEach((o, i) => {
                o.latencyArray = [];
                var latencyArray = [];
                o.scanned.forEach((obj, idx) => {
                    latencyArray.push(obj.latency);
                });
                o.latencyArray = latencyArray;
                if (_.min(latencyArray) !== "No Data") {
                    o.min = _.min(latencyArray);
                } else {
                    o.min = "";
                }
            });
            this.filteredItems.forEach((o, i) => {
                o.scanned.forEach((obj, idx) => {
                    if (obj.latency == o.min) {
                        obj.min = true;
                    } else {
                        obj.min = false;
                    }
                });
            });
            // console.log(this.filteredItems, "deal");
        },
        changeAll() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("crawlers/changeAllCdnProvider")
                .then(
                    function(result) {
                        // console.log(result.data, "data...change");
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change all CDN provider success!"
                        );
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
        getLastScanData() {
            this.cdnProviderList.forEach((o, i) => {
                o.scan_platform = this.selectedCrawler;
                o.cdn_provider_id = o.id;
            });
            // console.log(this.cdnProviderList, "getLasttime");
            this.cdnProviderList.forEach((o, i) => {
                this.$store
                    .dispatch("crawlers/getLastTimeScanData", o)
                    .then(
                        function(result) {
                            this.scanData.push(result.data);
                            // console.log(result.data, "data...");

                            this.transformData();
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
            });
        }
    },
    mounted() {
        this.selectedCdnProvider = [];
        this.getScanProvider();
        this.getCdnProvider();
    }
};
</script>
<style lang="sass" scoped>
td
  text-transform: capitalize
</style>
