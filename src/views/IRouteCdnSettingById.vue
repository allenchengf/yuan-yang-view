<template lang="pug">
    v-container#iroutecdnInfo.grid-list-lg
        v-layout(wrap)
            v-flex(xs12)
                .title iRouteCDN Rules - {{infoData.name}}
            v-flex(xs12)
                v-breadcrumbs.pa-0(:items="breadcrumbsItems")
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading CDN Rules
                        v-spacer
                        v-btn.my-0(color="primary" @click="clearBtn") Clear Filter
                        v-btn.my-0(color="primary" @click="batchOverride(-1)") Batch select CDN provider
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md3)
                                v-select(:items="continent" label="Select Continent" v-model="continentFilter")
                            v-flex(xs12 sm6 md3)
                                v-select(:items="country" label="Select Country" v-model="countryFilter")
                            v-flex(xs12 sm6 md3)
                                v-select(:items="isp" label="Select ISP" v-model="ispFilter")
                            v-flex(xs12 sm6 md3)
                                v-select(:items="cdnProviderItems" label="Select CDN Provider" item-text="name" item-value="name" v-model="cdnProviderFilter")
                            
                        v-layout(wrap v-if="breadcrumbsItems[1].text == 'All'")
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search Domain/Group" single-line hide-details)
                            v-flex(xs12 sm12 md12)
                                v-alert(:value="alert" type="warning" outline icon="warning" ) {{searchText}} is in {{domainInGroupMsg}}
                    v-data-table.elevation-1(v-model="selected" :headers="headers" :items="filteredItems" select-all :search="searchText" :pagination.sync="pagination" :item-key="'index'" hide-actions)
                        template(v-slot:items="props" )
                            td 
                                v-checkbox(v-model="props.selected" primary hide-details)
                            td {{props.item.index}}
                            td(v-if="breadcrumbsItems[1].text === 'All'") {{props.item.name}}
                            td {{props.item.continent.name}} / {{props.item.country.name}} / {{props.item.location}}
                            td {{props.item.isp}}
                            td {{props.item.cdn.cdn_provider.name}}
                                span
                                    v-btn.ma-0(flat icon small color="primary" title="edit" @click="editItem(props.item)") 
                                        v-icon(small) edit
                    v-layout.px-2(row align-center)
                        v-flex.text-xs-left.py-3(xs4)
                            slot(name="actions-left")
                        v-layout(row align-center)
                            v-layout(row align-center)
                                small Rows per page:
                                v-select.px-3(:items="page" v-model="perPage" align-center)
                            v-flex.text-xs-right.py-3(xs8)
                                v-pagination(v-model="currentPage" :length="pages" :total-visible="7")
                //- Dialogs
                v-dialog.alert-dialog(v-model="dialog.alert" width= "600")
                    v-card 
                        v-card-title.title Batch select CDN provider 
                        v-card-text Please at least choose one domain or group to batch change CDN provider.
                        v-card-actions  
                            v-spacer
                            v-btn(color="primary" flat="flat" @click="closeAlertDialog") OK
                v-dialog.edit-dialog(v-model="dialog.edit" width="600")
                    v-card
                        v-card-title.title {{formTitle}}
                        v-card-text {{formText}}
                            v-form(ref="editForm")
                                v-select(:items="cdnProvider" label="CDN Provider" item-text="name" item-value="cdn_provider_id" @change="chooseCdnProvider(iRouteCDN.cdn.cdn_provider_id)" v-model="iRouteCDN.cdn.cdn_provider_id")

                        h7-data-table(:headers="headers" :items="selected" single-line v-if="editedIndex == -1")
                            template(slot="items" slot-scope="{props, index}")
                                tr
                                    td {{ index }}
                                    td(v-if="breadcrumbsItems[1].text === 'All'") {{props.item.name}}
                                    td {{props.item.continent.name}} / {{props.item.country.name}} / {{props.item.location}}
                                    td {{props.item.isp}}
                                    td {{props.item.cdn.cdn_provider.name}} 
                        v-card-actions  
                            v-spacer
                            v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                            v-btn(color="primary" flat="flat" @click="changeCdnProvider") Save
