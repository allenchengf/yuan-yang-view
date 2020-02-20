<template lang="pug">
    v-layout#forgot-password(align-center justify-center)
        v-card(mx-auto min-width="460")
            v-img.mx-auto.forgot(:src="require('../assets/images/iRouteCDN_signin.png')" max-width="160")
            .title.mt-4.ml-4 Forgot your password?
            v-container
                v-form(ref="forgotForm" lazy-validation valid onsubmit="return false;")
                    .tips.text-md-left Enter your email address to receive your new password.
                    v-text-field(label="Email" v-model="email" type="text"  name="email" :rules="[rules.required, rules.email]" @keyup.native.enter="submitAction")
                    v-btn.mt-3(color="primary" block @click="submitAction") Submit
                    router-link(to="/login") Sign in
</template>
<script>
import textFieldRules from "../utils/textFieldRules";

export default {
    mixins: [textFieldRules],
    data() {
        return {
            email: ""
        };
    },
    methods: {
        submitAction: function() {
            this.$store.dispatch("global/startLoading");
            this.$store.dispatch(
                "global/showSnackbarSuccess",
                "An e-mail will be sent to " +
                    this.email +
                    " with further instructions."
            );

            if (this.$refs.forgotForm.validate()) {
                var email = {
                    email: this.email
                };
                this.$store
                    .dispatch("account/forgotPassword", this.email)
                    .then(
                        function(result) {
                            // this.success = true;
                            this.$router.push("/login");
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
            }
        }
    }
};
</script>

<style scoped>
.v-stepper {
    background: transparent;
    box-shadow: none;
}
.forgot {
    margin-top: 40px;
}
</style>