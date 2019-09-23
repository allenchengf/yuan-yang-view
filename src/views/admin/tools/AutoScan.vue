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
                                span 2019-09-19 
                    h7-data-table(:headers="filterHeaders" :items="filteredItems" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line )
                        template(slot="items" slot-scope="{props, index}")
                            tr
                                td {{ index }}
                                td {{ props.item.continent.name }} / {{props.item.country.name}} / {{props.item.location}} / {{props.item.isp}}
                                td(v-if="isShownColumn('Hiero7') && props.item.Hiero7.latency !== undefined") {{ props.item.Hiero7.latency }}
                                td(v-if="isShownColumn('CloudFront') && props.item.CloudFront !== undefined") {{props.item.CloudFront.latency }}
                                td(v-if="isShownColumn('Cloudflare') && props.item.Cloudflare !== undefined") {{props.item.Cloudflare.latency }}
                                td(v-if="isShownColumn('alibabaCloud') && props.item.alibabaCloud !== undefined") {{props.item.alibabaCloud.latency }}
                                td(v-if="isShownColumn('AlibabaCloud') && props.item.AlibabaCloud !== undefined") {{props.item.AlibabaCloud.latency }}
                                td(v-if="isShownColumn('yuanTest') && props.item.yuanTest !== undefined") {{props.item.yuanTest.latency }} 
                                td(v-if="isShownColumn('Akamai') && props.item.Akamai !== undefined") {{props.item.Akamai.latency }} 
                                td(v-if="isShownColumn('HostAdvice') && props.item.HostAdvice !== undefined") {{props.item.HostAdvice.latency }} 
                    
                        
                        

                //- v-card
                //-     v-card-title.title.font-weight-regular.justify-space-between
                //-         span {{ currentTitle }}
                //-         v-avatar.subheading.white--text(color="primary" size="24" v-text="step")
                //-     v-window(v-model="step")
                //-         v-window-item(:value="1")
                //-             v-card-text
                //-                 v-radio-group(v-model="selectedCrawler")
                //-                     v-radio(v-for="item in crawlerGroup" :key="item.id" :label="item.name" :value="item.id")
                //-         v-window-item(:value="2")
                //-             v-card-text
                //-                 v-container
                //-                     v-checkbox(v-for="item in cdnProviderList" :disabled="item.status == 0 || item.url == null" :key="item.id" :label="item.name" :value="item.id" v-model="selectedCdnProvider")
                //-     v-divider
                //-     v-card-actions
                //-         v-btn(:disabled="step === 1" flat @click="back") Back
                //-         v-spacer
                //-         v-btn(v-if="step === 2" color="primary" depressed @click="startScan" :disabled="selectedCdnProvider.length == 0") Start Scan
                //-         v-btn(v-if="step !== 2" color="primary" depressed @click="next" :disabled="selectedCrawler==''") Next
 

