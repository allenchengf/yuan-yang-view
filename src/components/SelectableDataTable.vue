<template lang="pug">
    #datatable
        v-data-table.elevation-1(:headers="headers" :items="items" :loading="loading" :search="searchText" :pagination.sync="pagination" hide-actions select-all v-model="selected")
            template(v-slot:items='props')
                tr
                    th 
                        v-checkbox(:input-value="props.all" :indeterminate="props.indeterminate" primary hide-details @click.stop="toggleAll")
                    th(v-for="header in props.headers" :key="header.text" :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']") {{header.text}}
                        //- v-icon(small) arrow_upward

            template(slot="items" slot-scope="props")
                slot(name="items" :props="props" :index="rowIndex(props.index)")

        v-flex.px-2
            v-layout.px-1(row align-center)
                v-flex.text-xs-left
                    v-layout(row align-center)
                        small Rows per page:
                        v-select.px-3.py-3(:items="page" v-model="rowsPerPage" hide-details )
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
        }
        // selected: {
        //     type: Array
        // }
    },
    data() {
        return {
            selected: [],
            rowsPerPage: 0,
            page: [5, 10, 25, "All"],
            pagination: {
                rowsPerPage: this.perPage,
                sortBy: "name", // The field that you're sorting by
                descending: true
            },
            pages: 0
        };
    },
    methods: {
        changeSort(column) {
            if (this.pagination.sortBy === column) {
                this.pagination.descending = !this.pagination.descending;
            } else {
                this.pagination.sortBy = column;
                this.pagination.descending = false;
            }
        },
        toggleAll() {
            if (this.selected.length) this.selected = [];
            else this.selected = this.items.slice();
        },
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
        selected: function() {
            this.$emit("childMethod", this.selected);
        },
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
            // console.log("data change");
        }
    },
    mounted() {
        this.setPages();
        this.rowsPerPage = this.perPage;
    }
};
</script>

