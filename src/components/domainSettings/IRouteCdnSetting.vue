<template lang="pug">
    v-container#iRouteCdnSetting
        v-layout(wrap column) 
            v-flex(xs12 sm4 md4)
                v-tabs(slider-color="primary")
                    v-tab(v-for="item in items" @click="currentItem = item" v-model="currentItem" :disabled="item.disabled") {{item.name}} 
                    v-tabs-items
                        v-tab-item(v-for="item in items" )
                            component(:is="item.component" :domain_id="domain_id")
</template>
<script>
import Location from "../domainSettings/iRoute/Location";
import Group from "../domainSettings/iRoute/Group";

export default {
    components: { Location, Group },
    props: ["tab", "domain_id"],
    data() {
        return {
            items: [
                { name: "Location", component: Location, disabled: false },
                { name: "Group", component: Group, disabled: true }
            ],
            currentItem: ""
        };
    },
    watch: {
        perPage: function(value) {
            this.pagination.rowsPerPage = value;
            this.setPages();
        },
        domain_id: function() {
            // this.getAllCDNs();
        }
    },
    mounted() {
        console.log(this.domain_id);
    }
};
</script>