<template lang="pug">
    v-container#autoscanlist
        v-layout(wrap column)
            v-flex(xs12)
                .title.text-xs-left.mb-4 Auto Scan List
            v-flex(xs12)
                v-breadcrumbs.pa-0(:items="breadcrumbsItems")
            v-flex(xs12)
                v-card
                    v-card-title.subheading Auto Scan List
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    h7-data-table(:headers="filterHeaders" :items="filteredItems" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line )
                        template(slot="items" slot-scope="{props, index}")
                            tr
                                td {{ index }}
                                td {{ props.item.continent.name }} / {{props.item.country.name}} / {{props.item.location}}
                                td(v-if="isShownColumn('Hiero7') && props.item.Hiero7.latency !== undefined") {{ props.item.Hiero7.latency }}
                                td(v-if="isShownColumn('CloudFront') && props.item.CloudFront !== undefined") {{props.item.CloudFront.latency }}
                                td(v-if="isShownColumn('Cloudflare') && props.item.Cloudflare !== undefined") {{props.item.Cloudflare.latency }}
                                td(v-if="isShownColumn('alibabaCloud') && props.item.alibabaCloud !== undefined") {{props.item.alibabaCloud.latency }}
                                td(v-if="isShownColumn('AlibabaCloud') && props.item.AlibabaCloud !== undefined") {{props.item.AlibabaCloud.latency }}
                                td(v-if="isShownColumn('yuanTest') && props.item.yuanTest !== undefined") {{props.item.yuanTest.latency }} 
                                td(v-if="isShownColumn('Akamai') && props.item.Akamai !== undefined") {{props.item.Akamai.latency }} 
                                td(v-if="isShownColumn('HostAdvice') && props.item.HostAdvice !== undefined") {{props.item.HostAdvice.latency }} 
                                td
                                    v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item)")
                                        v-icon(small) edit
            v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
                    v-card
                        v-card-title.title {{formTitle}}
                        v-card-text
                            span(v-if="cdnProvider.length == 1") Please at least choose 2 CDN providers to change.
                            v-form(ref="editForm" v-else)
                                v-select(:items="cdnProvider" label="From (Choose a CDN Provider for changing )" item-text="name" item-value="id" @change="selectFrom(routingRules.old_cdn_provider_id)" v-model="routingRules.old_cdn_provider_id" :rules="[rules.required]")
                                v-select(:items="cdnProvider" label="To ( Chosen CDN provider will change to this one)" item-text="name" item-value="id" v-model="routingRules.new_cdn_provider_id" @change="selectTo(routingRules.new_cdn_provider_id)" :rules="[rules.required]")

                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="closeEditDialog" v-if="cdnProvider.length === 1") OK
                            v-btn(color="primary" flat="flat" @click="updateRoutingRules" v-else) Save

</template>
<script>
import textFieldRules from "../../../utils/textFieldRules.js";

