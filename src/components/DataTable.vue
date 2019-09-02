<template lang="pug">
    #datatable
        v-data-table.elevation-1(:headers="headers" :items="items" :loading="loading" :search="searchText" :pagination.sync="pagination")
            template(slot="items" slot-scope="props")
                slot(name="items" :props="props" :index="rowIndex(props.index)")
                
        v-layout.px-2(row align-center)
            v-flex.text-xs-left.py-3(xs4)
                slot(name="actions-left")
            v-flex.text-xs-right.py-3(xs8)
                v-pagination(v-model="page" :length="pages" :total-visible="7")
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
            type: Number,
            default: 20
        }
    },
    data() {
        return {
            pagination: {
                rowsPerPage: this.perPage,
                sortBy: "time", // The field that you're sorting by
                descending: true
            },
            pages: 0,
            page: 1
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
            if (this.perPage == null || this.pagination.totalItems == null) {
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
        page: function(val) {
            // console.log(val);
            this.pagination.page = this.page;
        },
        pagination: function(value) {
            // console.log(this.pagination);
            this.setPages();
        },
        perPage: function(value) {
            this.pagination.rowsPerPage = value;
            this.setPages();
        },
        items: function(value) {
            this.setPages();
        }
    },
    mounted() {
        this.setPages();
    }
};
</script>

