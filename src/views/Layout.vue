<template lang="pug">
    #user-module
        Loading
        NavigationDrawer(ref="drawer")
        v-toolbar(fixed clipped-left app color="primary" dark)
            v-toolbar-side-icon(@click.stop="$refs.drawer.drawer = !$refs.drawer.drawer")
            v-toolbar-title.mr-5.align-center.site-logo
                span.title
                    router-link(to="/admin")
                        v-img.logo(:src="require('../assets/images/iRouteCDN.png')" contain width="150" )
            v-spacer
            //- v-btn(icon)
            v-menu(offset-y )
                template(slot="activator" slot-scope="{on}")
                    v-btn(v-on="on" flat outline v-show="$vuetify.breakpoint.mdAndUp") 
                        span.white--text() Hello, {{user.name}}
                    v-btn(v-on="on" flat icon v-show="$vuetify.breakpoint.smAndDown") 
                        v-icon account_circle
                v-list
                    v-list-tile(to="/admin/settings")
                        v-list-tile-title Settings
                    v-divider
                    v-list-tile(@click="signout")
                        v-list-tile-title Sign out
        //- Snackbar
        v-snackbar(v-model="$store.state.global.snackbar.status" :color="$store.state.global.snackbar.color" :timeout="$store.state.global.snackbar.timeout" top ) {{$store.state.global.snackbar.text}}
            v-btn(dark flat @click="$store.dispatch('global/closeSnackbar')") CLOSE

        v-content
            router-view
</template>

<script>
import Loading from "../components/Loading";
import NavigationDrawer from "../components/NavigationDrawer";

export default {
    components: {
        Loading,
        NavigationDrawer
    },
    data() {
        return {
            drawer: true,
            admins: [
                ["Management", "people_outline"],
                ["Settings", "settings"]
            ],
            user: {
                name: "James Bond"
            },
            user: "",
            portalUrl: ""
        };
    },
    methods: {
        gotoSettings: function() {
            window.open(this.portalUrl + "/admin/settings", "_blank");
        },
        signout: function() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("account/logout")
                .then(
                    function(result) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarSuccess",
                            "Sign out success!"
                        );
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                );
        }
    },
    mounted() {
        this.portalUrl = process.env.VUE_APP_URL_PORTAL;
    },
    created() {
        this.user = this.$store.getters["account/account"]();
    }
};
</script>

<style lang="sass" scoped>

</style>