export default {
    mixins: [textFieldRules],
    data() {
        return {
            routingRules: {},
            chosenCdnProvider: {},
            scanData: [],
            tableSettings: {},
            tableColumns: [],
            cdnProvider: [],
            searchText: "",
            breadcrumbsItems: [
                {
                    text: "Auto Scan",
                    disabled: false,
                    exact: true,
                    to: "/admin/auto-scan"
                },
                {
                    text: "Auto Scan List",
                    disabled: true,
                    exact: true,
                    to: ""
                }
            ],
            filterData: [],
            dialog: {
                edit: false
            },
            filteredItem: [],
            filteredItems: [],
            cdnProviderList: [],
            selectedCrawler: "",
            selectedCdnProvider: [],
            crawlerGroup: ["17ce", "ChinaZ"],
            selectedCdnProviderData: [],
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
                    text: "Continent / Country / Region",
                    align: "left",
                    sortable: true,
                    value: "continent.name",
                    control: false
                },
                {
                    key: "Hiero7",
                    text: "Hiero7 Average Time",
                    align: "left",
                    sortable: true,
                    value: "Hiero7",
                    control: true
                },
                {
                    key: "CloudFront",
                    text: "CloudFront Average Time",
                    align: "left",
                    sortable: false,
                    value: "CloudFront",
                    control: true
                },
                {
                    key: "Cloudflare",
                    text: "Cloudflare Average Time",
                    align: "left",
                    sortable: false,
                    value: "Cloudflare",
                    control: true
                },
                {
                    key: "alibabaCloud",
                    text: "AlibabaCloud Average Time",
                    align: "left",
                    sortable: false,
                    value: "alibabaCloud",
                    control: true
                },
                {
                    key: "AlibabaCloud",
                    text: "AlibabaCloud Average Time",
                    align: "left",
                    sortable: false,
                    value: "AlibabaCloud",
                    control: true
                },
                {
                    key: "yuanTest",
                    text: "YuanTest Average Time",
                    align: "left",
                    sortable: false,
                    value: "yuanTest",
                    control: true
                },
                {
                    key: "Akamai",
                    text: "Akamai Average Time",
                    align: "left",
                    sortable: false,
                    value: "Akamai",
                    control: true
                },
                {
                    key: "HostAdvice",
                    text: "HostAdvice Average Time",
                    align: "left",
                    sortable: false,
                    value: "HostAdvice",
                    control: true
                },
                {
                    key: "action",
                    text: "Actions",
                    align: "left",
                    sortable: false,
                    width: "150px",
                    control: false
                }
            ]
        };
    },
    computed: {
        formTitle() {
            return this.cdnProvider.length === 1
                ? "Can not change CDN Provider"
                : "Change CDN Provider";
        }
    },
    methods: {
        selectFrom(val) {
            // console.log(val);
            // console.log(this.cdnProvider);
        },
        selectTo(val) {
            // console.log(val);
        },
        tableHeaderChanged: function() {
            this.filterHeaders = this.headers.filter(
                ((item, i) => {
                    return this.tableSettings[item.key] || !item.control;
                }).bind(this)
            );
        },
        isShownColumn: function(key) {
            // console.log(this.tableSettings[key]);
            return this.tableSettings[key];
        },
        getCdnProvider() {
            this.$store
                .dispatch("cdnProviders/getAllCdnProvider")
                .then(
                    function(result) {
                        this.cdnProviderList = result.data;
                        // console.log(this.cdnProviderList, "cdnProvider");
                        this.cdnProviderList.forEach((o, i) => {
                            this.selectedCdnProvider.forEach((obj, idx) => {
                                var cdnProvider = {};
                                if (o.id == obj) {
                                    this.tableSettings[o.name] = o.name;
                                    cdnProvider.name = o.name;
                                    cdnProvider.id = o.id;
                                    this.cdnProvider.push(cdnProvider);
                                }
                            });
                        });
                        // console.log(this.tableSettings, "this.tableSettings");
                        this.tableHeaderChanged();
                        // console.log(this.filterHeaders);
                        // this.$store.dispatch("global/finishLoading");
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
        },
        getCrawlerData(crawlerName) {
            switch (crawlerName) {
                case "17ce":
                    this.get17ceData();
                    break;

                case "chinaz":
                    this.getChinazData();
                    break;

                default:
                    break;
            }
        },
        getCrawlerData() {
            // this.transformData();
            this.scanData = [];
            this.$store.dispatch("global/startLoading");
            this.selectData.forEach((o, i) => {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("crawlers/getScanData", o)
                    .then(
                        function(result) {
                            // console.log(result.data);
                            this.scanData.push(result.data);
                            // console.log(this.scanData, "this.scanData");
                            this.transformData();
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
            });
        },
        transformData() {
            console.log(this.scanData);
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
            console.log(this.filteredItems);
            // console.log(result); // {1, 2, "a", 3, "b"}
            // console.log(repeat); // {1, "a"}
            // console.log(this.filteredItem, "item");
        },
        editItem(data) {
            this.dialog.edit = true;
            // console.log(data);
            this.routingRules.id = data.id;
        },
        updateRoutingRules() {
            // console.log(this.routingRules);
            this.$store.dispatch("global/startLoading");

            this.$store
                .dispatch("crawlers/updateRoutingRules", this.routingRules)
                .then(
                    function(result) {
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change CDN provider success!"
                        );
                        this.closeEditDialog();
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
        closeEditDialog() {
            this.dialog.edit = false;
            this.$refs.editForm.reset();
        }
    },
    created() {
        this.selectedCdnProvider = this.$route.query.cdn_provider;
        this.selectedCrawler = this.$route.query.crawler;
        this.selectData = [];
        this.selectedCdnProvider.forEach((o, i) => {
            var selectData = {};
            selectData.scan_platform = this.selectedCrawler;
            selectData.cdn_provider_id = o;
            this.selectData.push(selectData);
        });

        // console.log(this.selectData);
        this.getCdnProvider();
        this.getCrawlerData();
    }
};
</script>
