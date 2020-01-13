<template lang="pug">
    v-navigation-drawer(v-model="drawer" clipped fixed app :mini-variant="mini" light :accountPermission="accountPermission")
        v-list(dense)
            template(v-for="item, index in items")
                v-subheader(v-if="item.header" :key="item.header") {{ item.header }}
                v-divider(v-else-if="item.divider" :key="index" :inset="item.inset")
                .menu-item(v-else-if="item.show == true")
                    v-list-group(v-if="item.children" v-model="item.model" :prepend-icon="item.icon" value="true" no-action)
                        v-list-tile(slot="activator" active-class="activePrimary" )
                            v-list-tile-content
                                v-list-tile-title {{item.title}}
                        v-list-tile(v-for="(child, i) in item.children" :key="child.title" :to="child.router" v-if="child.show == true")
                            v-list-tile-content
                                v-list-tile-title {{child.title}}
                    v-list-tile(v-else :key="item.title" :to="item.router" active-class="activePrimary")
                        v-list-tile-action
                            v-icon {{item.icon}}
                        v-list-tile-content
                            v-list-tile-title {{item.title}}
</template>

<script>
export default {
    props: {
        accountPermission: {
            type: Array
        }
    },
    data() {
        return {
            userGroupId: "",
            drawer: true,
            mini: false,
            menu: false,
            items: [
                { header: "General", auth: 0 },
                {
                    title: "Dashboard",
                    icon: "dashboard",
                    router: "/dashboard",
                    auth: 0
                },
                {
                    title: "CDN Providers",
                    icon: "settings_input_component",
                    router: "/admin/cdn-providers",
                    auth: 1
                },
                {
                    title: "Domains",
                    icon: "domain",
                    router: "/admin/domains",
                    auth: 1
                },
                {
                    title: "Grouping",
                    icon: "group",
                    router: "/admin/grouping",
                    auth: 1
                },
                {
                    title: "iRouteCDN",
                    icon: "dns",
                    router: "/admin/iroutecdn",
                    auth: 0
                },
                {
                    title: "Logs",
                    icon: "description",
                    router: "/admin/logs",
                    auth: 1
                },
                {
                    title: "Tools",
                    icon: "build",
                    auth: 0,
                    children: [
                        {
                            title: "Auto Scan",
                            router: "/admin/auto-scan",
                            auth: 0
                        },
                        {
                            title: "Config Backup",
                            router: "/admin/config-backup",
                            auth: 0
                        }
                    ]
                },
                { header: "Administration", auth: 2 },
                {
                    title: "Networks",
                    icon: "settings",
                    router: "/admin/networks",
                    auth: 2
                },
                {
                    title: "Users Setting",
                    icon: "account_circle",
                    auth: 0,
                    children: [
                        {
                            title: "Users",
                            icon: "list",
                            router: "/admin/users",
                            auth: 0
                        },
                        {
                            title: "Roles",
                            icon: "list",
                            router: "/admin/roles",
                            auth: 0
                        }
                    ]
                },
                {
                    title: "Groups",
                    icon: "group_add",
                    router: "/admin/user-groups",
                    auth: 2
                }
            ],
            right: null,
            permission: []
        };
    },
    methods: {
        adjustPermission() {
            // console.log(this.permission, "prtimvikirn");
            var rolesPermission = {};
            this.permission.forEach((o, i) => {
                if (o.permission.name == "Users") {
                    rolesPermission.actions = o.actions;
                    rolesPermission.permission = {
                        name: "Roles"
                    };
                }
            });
            this.permission.push(rolesPermission);
            // console.log(this.permission);
        },
        permissionControl() {
            if (this.userGroupId == 1) {
                this.items.forEach((o, i) => {
                    if (o.auth == 2) {
                        o.show = true;
                    } else {
                        o.show = false;
                    }
                });
            }
            this.items.forEach((o, i) => {
                if (o.title === "Dashboard") {
                    o.show = true;
                }
            });
            this.permission.forEach((o, i) => {
                this.items.forEach((obj, idx) => {
                    if (obj.children !== undefined) {
                        obj.children.forEach((object, index) => {
                            if (
                                object.title == o.permission.name &&
                                o.actions.read == 1
                            ) {
                                object.show = true;
                                obj.show = true;
                            } else if (
                                object.title == o.permission.name &&
                                o.actions.read == 0
                            ) {
                                object.show = false;
                            }
                        });
                    } else {
                        if (
                            o.permission.name == obj.title &&
                            o.actions.read == 1
                        ) {
                            obj.show = true;
                        } else if (
                            o.permission.name == obj.title &&
                            o.actions.read == 0
                        ) {
                            obj.show = false;
                        }
                    }
                });
            });
            if (this.permission !== null) {
                this.$store.dispatch("global/finishLoading");
            }
        }
    },
    created() {
        this.$store.dispatch("global/startLoading");
        this.userGroupId = this.$store.getters["account/accountGroupId"]();
        this.permission = this.accountPermission;
        // console.log(this.permission);
        this.adjustPermission();
        this.permissionControl();
    }
};
</script>

<style lang="scss" scoped>
</style>
