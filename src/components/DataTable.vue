<template lang="pug">
    #datatable
        //- slot(name="slot-content" :item="val" v-for="val in items")
        v-data-table.elevation-1(:headers="headers" :items="items" :loading="loading" :search="searchText" :pagination.sync="pagination"  hide-actions)
            template(slot="items" slot-scope="props")
                slot(name="items" v-bind="props")
                
        v-layout.px-2(row align-center)
            v-flex.text-xs-left.py-3(xs4)
                slot(name="actions-left")
            v-flex.text-xs-right.py-3(xs8)
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
            type: Number,
            default: 20
        }
    },
    data() {
        return {
            pagination: {
                rowsPerPage: 20
            },
            pages: 0
        };
    },
    methods: {
        setPages: function() {
            if (this.perPage == null || this.items == null) {
                this.pages = null;
            } else {
                this.pages = Math.ceil(this.items.length / this.perPage);
            }
        }
    },
    watch: {
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

