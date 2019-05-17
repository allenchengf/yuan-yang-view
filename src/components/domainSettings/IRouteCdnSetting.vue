<template lang="pug">
    v-container#iRouteCdnSetting
        v-layout(wrap column) 
            v-flex(xs12 sm4 md4)
                v-tabs(slider-color="primary")
                    v-tab(v-for="item in items" @click="currentItem = item" v-model="currentItem" :disabled="item.disabled") {{item.name}} 
                    v-tabs-items
                        v-tab-item(v-for="item in items" )
                            component(:is="item.component" :domain_id="domain_id" :tab="tab" :select="select")
</template>
<script>
import Location from "../domainSettings/iRoute/Location";
import Group from "../domainSettings/iRoute/Group";

export default {
    components: { Location, Group },
    props: ["tab", "domain_id", "select"],
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
        domain_id: function() {
            console.log(this.domain_id);
        }
    },
    mounted() {
        console.log(this.domain_id);
    }
};
</script>

<style lang="sass">
#iRouteCdnSetting
    padding: 0
</style>
