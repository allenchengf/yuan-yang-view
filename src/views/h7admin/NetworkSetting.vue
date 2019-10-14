<template lang="pug">
    v-container#networks.grid-list-lg
        v-layout(wrap column)
            v-flex(xs12)
                .title Networks
            //- v-flex(xs12)
            //-     v-tabs(v-model="currentTab" slider-color="primary" left)
            //-         v-tab( v-for="tab in tabs" :key="tab.id" ) {{tab.name}}
            v-flex(xs12)
                v-card
                    v-card-title
                        .subheading Networks
                        v-spacer
                        v-btn.my-0(color="primary" @click="addItem") Add
                    v-divider                    
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    h7-data-table(:headers="headers" :items="items" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" )
                        template(slot="items" slot-scope="{props, index}")
                            tr
                                td.text-xs-left {{ index}}
                                td.text-xs-left {{ props.item.name }}
                                td.text-xs-left {{ props.item.location_text }}
                                td.text-xs-left {{ props.item.crawler_mapping_value }}
                                td
                                    v-switch(color="primary" v-model="props.item.status" @change="changeStatus(props.item)" hide-details)
                                td.text-xs-left
                                    v-btn.ma-0(flat icon small color="primary" @click="editItem(props.item)" title="edit")
                                        v-icon(small) edit
                                    v-btn.ma-0(v-if="props.item.location_network != null" flat icon small color="primary" @click="deleteItem(props.item)" title="delete")
                                        v-icon(small) delete

        //- Dialogs
        v-dialog.edit-dialog(v-model="dialog.alert" max-width="460" persistent)
            v-card
                v-card-title.title Cant't Change Region Status
                v-card-text You can't change this network's status because you should setting it's region first.
                v-card-actions  
                    v-spacer
                    v-btn(color="primary" flat="flat" @click="closeAlert") OK
        v-dialog.edit-dialog(v-model="dialog.add" max-width="460" persistent)
            v-card
                v-card-title.title Add Network
                v-card-text
                    v-form(ref="addForm")
                        v-text-field(v-model="editedLoaction.name" label="Name" type="text" name="name" :rules="[rules.required]")
                        v-select(v-model="editedLoaction.continent_id" label="Continent" :items="continents" item-text="name" item-value="id" :rules="[rules.required]")
                        v-select(v-model="editedLoaction.country_id" label="Country" :items="countries" item-text="name" item-value="id" :rules="[rules.required]")
                        v-text-field(v-model="editedLoaction.location" label="Region" type="text" name="region" :rules="[rules.required]")
                        v-text-field(v-model="editedLoaction.isp" label="ISP" type="text" name="isp" :rules="[rules.required]")
                        v-text-field(v-model="editedLoaction.mapping_value" label="Mapping Value" type="text" name="mapping_value" )
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="dialog.add = false") Cancel
                    v-btn(color="primary" flat="flat" @click="newNetwork") Save
        v-dialog.edit-dialog(v-model="dialog.edit" max-width="460" persistent)
            v-card
                v-card-title.title Edit Network: {{ editedNetwork.name }}
                v-card-text
                    v-form(ref="editForm")
                        v-select(v-model="editedLoaction.continent_id" label="Continent" :items="continents" item-text="name" item-value="id" :rules="[rules.required]")
                        v-select(v-model="editedLoaction.country_id" label="Country" :items="countries" item-text="name" item-value="id" :rules="[rules.required]")
                        v-text-field(v-model="editedLoaction.location" label="Region" type="text" name="region" :rules="[rules.required]")
                        v-text-field(v-model="editedLoaction.isp" label="ISP" type="text" name="isp" :rules="[rules.required]")
                        v-text-field(v-model="editedLoaction.mapping_value" label="Mapping Value" type="text" name="mapping_value" )
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="dialog.edit = false") Cancel
                    v-btn(color="primary" flat="flat" @click="updateLine") Save

        v-dialog.delete-dialog(v-model="dialog.delete" max-width="460")
            v-card
                v-card-title.title Delete Location
                v-card-text.text-xs-left Are you sure you want to delete this location mapping of {{editedNetwork.name}} ?
                v-card-actions  
                    v-spacer
                    v-btn(color="red" flat="flat" @click="deleteLine") Delete
                    v-btn(color="grey" flat="flat" @click="dialog.delete=false") Cancel
