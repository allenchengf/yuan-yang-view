<template lang="pug">
    v-container#autoscan
        v-layout(wrap column)
            v-flex(xs12)
                .title.text-xs-left.mb-4 Auto Scan
            v-flex(xs12)
                v-card
                    v-card-title.title.font-weight-regular.justify-space-between
                        span {{ currentTitle }}
                        v-avatar.subheading.white--text(color="primary" size="24" v-text="step")
                    v-window(v-model="step")
                        v-window-item(:value="1")
                            v-card-text
                                v-radio-group(v-model="selectedCrawler")
                                    v-radio(v-for="item in crawlerGroup" :key="item.id" :label="item.name" :value="item.id")
                        v-window-item(:value="2")
                            v-card-text
                                v-container
                                    v-checkbox(v-for="item in cdnProviderList" :disabled="item.status == 0 || item.url == null" :key="item.id" :label="item.name" :value="item.id" v-model="selectedCdnProvider")
                    v-divider
                    v-card-actions
                        v-btn(:disabled="step === 1" flat @click="back") Back
                        v-spacer
                        v-btn(v-if="step === 2" color="primary" depressed @click="startScan" :disabled="selectedCdnProvider.length == 0") Start Scan
                        v-btn(v-if="step !== 2" color="primary" depressed @click="next" :disabled="selectedCrawler==''") Next
 

</template>
<script>
export default {
    data() {
        return {
            step: 1,
            selectedCrawler: "",
            selectedCdnProvider: [],
            crawlerGroup: [],
            cdnProviderList: [],
            scanData: []
        };
    },
    computed: {
        currentTitle() {
            return this.step === 1
                ? "Choose a crawler to scan"
                : "Choose CDN providers to scan";
        }
    },
    methods: {
        getScanProvider() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("crawlers/getScanProvider")
                .then(
                    function(result) {
                        this.crawlerGroup = result.data;
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                    }.bind(this)
                );
        },
        getCdnProvider() {
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("cdnProviders/getAllCdnProvider")
                .then(
                    function(result) {
                        this.cdnProviderList = result.data;
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch("global/finishLoading");
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.message
                        );
                    }.bind(this)
                );
        },
        back() {
            this.step--;
            this.selectedCdnProvider = [];
        },
        startScan() {
            this.selectedCdnProvider.forEach((o, i) => {
                var scanInfo = {};
                scanInfo.url = o;
                scanInfo.wait = 30;
                this.scanData.push(scanInfo);
            });
            // console.log(this.scanData);
            this.$router.push({
                name: "auto-scan-list",
                query: {
                    cdn_provider: this.selectedCdnProvider,
                    crawler: this.selectedCrawler
                }
            });
        },
        next() {
            this.step++;
            this.selectedCdnProvider = [];
            // console.log(this.selectedCrawler);
        }
    },
    mounted() {
        this.selectedCdnProvider = [];
        this.getScanProvider();
        this.getCdnProvider();
    }
};
</script>