</template>
<script>
export default {
    data() {
        return {
            searchText: "",
            selectedCrawler: "",
            selectedCdnProvider: [],
            crawlerGroup: [],
            cdnProviderList: [],
            scanData: [],
            tableSettings: {},
            filteredItem: [],
            filteredItems: [],
            filterHeaders: [],
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
                    sortable: true,
                    value: "continent.name",
                    control: false
                },
                {
                    key: "Hiero7",
                    text: "Hiero7 (ms)",
                    align: "left",
                    sortable: true,
                    value: "Hiero7",
                    control: true
                },
                {
                    key: "CloudFront",
                    text: "CloudFront (ms)",
                    align: "left",
                    sortable: false,
                    value: "CloudFront",
                    control: true
                },
                {
                    key: "Cloudflare",
                    text: "Cloudflare (ms)",
                    align: "left",
                    sortable: false,
                    value: "Cloudflare",
                    control: true
                },
                {
                    key: "alibabaCloud",
                    text: "AlibabaCloud (ms)",
                    align: "left",
                    sortable: false,
                    value: "alibabaCloud",
                    control: true
                },
                {
                    key: "AlibabaCloud",
                    text: "AlibabaCloud (ms)",
                    align: "left",
                    sortable: false,
                    value: "AlibabaCloud",
                    control: true
                },
                {
                    key: "yuanTest",
                    text: "YuanTest (ms)",
                    align: "left",
                    sortable: false,
                    value: "yuanTest",
                    control: true
                },
                {
                    key: "Akamai",
                    text: "Akamai (ms)",
                    align: "left",
                    sortable: false,
                    value: "Akamai",
                    control: true
                },
                {
                    key: "HostAdvice",
                    text: "HostAdvice (ms)",
                    align: "left",
                    sortable: false,
                    value: "HostAdvice",
                    control: true
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
        tableHeaderChanged: function() {
            this.filterHeaders = this.headers.filter(
                ((item, i) => {
                    return this.tableSettings[item.key] || !item.control;
                }).bind(this)
            );
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
                        this.selectedCrawler = this.crawlerGroup[0].id;

                        // this.$store.dispatch("global/finishLoading");
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
        getCdnProvider() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/getAllCdnProvider")
                .then(
                    function(result) {
                        result.data.forEach((o, i) => {
                            if (o.scannable == true) {
                                this.cdnProviderList.push(o);
                                this.tableSettings[o.name] = o.name;
                            }
                        });
                        // console.log(this.tableSettings);
                        this.tableHeaderChanged();
                        this.getLastScanData();
                        // console.log(this.cdnProviderList);
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

        startScan() {
            // console.log(this.selectedCrawler);
            this.$store.dispatch("global/startLoading");
            this.getScanData();
        },
        getScanData() {
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
                            this.$store.dispatch(
                                "global/showSnackbarError",
                                error.message
                            );
                        }.bind(this)
                    );
            });
            // this.transformData();

            // this.$store.dispatch("global/finishLoading");
        },
        transformData() {
            // console.log(this.scanData, "scanData");
            this.scanData[0].scanned.forEach((o, i) => {
                o.location_networks[this.scanData[0].cdnProvider.name] = {};
                if (o.latency == null) {
                    o.location_networks[
                        this.scanData[0].cdnProvider.name
                    ].latency = "No Data";
                } else {
                    o.location_networks[
                        this.scanData[0].cdnProvider.name
                    ].latency = o.latency;
                }

                o.location_networks[
                    this.scanData[0].cdnProvider.name
                ].name = this.scanData[0].cdnProvider.name;
                o.location_networks[
                    this.scanData[0].cdnProvider.name
                ].id = this.scanData[0].cdnProvider.id;

                this.filteredItem.push(o.location_networks);
            });
            // console.log(this.filteredItem, "this.filteredItem");
            this.filteredItem.forEach((o, i) => {
                for (var idx = 1; idx < this.scanData.length; idx++) {
                    this.scanData[idx].scanned.forEach((object, index) => {
                        if (o.id == object.location_networks.id) {
                            o[this.scanData[idx].cdnProvider.name] = {};
                            o[
                                this.scanData[idx].cdnProvider.name
                            ].name = this.scanData[idx].cdnProvider.name;
                            o[
                                this.scanData[idx].cdnProvider.name
                            ].id = this.scanData[idx].cdnProvider.id;
                            if (object.latency == null) {
                                o[this.scanData[idx].cdnProvider.name].latency =
                                    "No Data";
                            } else {
                                o[this.scanData[idx].cdnProvider.name].latency =
                                    object.latency;
                            }
                        }
                    });
                }
            });

            var result = new Set();
            var repeat = new Set();
            this.filteredItem.forEach(item => {
                result.has(item.id) ? repeat.add(item) : result.add(item);
            });
            this.filteredItems = [...result];
            // console.log(this.filteredItems, "filterItems");
            this.$store.dispatch("global/finishLoading");

            // console.log(result); // {1, 2, "a", 3, "b"}
            // console.log(repeat); // {1, "a"}
            // console.log(this.filteredItem, "item");
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
                            // console.log(this.scanData, "data...");

                            this.transformData();
                        }.bind(this)
                    )
                    .catch(
                        function(error) {
                            // this.$store.dispatch("global/finishLoading");
                            this.$store.dispatch(
                                "global/showSnackbarError",
                                error.message
                            );
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