</template>


<script>
import textFieldRules from "../../utils/textFieldRules.js";

export default {
    mixins: [textFieldRules],
    data() {
        return {
            perPage: 25,
            lineInfo: {},
            tabs: [],
            currentTab: null,
            loading: false,
            searchText: "",
            headers: [
                {
                    key: "id",
                    text: "#",
                    align: "left",
                    sortable: true,
                    width: "40px",
                    auth: 0,
                    control: true,
                    searchable: false,
                    value: "id"
                },
                {
                    key: "network",
                    text: "Network Name",
                    align: "left",
                    sortable: true,
                    auth: 0,
                    control: true,
                    searchable: true,
                    value: "name"
                },
                {
                    key: "location",
                    text: "Continent / Country / Region / ISP",
                    align: "left",
                    sortable: true,
                    auth: 0,
                    control: true,
                    searchable: true,
                    value: "location_text"
                },
                {
                    key: "crawler",
                    text: "Crawler Mapping",
                    align: "left",
                    sortable: true,
                    auth: 0,
                    control: true,
                    searchable: true,
                    value: "crawler_mapping_value"
                },
                {
                    key: "usable",
                    text: "Usable",
                    align: "left",
                    sortable: true,
                    auth: 0,
                    control: true,
                    searchable: false,
                    value: "status"
                },
                {
                    key: "action",
                    text: "Action",
                    align: "left",
                    value: "",
                    width: "120px",
                    auth: 0,
                    control: false,
                    searchable: false,
                    sortable: true
                }
            ],
            items: [],
            editedNetwork: {},
            editedLoaction: {},
            editedIndex: -1,
            continents: [],
            countries: [],
            dialog: {
                alert: false,
                add: false,
                edit: false,
                delete: false
            }
        };
    },
    watch: {
        perPage: function() {
            console.log(this.perPage);
        }
    },
    methods: {
        parentMethod(data) {
            // console.log("ccc");
            // console.log(data);
            if (data > 25) {
                this.perPage = "All";
            } else {
                this.perPage = data;
            }
            console.log(this.perPage);
        },
        getNetworks: function() {
            // var id = this.tabs[this.currentTab].id;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("networks/getAllNetworks")
                .then(
                    function(result) {
                        // console.log(result.data);
                        result.data.forEach(item => {
                            item.location_text =
                                item.location_network != null
                                    ? item.location_network.continent.name +
                                      " / " +
                                      item.location_network.country.name +
                                      " / " +
                                      item.location_network.location +
                                      " / " +
                                      item.location_network.isp
                                    : "Not Set";
                            item.crawler_mapping_value =
                                item.location_network != null
                                    ? item.location_network.mapping_value
                                    : "";
                            if (item.location_network != null) {
                                item.status = item.location_network.status;
                            } else {
                                item.status = false;
                            }
                        });
                        this.items = result.data;
                        // console.log(this.items);
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
            // this.$store
            //     .dispatch("networks/getNetworks", id)
            //     .then(
            //         function(result) {
            //             // console.log(result.data);
            //             result.data.forEach(item => {
            //                 item.location_text =
            //                     item.location_network != null
            //                         ? item.location_network.continent_name +
            //                           " / " +
            //                           item.location_network.country_name +
            //                           " / " +
            //                           item.location_network.location +
            //                           " / " +
            //                           item.location_network.isp
            //                         : "Not Set";
            //                 item.crawler_mapping_value =
            //                     item.location_network != null
            //                         ? item.location_network.mapping_value
            //                         : "";
            //             });
            //             this.items = result.data;
            //             // console.log(this.items);
            //             this.$store.dispatch("global/finishLoading");
            //         }.bind(this)
            //     )
            //     .catch(
            //         function(error) {
            //             this.$store.dispatch("global/finishLoading");
            //             this.$store.dispatch(
            //                 "global/showSnackbarError",
            //                 error.message
            //             );
            //         }.bind(this)
            //     );
        },
        getSchemes: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("networks/getSchemes")
                .then(
                    function(result) {
                        this.tabs = result.data;
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
        getCountries: function() {
            this.$store
                .dispatch("networks/getCountries")
                .then(
                    function(result) {
                        this.countries = result.data;
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                    }.bind(this)
                );
        },

        getContinents: function() {
            this.$store
                .dispatch("networks/getContinents")
                .then(
                    function(result) {
                        this.continents = result.data;
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                    }.bind(this)
                );
        },
        changeStatus(item) {
            this.lineInfo = Object.assign({}, item);
            // console.log(item);
            if (item.location_network == null) {
                this.dialog.alert = true;
            } else {
                // console.log(item, "changeStatus");
                this.$store
                    .dispatch("networks/changeLineStatus", item)
                    .then(
                        function(result) {
                            this.getNetworks();
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Change network status success!"
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
            }
        },
        closeAlert() {
            this.dialog.alert = false;
            this.items.forEach((o, i) => {
                if (o.id == this.lineInfo.id) {
                    o.status = false;
                }
            });
        },
        addItem() {
            this.dialog.add = true;
            this.$refs.editForm.reset();
            this.$refs.addForm.reset();
        },
        newNetwork() {
            if (this.$refs.addForm.validate()) {
                // console.log(this.editedLoaction);
                this.$store
                    .dispatch("networks/newNetwork", this.editedLoaction)
                    .then(
                        function(result) {
                            // this.getNetworks();
                            this.editedIndex = -1;
                            this.editedLoaction.network_id = result.data.id;
                            this.updateLine();
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
        },
        editItem: function(item) {
            // this.$refs.editForm.reset();
            this.editedNetwork = Object.assign({}, item);
            this.editedLoaction = {
                continent_id: 0,
                country_id: 0,
                location: "",
                isp: "",
                network_id: this.editedNetwork.id
            };

            if (item.location_network != null) {
                // console.log(item, item.location_network);
                this.editedIndex = item.location_network.id;
                this.editedLoaction = this.editedNetwork.location_network;
            } else {
                this.$refs.editForm.reset();
                this.editedIndex = -1;
            }
            this.dialog.edit = true;
        },
        deleteItem: function(item) {
            this.editedNetwork = Object.assign({}, item);
            this.editedIndex = item.location_network.id;
            this.editedLoaction = this.editedNetwork.location_network;
            this.dialog.delete = true;
        },

        updateLine: function() {
            this.$store.dispatch("global/startLoading");
            if (this.editedIndex == -1) {
                // console.log(this.editedLoaction, "this.editedIndex == -1");
                this.$store
                    .dispatch("networks/newLine", this.editedLoaction)
                    .then(
                        function(result) {
                            this.getNetworks();
                            this.$refs.addForm.reset();
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
                this.$store
                    .dispatch("networks/updateLine", this.editedLoaction)
                    .then(
                        function(result) {
                            this.getNetworks();
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
            this.dialog.edit = false;
            this.dialog.add = false;
        },
        deleteLine: function() {
            this.$store
                .dispatch("networks/deleteLine", this.editedLoaction)
                .then(
                    function(result) {
                        this.getNetworks();
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
            this.dialog.delete = false;
        }
    },
    watch: {
        currentTab: function(value) {
            this.getNetworks();
        }
    },
    created() {
        this.getNetworks();
        this.getSchemes();
        this.getCountries();
        this.getContinents();
    }
};
</script>

<style lang="scss" scoped>
td {
    text-transform: capitalize;
}
</style>
