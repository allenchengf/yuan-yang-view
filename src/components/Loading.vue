<template lang="pug">
    #loading
        v-dialog(v-model="$store.state.global.isLoading" persistent width="300")
            v-card(color="primary" dark)
                v-card-text
                    v-progress-linear.ma-0(indeterminate color="white")
</template>
<script>
export default {
    props: {},
    data() {
        return {};
    },
    methods: {},
    created() {}
};
</script>
<style lang="sass" scoped>

</style>


