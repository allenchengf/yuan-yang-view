<template lang="pug">
    #datatable
        v-data-table.elevation-1(:headers="headers" :items="items" :loading="loading" :search="searchText" :pagination.sync="pagination" hide-actions)
            template(slot="items" slot-scope="props")
                slot(name="items" :props="props" :index="rowIndex(props.index)")

        v-flex.px-2(v-if="showPerPageRow")      
            v-layout.px-2(row align-center)
                v-flex.text-xs-left
                    v-layout(row align-center)
                        small Rows per page:
                        v-select.px-3.py-3(:items="page" v-model="rowsPerPage" hide-details)
                //- v-flex.text-xs-left.py-3(xs4)
                //-     slot(name="actions-left")
                v-flex.text-xs-right.py-3
                    v-pagination(v-model="pagination.page" :length="pages" :total-visible="7")
</template>

<script>
export default {
    props: {
        headers: {
            type: Array
        },
        items: {
            type: Array
        },
        loading: {
            type: Boolean,
            default: false
        },
        searchText: {
            type: String,
            default: ""
        },
        perPage: {
            type: Number | String,
            default: 20
        },
        sortBy: {
            type: String
        },
        showPerPageRow: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            rowsPerPage: 0,
            page: [5, 10, 25, "All"],
            pagination: {
                rowsPerPage: this.perPage,
                sortBy: "time", // The field that you're sorting by
                descending: true
            },
            pages: 0
        };
    },
    methods: {
        rowIndex: function(propsIdx) {
            return (
                (this.pagination.page - 1) * this.pagination.rowsPerPage +
                propsIdx +
                1
            );
        },
        setPages: function() {
            if (
                this.rowsPerPage == null ||
                this.pagination.totalItems == null
            ) {
                this.pages = null;
            } else {
                var length =
                    this.pagination.totalItems == 0
                        ? this.items.length
                        : this.pagination.totalItems;
                this.pages = Math.ceil(length / this.pagination.rowsPerPage);
            }
        }
    },
    watch: {
        pagination: function(value) {
            // console.log(value, "watchPagination");
            this.setPages();
        },
        rowsPerPage: function(value) {
            this.pagination.page = 1;

            if (this.items.length !== 0) {
                if (value == "All") {
                    this.rowsPerPage = value;
                    this.pagination.page = 1;
                    this.pagination.rowsPerPage = this.items.length;
                } else {
                    this.pagination.rowsPerPage = value;
                }
                this.setPages();
            } else {
                this.pages = 1;
                this.pagination.page = 1;
            }
            // console.log(this.rowsPerPage);
            // this.$emit("childMethod", this.rowsPerPage);
        },
        items: function(value) {
            this.setPages();
        }
    },
    mounted() {
        this.setPages();
        this.rowsPerPage = this.perPage;
    }
};
</script>

