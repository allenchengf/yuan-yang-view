<template lang="pug">
    v-container#logs
        v-layout(wrap column)
            v-flex(xs12)
                .title.text-xs-left.mb-4 Operation Logs
            v-flex(xs12)
                v-card
                    v-card-title
                        v-btn-toggle(v-model="category" v-for="item in categoryList")
                            v-btn(flat :value='item') {{item}}
                    v-divider
                    v-card-text
                        v-layout(wrap)
                            v-flex(xs12 sm6 md4)
                                v-text-field(v-model="searchText" append-icon="search" label="Search" single-line hide-details)
                    h7-data-table(:headers="headers" :items="filterData" :loading="$store.state.global.isLoading" :search-text="searchText" :per-page="10" single-line must-sort) 
                        template(slot="items" slot-scope="{props, index}")
                            td.text-xs-left {{props.item.time}}
                            td.text-xs-left 
                                v-chip {{props.item.category}}
                            td.text-xs-left {{props.item.message}}
</template>
<script>
export default {
    data() {
        return {
            searchText: "",
            category: "all",
            categoryList: ["all", "user", "domain", "cdn", "iroutecdn"],
            filterData: [],
            rawData: [],
            headers: [
                {
                    text: "Time",
                    align: "left",
                    sortable: true,
                    value: "time"
                },
                {
                    text: "Category",
                    align: "left",
                    sortable: true,
                    value: "category"
                },
                {
                    text: "Message",
                    align: "left",
                    sortable: true,
                    value: "message"
                }
            ]
        };
    },
    methods: {
        getLogsData() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("logs/getLogsData")
                .then(
                    function(result) {
                        this.rawData = result.data;
                        this.filterData = this.rawData;
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

        filterDataAction: function() {
            if (this.category != "all")
                this.filterData = this.rawData.filter(data => {
                    return data.category.toLowerCase().includes(this.category);
                });
            else this.filterData = this.rawData;
        }
    },
    watch: {
        category: function(value) {
            this.filterDataAction();
        }
    },
    created() {
        this.getLogsData();
    }
};
</script>