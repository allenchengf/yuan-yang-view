<template lang="pug">
    v-layout#reset-password(align-center justify-center)
        v-card(mx-auto min-width="460")
            v-img.mx-auto.reset(:src="require('../assets/images/iRouteCDN_signin.png')" width="160")
            .title.ml-4.mt-4 Reset your password
            v-container
                v-form(ref="resetForm" lazy-validation valid onsubmit="return false;")
                    .tips.text-md-left
                        span Enter a new password for your 
                        b {{email}} 
                        span account.
                    v-text-field(v-model="password.new" label="Password" type="password" name="password" :rules="[rules.required, rules.min]" @change="verifyPassword")
                    v-text-field(v-model="password.confirm" label="Confirm Password" type="password" name="confirmpassword" :rules="[rules.required, rules.password]")
                    v-btn.mt-3(color="primary" block @click="submitAction") Submit
</template>

<script>
import textFieldRules from "../utils/textFieldRules";

export default {
    mixins: [textFieldRules],

    data() {
        return {
            email: "",
            password: {
                new: "",
                confirm: ""
            },
            token: ""
        };
    },
    methods: {
        submitAction: function() {
            var vm = this;
            if (this.$refs.resetForm.validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("account/resetPassword", {
                        email: this.email,
                        password: this.password.confirm,
                        token: this.token
                    })
                    .then(
                        function(result) {
                            this.$router.push(
                                "/login?message=" +
                                    "Reset password success." +
                                    "&type=success"
                            );
                            this.$store.dispatch("global/finishLoading");
                        }.bind(this)
                    )
                    .catch(
                        function(error) {
                            this.$store.dispatch(
                                "global/showSnackbarError",
                                error.message
                            );
                            this.$store.dispatch("global/finishLoading");
                        }.bind(this)
                    );
            }
        },
        verifyPassword: function() {
            return this.$refs.resetForm.validate();
        }
    },
    mounted() {
        this.email = this.$route.query.account;
        this.token = this.$route.query.token;
    }
};
</script>

<style scoped>
.reset {
    margin-top: 40px;
}
</style>