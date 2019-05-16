<template lang="pug">
    v-navigation-drawer(v-model="drawer" clipped fixed app :mini-variant="mini" light)
        v-list(dense)
            template(v-for="item, index in items")
                v-subheader(v-if="item.header && authLevel >= item.auth" :key="item.header") {{ item.header }}
                v-divider(v-else-if="item.divider" :key="index" :inset="item.inset")
                .menu-item(v-else-if="$store.getters['account/accountAuth']() >= item.auth")
                    v-list-group(v-if="item.children" v-model="item.model" :prepend-icon="item.icon" value="true" no-action)
                        v-list-tile(slot="activator" active-class="activePrimary")
                            v-list-tile-content
                                v-list-tile-title {{item.title}}
                        v-list-tile(v-for="(child, i) in item.children" :key="child.title" :to="child.router")
                            v-list-tile-content(v-if="$store.getters['account/accountAuth']() >= child.auth")
                                v-list-tile-title {{child.title}}
                    v-list-tile(v-else :key="item.title" :to="item.router" active-class="activePrimary")
                        v-list-tile-action
                            v-icon {{item.icon}}
                        v-list-tile-content
                            v-list-tile-title {{item.title}}
</template>

<script>
export default {
    data() {
        return {
            drawer: true,
            mini: false,
            menu: false,
            items: [
                { header: "Administration", auth: 2 },
                {
                    title: "Domains List",
                    icon: "account_circle",
                    router: "/admin/domains",
                    auth: 0
                },
                {
                    title: "Domain Settings",
                    icon: "settings",
                    router: "/admin/setting",
                    auth: 0
                }
            ],
            right: null
        };
    },
    created() {
        this.authLevel = this.$store.getters["account/accountAuth"]();
    }
};
</script>

<style lang="scss" scoped>
</style>
