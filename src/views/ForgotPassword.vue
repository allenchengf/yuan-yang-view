<template lang="pug">
    v-layout#forgot-password(align-center justify-center)
        v-flex(xs10 md9)
            v-img.mx-auto(:src="require('../assets/images/hiero7_square.png')" width="100px")
            .title.mt-3 Forgot your password?
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
            if (this.$refs.forgotForm.validate()) {
                this.$store
                    .dispatch("account/forgotPassword", this.email)
                    .then(
                        function(result) {
                            this.success = true;
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "An e-mail will be sent to " +
                                    this.email +
                                    " with further instructions."
                            );
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
</style>