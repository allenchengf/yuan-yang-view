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
                    v-btn(color="primary" dark @click="batchChangeCDN(-1)") Batch Override
            v-data-table.elevation-1(:headers="headers" :items="filteredItems" :loading="$store.state.global.isLoading" :pagination.sync="pagination" v-model="selected" hide-actions select-all :custom-filter="customFilter")
                v-progress-linear(v-slot:progress color="primary")
                template(slot="items" slot-scope="props")
                    tr
                        td.text-xs-left
                            v-checkbox(v-model="props.selected" primary hide-details)
                        td.text-xs-left {{props.index +1}}
                        td.text-xs-left.location {{props.item.continent.name}} / {{props.item.country.name}} / {{props.item.location}}
                        td.text-xs-left {{props.item.isp}}
                        td.text-xs-left
                            v-select(:items="cdnProvider" v-model="props.item.cdn.name" @change="editItem(props.item, 0,props.item.cdn.name)")                     
            v-layout.px-2(row align-center)
                v-flex.text-xs-left.py-3(xs4)
                v-flex.text-xs-right.py-3(xs8)
                    v-pagination(v-model="pagination.page" :length="pages" :total-visible="7" color="primary")
        //- Dialogs
        v-dialog.edit-dialog(v-model="dialog.edit" width="600")
            v-card
                v-card-title.title {{formTitle}}
                v-data-table.elevation-1(:headers="headers" :items="selected" hide-actions v-if="editedIndex == -1")
                    v-progress-linear(v-slot:progress color="primary")
                    template(slot="items" slot-scope="props")
                        tr
                            td.text-xs-left {{props.index +1}}
                            td.text-xs-left.location {{props.item.continent.name}} / {{props.item.country.name}} / {{props.item.location}}
                            td.text-xs-left {{props.item.isp}}
                            td.text-xs-left {{props.item.cdn.name}} 
                v-card-text {{formText}}
                tr(v-if="editedIndex == -1")
                    td.text-xs-left
                        v-select(:items="cdnProvider" v-on:change="editBatchCdn(`${selectCDN}`)" v-model="selectCDN") 
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="closeEditDialog") Cancel
                    v-btn(color="primary" flat="flat" @click="updateCdnProvider") Save
</template>
<script>
export default {
    props: ["domain_id", "select"],
    data() {
        return {
            selectCDN: "",
            dialog: {
                edit: false
            },
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
                    text: "Continent / Country / Region",
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
            ],
            cdnData: []
        };
    },
    computed: {
        filteredItems() {
            return this.filterData.filter(i => {
                return (
                    (!this.continentFilter ||
                        i.continent.name === this.continentFilter) &&
                    (!this.networkFilter ||
                        i.network.name === this.networkFilter) &&
                    (!this.countryFilter ||
                        i.country.name === this.countryFilter) &&
                    (!this.cdnProviderFilter ||
                        i.cdn_name === this.cdnProviderFilter)
                );
            });
        },
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
                : "Are you sure you want to change CDN provider to '" +
                      this.iRouteCDN.cdn_name +
                      "' ?";
        }
    },
    methods: {
        getAllCDNs: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getAllCDNs", this.domain_id)
                .then(
                    function(result) {
                        this.cdnData = result.data;
                        this.cdnProvider[0] = "All";
                        this.cdnProvider.push(
                            ...new Set(this.cdnData.map(x => x.name))
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
        getAlliRouteCDNs() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("domains/getAlliRouteCDNs", this.domain_id)
                .then(
                    function(result) {
                        this.filterData = result.data;
                        // console.log(this.filterData);
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
            this.country[0] = "All";
            this.continent[0] = "All";
            this.network[0] = "All";
            this.country.push(
                ...new Set(this.filterData.map(x => x.country.name))
            );
            this.continent.push(
                ...new Set(this.filterData.map(x => x.continent.name))
            );
            this.network.push(...new Set(this.filterData.map(x => x.isp)));
        },
        editItem: function(item, type, cdn_name) {
            this.editedIndex = this.filterData.indexOf(item);
            console.log(this.editedIndex);
            this.iRouteCDN = Object.assign({}, item);
            this.iRouteCDN.domain_id = this.domain_id;
            this.cdnData.forEach((o, i) => {
                if (o.name == cdn_name) {
                    this.iRouteCDN.cdn_id = o.id;
                    this.iRouteCDN.cdn_name = cdn_name;
                }
            });
            if (type == 0) {
                this.dialog.edit = true;
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
        },
        batchChangeCDN(type) {
            this.editedIndex = type;
            this.dialog.edit = true;
        },
        closeEditDialog() {
            this.dialog.edit = false;
            this.selected = [];
            console.log(this.filterData);
            this.getAlliRouteCDNs();
        },
        editBatchCdn(a) {
            this.cdnData.forEach((o, i) => {
                if (o.name == a) {
                    this.selected.forEach((obj, idx) => {
                        obj.cdn_id = o.id;
                        obj.domain_id = this.domain_id;
                    });
                }
            });
        },
        updateCdnProvider() {
            if (this.editedIndex !== -1) {
                this.updateiRouteCDN();
            } else {
                this.selected.forEach((o, i) => {
                    this.$store.dispatch("global/startLoading");
                    this.$store
                        .dispatch("domains/updateiRouteCDN", o)
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
                });
            }
            this.closeEditDialog();
            this.selected = [];
            this.selectCDN = "";
        }
    },
    watch: {
        perPage: function(value) {
            this.pagination.rowsPerPage = value;
            this.setPages();
        },
        select: function() {
            this.getAllCDNs();
            this.getAlliRouteCDNs();
            this.continentFilter = "";
            this.countryFilter = "";
            this.networkFilter = "";
            this.cdnProviderFilter = "";
        },
        domain_id: function() {
            console.log(this.domain_id);
        }
    },
    mounted() {
        this.getAllCDNs();
        this.getAlliRouteCDNs();
        console.log(this.select);
    }
};
</script>

<style lang="sass" scoped>
.v-select
    padding: 10px
td.location
  text-transform: capitalize
.v-dialog .v-card
        padding: 10px
</style>