</template>
<script>
import _ from "lodash";
import { once } from "events";

export default {
    data() {
        return {
            currentPage: 1,
            page: [5, 10, 25, "All"],
            alert: false,
            selectCDN: "",
            selected: [],
            country: [],
            continent: [],
            isp: [],
            cdnProvider: [],
            cdnProviderItems: [],
            continentFilter: "All",
            countryFilter: "All",
            ispFilter: "All",
            cdnProviderFilter: "All",
            dialog: {
                edit: false,
                alert: false
            },
            iRouteCDN: {
                cdn: {
                    cdn_provider: {
                        name: ""
                    }
                }
            },
            headers: [],
            allHeaders: [
                {
                    text: "#",
                    align: "left",
                    sortable: true,
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
                    text: "Continent / Country / Region",
                    align: "left",
                    sortable: false,
                    value: ""
                },
                {
                    text: "ISP",
                    align: "left",
                    sortable: true,
                    value: "isp"
                },
                {
                    text: "CDN Provider",
                    align: "left",
                    sortable: false,
                    value: ""
                }
            ],
            groupsDomainsHeaders: [
                {
                    text: "#",
                    align: "left",
                    sortable: true,
                    width: "80px",
                    value: "index"
                },
                {
                    text: "Continent / Country / Region",
                    align: "left",
                    sortable: false,
                    value: ""
                },
                {
                    text: "ISP",
                    align: "left",
                    sortable: true,
                    value: "isp"
                },
                {
                    text: "CDN Provider",
                    align: "left",
                    sortable: false,
                    value: ""
                }
            ],
            data: {},
            filteredItems: [],
            filterData: [],
            searchText: "",
            breadcrumbsItems: [
                {
                    text: "iRouteCDN",
                    disabled: false,
                    exact: true,
                    to: "/admin/iroutecdn"
                },
                {
                    text: "",
                    disabled: true,
                    exact: true,
                    to: ""
                }
            ],
            groupInfo: {},
            domainInfo: {},
            infoData: {},
            editedIndex: -1,
            cdnProviderMapping: {},
            cdnProviderIdMapping: {},
            groupIRouteMapping: {},
            pagination: {
                rowsPerPage: 20
            },
            rowsPerPageItems: [
                { name: "20 per page", value: 20 },
                { name: "50 per pages", value: 50 }
            ],
            perPage: 25,
            pages: 0,
            domainId: "",
            rawData: {},
            domainList: [],
            groupCdnProvider: [],
            allListMapping: {},
            user_group_id: "",
            domainList: [],
            domainInGroupMsg: ""
        };
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1
                ? "Batch Change CDN Provider"
                : "Change CDN Provider";
        },
        formText() {
            return this.editedIndex === -1
                ? "Which CDN Provider you want to change for this " +
                      this.selected.length +
                      " iRouteCDN?"
                : "Please choose a CDN Provider you want to change for this iRouteCDN.";
        }
    },
    watch: {
        continentFilter: function() {
            this.filterAction();
            this.setPages();
        },
        countryFilter: function() {
            this.filterAction();
            this.setPages();
        },
        ispFilter: function() {
            this.filterAction();
            this.setPages();
        },
        cdnProviderFilter: function() {
            this.filterAction();
            this.setPages();
        },
        perPage: function(value) {
            this.pagination.rowsPerPage = this.perPage;
            if (value == "All") {
                this.pagination.rowsPerPage = this.filterData.length;
            } else {
                this.pagination.rowsPerPage = value;
            }
            this.setPages();
        },
        searchText: function(val) {
            this.alert = false;
            this.domainInGroupMsg = "";
            this.domainList.forEach((o, i) => {
                if (
                    o.domain_group.length !== 0 &&
                    o.name === val.toLowerCase()
                ) {
                    this.alert = true;
                    this.domainInGroupMsg = o.domain_group[0].name;
                    // console.log(this.domainInGroupMsg);
                } else if (o.name !== val.toLowerCase()) {
                    this.filterDataAction();
                }
            });
        },
        currentPage: function() {
            this.pagination.page = this.currentPage;
            // console.log(this.pagination.page, "dddd");
        }
    },
    methods: {
        filterAction() {
            if (this.continentFilter !== "All") {
                this.filteredItems = this.filterData.filter(i => {
                    return i.continent.name === this.continentFilter;
                });
            }
            if (this.countryFilter !== "All") {
                this.filteredItems = this.filterData.filter(i => {
                    return i.country.name === this.countryFilter;
                });
            }
            if (this.ispFilter !== "All") {
                this.filteredItems = this.filterData.filter(i => {
                    return i.isp === this.ispFilter;
                });
            }
            if (this.cdnProviderFilter !== "All") {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.cdn.cdn_provider.name === this.cdnProviderFilter
                        );
                    }
                });
            }
            if (
                this.continentFilter !== "All" &&
                this.countryFilter !== "All" &&
                this.ispFilter == "All" &&
                this.cdnProviderFilter == "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    return (
                        i.continent.name === this.continentFilter &&
                        i.country.name === this.countryFilter
                    );
                });
            }
            if (
                this.continentFilter !== "All" &&
                this.countryFilter == "All" &&
                this.ispFilter !== "All" &&
                this.cdnProviderFilter == "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    return (
                        i.continent.name === this.continentFilter &&
                        i.isp === this.ispFilter
                    );
                });
            }
            if (
                this.continentFilter !== "All" &&
                this.countryFilter == "All" &&
                this.ispFilter == "All" &&
                this.cdnProviderFilter !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.continent.name === this.continentFilter &&
                            i.cdn.cdn_provider.name === this.cdnProviderFilter
                        );
                    }
                });
            }
            if (
                this.continentFilter == "All" &&
                this.countryFilter !== "All" &&
                this.ispFilter !== "All" &&
                this.cdnProviderFilter == "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    return (
                        i.country.name === this.countryFilter &&
                        i.isp === this.ispFilter
                    );
                });
            }
            if (
                this.continentFilter == "All" &&
                this.countryFilter !== "All" &&
                this.ispFilter == "All" &&
                this.cdnProviderFilter !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.country.name === this.countryFilter &&
                            i.cdn.cdn_provider.name === this.cdnProviderFilter
                        );
                    }
                });
            }
            if (
                this.continentFilter !== "All" &&
                this.countryFilter !== "All" &&
                this.ispFilter !== "All" &&
                this.cdnProviderFilter == "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    return (
                        i.continent.name === this.continentFilter &&
                        i.country.name === this.countryFilter &&
                        i.isp === this.ispFilter
                    );
                });
            }
            if (
                this.continentFilter !== "All" &&
                this.countryFilter == "All" &&
                this.ispFilter !== "All" &&
                this.cdnProviderFilter !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.continent.name === this.continentFilter &&
                            i.isp === this.ispFilter &&
                            i.cdn.cdn_provider.name === this.cdnProviderFilter
                        );
                    }
                });
            }
            if (
                this.continentFilter == "All" &&
                this.countryFilter !== "All" &&
                this.ispFilter !== "All" &&
                this.cdnProviderFilter !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.country.name === this.countryFilter &&
                            i.isp === this.ispFilter &&
                            i.cdn.cdn_provider.name === this.cdnProviderFilter
                        );
                    }
                });
            }
            if (
                this.continentFilter !== "All" &&
                this.countryFilter !== "All" &&
                this.ispFilter == "All" &&
                this.cdnProviderFilter !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.continent.name === this.continentFilter &&
                            i.country.name === this.countryFilter &&
                            i.cdn.cdn_provider.name === this.cdnProviderFilter
                        );
                    }
                });
            }
            if (
                this.continentFilter !== "All" &&
                this.countryFilter !== "All" &&
                this.ispFilter !== "All" &&
                this.cdnProviderFilter !== "All"
            ) {
                this.filteredItems = this.filterData.filter(i => {
                    if (i.cdn.cdn_provider !== undefined) {
                        return (
                            i.continent.name === this.continentFilter &&
                            i.country.name === this.countryFilter &&
                            i.isp === this.ispFilter &&
                            i.cdn.cdn_provider.name === this.cdnProviderFilter
                        );
                    }
                });
            }
            if (
                this.continentFilter == "All" &&
                this.countryFilter == "All" &&
                this.ispFilter == "All" &&
                this.cdnProviderFilter == "All"
            ) {
                this.filteredItems = this.filterData;
            }
        },
        clearBtn() {
            this.countryFilter = "All";
            this.continentFilter = "All";
            this.ispFilter = "All";
            this.cdnProviderFilter = "All";
            this.filteredItems = this.filterData;
        },
        filterDataAction: function() {
            if (this.searchText != "") {
                this.filteredItems = this.filterData.filter(row => {
                    return (
                        !this.searchText ||
                        row.name
                            .toLowerCase()
                            .indexOf(this.searchText.toLowerCase()) > -1
                    );
                });
            } else {
                this.filteredItems = this.filterData;
            }
            this.setPages();
        },
        setPages: function() {
            if (this.perPage == null || this.filteredItems == null) {
                this.pages = null;
            } else {
                var length =
                    this.pagination.totalItems == 0
                        ? this.filteredItems.length
                        : this.pagination.totalItems;
                this.pages = Math.ceil(length / this.pagination.rowsPerPage);
            }
        },
        chooseCdnProvider(data) {
            // console.log(data);
            if (this.iRouteCDN.groupId !== undefined) {
                this.iRouteCDN.cdn.cdn_provider_id = data;
            } else {
                this.iRouteCDN.cdn.cdn_provider_id = data;
            }
            if (this.editedIndex == -1) {
                this.selected.forEach((o, i) => {
                    o.cdn.cdn_provider_id = data;
                    if (this.$route.query.id == undefined) {
                        if (this.groupId !== undefined) {
                            o.groupId = this.groupId;
                        } else {
                            o.domainId = this.domainId;
                        }
                    }
                });
            }
            // console.log(this.selected, "selected");
        },
        getDomainList() {
            this.$store
                .dispatch("domains/getAllDomains", this.user_group_id)
                .then(
                    function(result) {
                        this.domainList = result.data.domains;
                        // console.log(this.domainList);
                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        return Promise.reject(error);
                    }.bind(this)
                );
        },
        getDomainInfo() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getDomainById", this.domainId)
                .then(
                    function(result) {
                        this.infoData = result.data.domain;
                        this.mapping();
                        this.breadcrumbsItems[1].text = this.infoData.name;
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
        getDomainIRouteInfo() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("iRouteCdn/getDomainIRouteCDNs", this.domainId)
                .then(
                    function(result) {
                        this.filterData = result.data;
                        console.log(this.filterData);
                        this.filterData.forEach((o, i) => {
                            o.index = i + 1;
                        });
                        this.filteredItems = this.filterData;
                        this.isp.push(
                            ...new Set(this.filterData.map(x => x.isp))
                        );
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
        getGroupInfo() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("grouping/getGroupById", this.groupId)
                .then(
                    function(result) {
                        this.infoData = result.data;
                        this.breadcrumbsItems[1].text = this.infoData.name;
                        this.infoData.domains[0].cdn_provider.forEach(
                            (o, i) => {
                                this.cdnProvider.push(o.cdns);
                            }
                        );
                        // console.log(this.cdnProvider, "cdnProvider");
                        this.cdnProvider.forEach((o, i) => {
                            o.name = this.cdnProviderIdMapping[
                                o.cdn_provider_id
                            ];
                        });

                        this.cdnProviderItems = this.cdnProvider;
                        this.cdnProviderItems.unshift("All");

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
        getGroupIRouteInfo() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("grouping/getGroupIRouteCdn", this.groupId)
                .then(
                    function(result) {
                        this.filterData = result.data.location_network;
                        this.filterData.forEach((o, i) => {
                            o.index = i + 1;
                        });
                        this.filteredItems = this.filterData;
                        this.isp.push(
                            ...new Set(this.filterData.map(x => x.isp))
                        );
                        this.$store.dispatch("global/finishLoading");
                        this.setPages();
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
            // this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/getAllCdnProvider")
                .then(
                    function(result) {
                        var cdnProvider = result.data;
                        cdnProvider.forEach(
                            (item => {
                                this.cdnProviderMapping[item.name] = item.id;
                            }).bind(this)
                        );
                        cdnProvider.forEach(
                            (item => {
                                this.cdnProviderIdMapping[item.id] = item.name;
                            }).bind(this)
                        );
                        this.mapping();
                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        return Promise.reject(error);
                    }.bind(this)
                );
        },
        mapping() {
            if (this.breadcrumbsItems[1].text !== "All") {
                this.infoData.cdns.forEach((o, i) => {
                    o.name = this.cdnProviderIdMapping[o.cdn_provider_id];
                });
                this.cdnProvider = this.infoData.cdns;
            }

            this.cdnProviderItems = this.cdnProvider;
            this.cdnProviderItems.unshift("All");
        },
        getList() {
            // this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("iRouteCdn/getIRouteCdnList")
                .then(
                    function(result) {
                        var data = result.data;
                        // console.log(data,"getIRouteCdnList")
                        var allList = [];
                        data.domainGroup.forEach((o, i) => {
                            allList.push(o);
                        });
                        data.domains.forEach((o, i) => {
                            allList.push(o);
                        });
                        // console.log(allList);
                        var allListMapping = {};
                        allList.forEach((o, i) => {
                            allListMapping[o.name] = o.cdn_provider;
                        });
                        this.allListMapping = allListMapping;
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
        getAllIRouteCdnByDomain(filterData) {
            this.filterData = [];
            filterData.forEach((o, i) => {
                o.location_network.forEach((obj, idx) => {
                    this.filterData.push(obj);
                });
            });
            this.filterData.forEach((o, i) => {
                o.index = i + 1;
            });
            this.filteredItems = this.filterData;
            var info = [];
            info.current_page = 1;
            info.per_page = this.perPage;
            this.$store
                .dispatch("iRouteCdn/getAllIRouteCdnByDomain", info)
                .then(
                    function(result) {
                        // console.log(filterData, "filterdata");

                        var data = result.data;
                        if (data.domains !== undefined) {
                            data.domains.forEach((o, i) => {
                                o.location_network.forEach((obj, idx) => {
                                    obj.name = o.name;
                                    obj.domainId = o.id;
                                });
                                filterData.push(o);
                            });
                        }
                        this.pages = data.last_page;
                        if (data.last_page > 1) {
                            for (var i = 2; i < data.last_page + 1; i++) {
                                var dataInfo = [];
                                dataInfo.current_page = i;
                                dataInfo.per_page = this.perPage;
                                var domainData = [];

                                this.$store
                                    .dispatch(
                                        "iRouteCdn/getAllIRouteCdnByDomain",
                                        dataInfo
                                    )
                                    .then(
                                        function(result) {
                                            domainData = result.data;
                                            if (
                                                domainData.domains !== undefined
                                            ) {
                                                domainData.domains.forEach(
                                                    (o, i) => {
                                                        o.location_network.forEach(
                                                            (obj, idx) => {
                                                                obj.name =
                                                                    o.name;
                                                                obj.domainId =
                                                                    o.id;
                                                            }
                                                        );
                                                        filterData.push(o);
                                                    }
                                                );
                                                this.filterData = [];
                                                filterData.forEach((o, i) => {
                                                    o.location_network.forEach(
                                                        (obj, idx) => {
                                                            this.filterData.push(
                                                                obj
                                                            );
                                                        }
                                                    );
                                                });
                                                this.filterData.forEach(
                                                    (o, i) => {
                                                        o.index = i + 1;
                                                    }
                                                );
                                                this.filteredItems = this.filterData;
                                                // console.log(this.filteredItems);

                                                this.filterData.forEach(
                                                    (o, i) => {
                                                        o.cdn_provider = [];
                                                        this.allListMapping[
                                                            o.name
                                                        ].forEach(
                                                            (obj, idx) => {
                                                                o.cdn_provider.push(
                                                                    obj.cdns
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                                this.filterData.forEach(
                                                    (o, i) => {
                                                        o.cdn_provider.forEach(
                                                            (obj, idx) => {
                                                                obj.name = "";
                                                                obj.name = this.cdnProviderIdMapping[
                                                                    o.cdn_provider[
                                                                        idx
                                                                    ].cdn_provider_id
                                                                ];
                                                            }
                                                        );
                                                    }
                                                );
                                            }

                                            this.pages = Math.ceil(
                                                this.filteredItems.length /
                                                    this.pagination.rowsPerPage
                                            );
                                        }.bind(this)
                                    )
                                    .catch(
                                        function(error) {
                                            return Promise.reject(error);
                                        }.bind(this)
                                    );
                            }
                        } else {
                            if (data.domains !== undefined) {
                                data.domains.forEach((o, i) => {
                                    o.location_network.forEach((obj, idx) => {
                                        obj.name = o.name;
                                        obj.domainId = o.id;
                                    });
                                    filterData.push(o);
                                });
                                this.filterData = [];
                                filterData.forEach((o, i) => {
                                    o.location_network.forEach((obj, idx) => {
                                        this.filterData.push(obj);
                                    });
                                });
                                this.filterData.forEach((o, i) => {
                                    o.index = i + 1;
                                });
                                this.filteredItems = this.filterData;
                                this.filterData.forEach((o, i) => {
                                    o.cdn_provider = [];
                                    this.allListMapping[o.name].forEach(
                                        (obj, idx) => {
                                            o.cdn_provider.push(obj.cdns);
                                        }
                                    );
                                });
                                this.filterData.forEach((o, i) => {
                                    o.cdn_provider.forEach((obj, idx) => {
                                        obj.name = "";
                                        obj.name = this.cdnProviderIdMapping[
                                            o.cdn_provider[idx].cdn_provider_id
                                        ];
                                    });
                                });
                                this.pages = Math.ceil(
                                    this.filteredItems.length /
                                        this.pagination.rowsPerPage
                                );
                            }
                        }

                        // this.filteredItems = this.filterData;

                        this.getAllIRouteIsp();
                        this.getAllIRouteCdnProvider();
                        this.filteredItems = this.filterData;
                        this.pages = Math.ceil(
                            this.filteredItems.length /
                                this.pagination.rowsPerPage
                        );
                        this.$store.dispatch("global/finishLoading");
                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        return Promise.reject(error);
                    }.bind(this)
                );
        },
        getAllIRouteCdnByGroup() {
            var info = [];
            info.current_page = 1;
            info.per_page = this.perPage;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("iRouteCdn/getAllIRouteCdnByGroup", info)
                .then(
                    function(result) {
                        var data = result.data;
                        this.pages = data.last_page;
                        var filterData = [];
                        if (data.domain_groups !== undefined) {
                            data.domain_groups.forEach((o, i) => {
                                o.location_network.forEach((obj, idx) => {
                                    obj.name = o.name;
                                    obj.groupId = o.id;
                                });
                                filterData.push(o);
                            });
                        }
                        if (data.last_page > 1) {
                            for (var i = 2; i < data.last_page + 1; i++) {
                                var dataInfo = [];
                                dataInfo.current_page = i;
                                dataInfo.per_page = this.perPage;
                                this.$store
                                    .dispatch(
                                        "iRouteCdn/getAllIRouteCdnByGroup",
                                        dataInfo
                                    )
                                    .then(function(result) {
                                        // console.log(result.data, "dataInfo");
                                        if (
                                            result.data.domain_groups !==
                                            undefined
                                        ) {
                                            result.data.domain_groups.forEach(
                                                (o, i) => {
                                                    o.location_network.forEach(
                                                        (obj, idx) => {
                                                            obj.name = o.name;
                                                            obj.groupId = o.id;
                                                        }
                                                    );
                                                    filterData.push(o);
                                                }
                                            );
                                        }
                                    });
                            }
                        }
                        this.getAllIRouteCdnByDomain(filterData);

                        // this.$store.dispatch("global/finishLoading");
                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        return Promise.reject(error);
                    }.bind(this)
                );
        },
        getAllIRouteInfo() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("iRouteCdn/getAllIRouteCdn")
                .then(
                    function(result) {
                        var data = result.data;
                        var filterData = [];
                        if (data.domainGroup !== undefined) {
                            data.domainGroup.forEach((o, i) => {
                                o.location_network.forEach((obj, idx) => {
                                    obj.name = o.name;
                                    obj.groupId = o.id;
                                });
                                filterData.push(o);
                            });
                        }
                        if (data.domains !== undefined) {
                            data.domains.forEach((o, i) => {
                                o.location_network.forEach((obj, idx) => {
                                    obj.name = o.name;
                                    obj.domainId = o.id;
                                });
                                filterData.push(o);
                            });
                        }
                        filterData.forEach((o, i) => {
                            o.location_network.forEach((obj, idx) => {
                                this.filterData.push(obj);
                            });
                        });
                        this.filterData.forEach((o, i) => {
                            o.cdn_provider = [];
                            this.allListMapping[o.name].forEach((obj, idx) => {
                                o.cdn_provider.push(obj.cdns);
                            });
                        });
                        this.filterData.forEach((o, i) => {
                            o.cdn_provider.forEach((obj, idx) => {
                                obj.name = "";
                                obj.name = this.cdnProviderIdMapping[
                                    o.cdn_provider[idx].cdn_provider_id
                                ];
                            });
                        });
                        this.filterData.forEach((o, i) => {
                            o.index = i + 1;
                        });
                        this.getAllIRouteIsp();
                        this.getAllIRouteCdnProvider();
                        this.filteredItems = this.filterData;
                        // console.log(this.filteredItems, "all");
                        this.setPages();
                        this.$store.dispatch("global/finishLoading");
                        return Promise.resolve();
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        return Promise.reject(error);
                    }.bind(this)
                );
        },
        getAllIRouteIsp() {
            var isp = [];
            this.filterData.forEach((o, i) => {
                isp.push(o.isp);
            });
            var result = new Set();
            var repeat = new Set();
            isp.forEach(item => {
                result.has(item) ? repeat.add(item) : result.add(item);
            });
            this.isp = [...repeat];
        },
        getAllIRouteCdnProvider() {
            var cdnProvider = [];

            this.filterData.forEach((o, i) => {
                if (o.cdn.cdn_provider !== undefined) {
                    cdnProvider.push(o.cdn.cdn_provider.name);
                }
            });
            var result = new Set();
            var repeat = new Set();
            cdnProvider.forEach(item => {
                result.has(item) ? repeat.add(item) : result.add(item);
            });
            var cdnProviderItem = [...repeat];
            this.cdnProviderItems[0] = "All";
            cdnProviderItem.forEach((o, i) => {
                this.cdnProviderItems.push(o);
            });
        },
        getContinentList() {
            // this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("locationInfo/getContinentList")
                .then(
                    function(result) {
                        this.continent[0] = "All";
                        var continentData = result.data;
                        continentData.forEach((o, i) => {
                            this.continent.push(o.name);
                        });
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
        getCountriesList() {
            // this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("locationInfo/getCountriesList")
                .then(
                    function(result) {
                        this.country[0] = "All";
                        var countriesData = result.data;
                        countriesData.forEach((o, i) => {
                            this.country.push(o.name);
                        });
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
        editItem(item) {
            this.iRouteCDN = Object.assign({}, item);

            if (this.$route.query.id !== undefined) {
                this.cdnProvider = item.cdn_provider;
            } else {
                this.cdnProvider = this.cdnProviderItems.slice(1);
                if (this.groupId !== undefined) {
                    this.iRouteCDN.groupId = this.groupId;
                } else {
                    this.iRouteCDN.domainId = this.domainId;
                }
            }
            this.editedIndex = this.filteredItems.indexOf(item);
            this.dialog.edit = true;
        },
        batchOverride(type) {
            if (this.selected.length == 0) {
                this.dialog.alert = true;
            } else {
                this.editedIndex = type;
                this.dialog.edit = true;
                if (this.$route.query.id !== undefined) {
                    // console.log(this.selected, "allBatch");
                    var arr1 = this.selected[0].cdn_provider;
                    for (var i = 1; i < this.selected.length; i++) {
                        arr1 = this.compare(
                            arr1,
                            this.selected[i].cdn_provider
                        );
                    }
                    this.cdnProvider = arr1;
                } else {
                    this.cdnProvider = this.cdnProviderItems.slice(1);
                }
            }
        },
        compare(arr1, arr2) {
            var arr3 = [];
            arr2.forEach((o, i) => {
                var index = _.findIndex(arr1, function(obj) {
                    return obj.name == o.name;
                });
                // console.log(index);

                if (index !== -1) {
                    arr3.push(arr1[index]);
                }
            });
            return arr3;
        },
        updateGroupIRouteCDN() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("iRouteCdn/updateGroupIRouteCDN", this.iRouteCDN)
                .then(
                    function(result) {
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change CDN provider success!"
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
            if (this.$route.query.id !== undefined) {
                this.filterData = [];
                this.getAllIRouteCdnByGroup();
                this.getList();
            } else {
                this.getGroupIRouteInfo();
            }
        },
        updateDomainIRouteCDN() {
            // console.log(this.iRouteCDN);
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("iRouteCdn/updateDomainIRouteCDN", this.iRouteCDN)
                .then(
                    function(result) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Change CDN provider success!"
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
            if (this.$route.query.id !== undefined) {
                this.filterData = [];
                this.getAllIRouteCdnByGroup();
                this.getList();
            } else {
                this.getDomainIRouteInfo();
            }
        },
        changeCdnProvider() {
            if (this.editedIndex == -1) {
                this.batchChangeCdnProvider();
            } else {
                if (this.iRouteCDN.groupId !== undefined) {
                    // updateGroupIRouteCDN
                    this.updateGroupIRouteCDN();
                    this.closeEditDialog();
                } else {
                    // updateDomainIRouteCDN
                    this.updateDomainIRouteCDN();
                    this.closeEditDialog();
                }
            }
        },
        batchChangeCdnProvider() {
            this.selected.forEach((o, i) => {
                if (o.groupId !== undefined) {
                    this.$store.dispatch("global/startLoading");
                    this.$store
                        .dispatch("iRouteCdn/updateGroupIRouteCDN", o)
                        .then(
                            function(result) {
                                // if (this.$route.query.id !== undefined) {
                                //     this.filterData = [];
                                //     this.getAllIRouteCdnByGroup();
                                //     this.getList();
                                // } else {
                                //     this.getGroupIRouteInfo();
                                // }
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
                } else {
                    this.$store.dispatch("global/startLoading");
                    this.$store
                        .dispatch("iRouteCdn/updateDomainIRouteCDN", o)
                        .then(
                            function(result) {
                                // if (this.$route.query.id !== undefined) {
                                //     this.filterData = [];
                                //     this.getAllIRouteCdnByGroup();
                                //     this.getList();
                                // } else {
                                //     this.getDomainIRouteInfo();
                                // }
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
                }
            });
            if (this.$route.query.id !== undefined) {
                // this.filterData = [];
                this.getAllIRouteCdnByGroup();
                this.getList();
                this.currentPage = 1;
                this.pagination.page = this.currentPage;
            } else if (this.$route.query.group_id !== undefined) {
                this.getGroupIRouteInfo();
            } else {
                this.getDomainIRouteInfo();
            }

            this.selected = [];
            this.closeEditDialog();
        },
        closeEditDialog() {
            this.dialog.edit = false;
        },
        closeAlertDialog() {
            this.dialog.alert = false;
        }
    },
    created() {
        this.user_group_id = this.$store.getters["account/accountGroupId"]();
        this.pagination.rowsPerPage = this.perPage;
        this.pagination.page = this.currentPage;
        this.getAllCdnProvider();
        if (this.$route.query.group_id !== undefined) {
            this.headers = this.groupsDomainsHeaders;
            this.groupId = this.$route.query.group_id;
            this.getGroupInfo();
            this.getGroupIRouteInfo();
        } else if (this.$route.query.id !== undefined) {
            this.headers = this.allHeaders;
            this.infoData.name = "All";
            this.breadcrumbsItems[1].text = "All";
            this.getAllIRouteCdnByGroup();
            this.getList();
        } else {
            this.headers = this.groupsDomainsHeaders;
            this.domainId = this.$route.query.domain_id;
            this.getDomainIRouteInfo();
            this.getDomainInfo();
        }
        this.getContinentList();
        this.getCountriesList();
        this.getDomainList();
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
