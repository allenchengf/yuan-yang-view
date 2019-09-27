<template lang="pug">
    v-container#settings
        //- main content
        v-layout(wrap column)
            v-flex(xs12)
                .title.text-xs-left.mb-4 Personal account 
            v-flex(xs12)
                v-card
                    //- avatar
                    //- v-list.pb-0(subheader three-line)
                    //-     v-subheader General
                        //- v-list-tile.photo-tile(@click="uploadAvatar" avatar)
                        //-     v-list-tile-content
                        //-         v-layout(align-center)
                        //-             .setting-title Photo
                        //-             .setting-content
                        //-                 v-avatar(size="55px" )
                        //-                     img(src="@/assets/images/avatar.png")
                        //-         input.d-none(ref="avatar" type="file" accept="image/*" @change="onAvatarPicked")
                        //-     //- v-list-tile-avatar.mt-0(size="60px")
                        //-     //-     img(src="@/assets/images/avatar.png")
                        //-     v-list-tile-action
                        //-         v-icon(color="grey") chevron_right
                        //- v-divider
                    v-list.pt-0(subheader)
                        v-subheader General
                        v-list-tile(@click="")
                            v-list-tile-content
                                .content.d-flex
                                    .setting-title Email
                                    .setting-content {{user.email}}
                        v-divider
                        v-list-tile(@click="dialog.name = true; updatedUser.name = user.name")
                            v-list-tile-content
                                .content.d-flex
                                    .setting-title Name
                                    .setting-content {{user.name}}
                            v-list-tile-action
                                v-icon(color="grey") chevron_right
                        v-divider
                        v-list-tile(@click="dialog.phone = true; updatedUser.phone = user.phone")
                            v-list-tile-content
                                .content.d-flex
                                    .setting-title Phone
                                    .setting-content {{user.phone}}
                            v-list-tile-action
                                v-icon(color="grey") chevron_right
                        v-divider
                        v-list-tile(@click="dialog.password = true;")
                            v-list-tile-content
                                .content.d-flex
                                    .setting-title Password
                                    .setting-content.grey--text Click to change password
                            v-list-tile-action
                                v-icon(color="grey") chevron_right
                        //- v-divider
                    //- v-list(subheader)
                        v-subheader Security
                        v-list-tile(@click="dialog.otp = true;")
                            v-list-tile-content
                                .content.d-flex
                                    .setting-title Two-step verification
                                    .setting-content(v-if="user.otp==true") On
                                    .setting-else(v-else) Off
                            v-list-tile-action
                                v-switch(color="primary" :value="user.otp" readonly)

        //- dialogs
        v-dialog.name-dialog(v-model="dialog.name" max-width="460")
            v-card
                v-card-title.title Change your name
                //- v-divider
                v-card-text
                    v-form(ref="nameForm" onsubmit="return false;")
                        v-text-field(v-model="updatedUser.name" label="Name" type="text" name="name" :rules="[rules.required]" @keyup.native.enter="updateUser('nameForm')")
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="dialog.name=false;") Cancel
                    v-btn(color="primary" flat="flat" @click="updateUser('nameForm')") Update
        v-dialog.phone-dialog(v-model="dialog.phone" max-width="460")
            v-card
                v-card-title.title Change your phone
                //- v-divider
                v-card-text
                    v-form(ref="phoneForm" onsubmit="return false;")
                        v-text-field(v-model="updatedUser.phone" label="Phone" type="text" name="phone" @keyup.native.enter="updateUser('phoneForm')")
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="dialog.phone=false;") Cancel
                    v-btn(color="primary" flat="flat" @click="updateUser('phoneForm')") Update
        v-dialog.password-dialog(v-model="dialog.password" max-width="460" persistent)
            v-card
                v-card-title.title Change your password
                //- v-divider
                v-card-text
                    v-form(ref="passwordForm" lazy-validation valid)
                        v-text-field(v-model="password.old" label="Old Password" type="password" name="newpassword" :rules="[rules.required]" )
                        v-text-field(v-model="password.new" label="New Password" type="password" name="oldpassword" :rules="[rules.required, rules.min]" @change="verifyPassword")
                        v-text-field(v-model="password.confirm" label="Confirm New Password" type="password" name="confirmpassword" :rules="[rules.required, rules.password]")
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="closePasswordDialog") Cancel
                    v-btn(color="primary" flat="flat" @click="updatePassword") Update
        //- v-dialog.otp-dialog(v-model="dialog.otp" max-width="460" persistent )
            v-card(v-if="user.otp == false")
                v-window(v-model="otpStep")
                    v-window-item(:value="1")
                        v-card-title.title Enable two-step verification
                        v-card-text
                            .text.text-xs-left Two-step verification adds an extra layer of protection to your account. Whenever you sign in to the website, you’ll need to enter both your password and also a security code.
                        v-card-actions  
                            v-spacer
                            v-btn.ma-0(color="grey" flat="flat" @click="closeOtpDialog") Cancel
                            v-btn.ma-0(color="primary" flat="flat" @click="getOtpQRCode") Get Start
                    v-window-item(:value="2")
                        v-card-title.title Enable two-step verification
                        v-card-text.text-xs-left
                            .text.mb-2 An authenticator app lets you generate security codes on your phone without needing to receive text messages.
                            .text.mb-4 Use your app to scan the qrcode below
                            .otp-qrcode()
                                v-img.ma-auto(:src="otpUrl" contain width="200px" )
                        v-card-actions  
                            v-spacer
                            v-btn.ma-0(color="grey" flat="flat" @click="closeOtpDialog") Cancel
                            v-btn.ma-0(color="primary" flat="flat" @click="otpStep=3") Next
                    v-window-item(:value="3")
                        v-card-title.title Enable two-step verification
                        v-card-text.text-xs-left
                            .text.mb-2 Enter the security code generated by your mobile authenticator app to make sure it’s configured correctly.
                            v-form(ref="otpForm" lazy-validation valid onsubmit="return false;")
                                v-text-field(v-model="otpCode" label="6-digit security code" mask="######" type="text" name="code" :rules="[rules.required, rules.otp]" @keyup.enter="changeOTPStatus")
                            v-alert.text-md-left(:value="otpError" color="error" icon="warning" outline transition="scale-transition") Invalid Verification Code, Please try again.
                        v-card-actions  
                            v-spacer
                            v-btn.ma-0(color="grey" flat="flat" @click="closeOtpDialog") Cancel
                            v-btn.ma-0(color="primary" flat="flat" @click="changeOTPStatus") Enable

            v-card(v-else)
                v-card-title.title Disable two-step verification
                v-card-text
                    .text.text-xs-left If you disable two-step verification, you’ll only need your email and password when you sign in to the website.
                v-card-actions  
                    v-spacer
                    v-btn(color="grey" flat="flat" @click="closeOtpDialog") Cancel
                    v-btn(color="primary" flat="flat" @click="changeOTPStatus") Disable
</template>

<script>
// import QRCode from "qrcode";
import textFieldRules from "../utils/textFieldRules.js";
import { mapMutations } from "vuex";

export default {
    mixins: [textFieldRules],
    data() {
        return {
            settingItems: [],
            user: {},
            updatedUser: {},
            password: {
                old: "",
                new: "",
                confirm: ""
            },
            dialog: {
                name: false,
                phone: false,
                password: false,
                otp: false
            },
            otpStep: 1,
            otpCode: "",
            otpUrl: "",
            otpError: false
        };
    },
    methods: {
        getProfile: function() {
            var vm = this;
            this.$store.dispatch("global/startLoading");
            this.$store
                .dispatch("account/getProfile")
                .then(
                    function(result) {
                        this.user = this.$store.getters["account/account"]();
                        this.user.google2fa.filter(
                            function(el) {
                                if (el.key == process.env.VUE_APP_PLATFORM_KEY)
                                    this.user.otp = el.status;
                            }.bind(this)
                        );
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch("global/finishLoading");
                    }.bind(this)
                );
        },
        // getAuth: function() {
        //     var vm = this;
        //     this.$store.dispatch("global/startLoading");
        //     this.$store
        //         .dispatch("account/getAuth")
        //         .then(
        //             function(result) {
        //                 this.$store.dispatch("global/finishLoading");
        //             }.bind(this)
        //         )
        //         .catch(
        //             function(error) {
        //                 this.$store.dispatch("global/finishLoading");
        //             }.bind(this)
        //         );
        // },
        // uploadAvatar: function() {
        //     this.$refs.avatar.click();
        // },
        // onAvatarPicked: function(e) {
        //     const files = e.target.files;
        //     if (files[0] !== undefined) {
        //         //upload avatar
        //     }
        // },
        updateUser: function(formName) {
            if (this.$refs[formName].validate()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("account/updateProfile", this.updatedUser)
                    .then(
                        function(response) {
                            this.getProfile();
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Update Success"
                            );
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

                this.closeAllDialog();
            }
        },
        updatePassword: function() {
            if (this.verifyPassword()) {
                this.$store.dispatch("global/startLoading");
                this.$store
                    .dispatch("account/updatePassword", this.password)
                    .then(
                        function(response) {
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Update Password Success"
                            );
                            this.$store.dispatch("global/finishLoading");
                            this.closePasswordDialog();
                        }.bind(this)
                    )
                    .catch(
                        function(error) {
                            this.$store.dispatch(
                                "global/showSnackbarError",
                                error.message
                            );
                            this.$store.dispatch("global/finishLoading");
                            this.closePasswordDialog();
                        }.bind(this)
                    );
            }
        },
        closeAllDialog: function() {
            var vm = this;
            Object.keys(this.dialog).forEach(function(key) {
                vm.dialog[key] = false;
            });
        },
        verifyPassword: function() {
            return this.$refs.passwordForm.validate();
        },
        getOtpQRCode: async function() {
            this.$store
                .dispatch("account/getOtpQRCode")
                .then(
                    async function(result) {
                        var url = await QRCode.toDataURL(
                            result.data.verifyString
                        );
                        this.otpUrl = url;
                        this.otpStep = 2;
                    }.bind(this)
                )
                .catch(
                    function(error) {
                        this.$store.dispatch(
                            "global/showSnackbarError",
                            error.messgae
                        );
                    }.bind(this)
                );
        },
        closePasswordDialog() {
            this.dialog.password = false;
            this.$refs.passwordForm.reset();
        },
        closeOtpDialog() {
            this.dialog.otp = false;
            this.otpStep = 1;
            if (this.$refs.otpForm != null) this.$refs.otpForm.reset();
            this.otpError = false;
        },
        changeOTPStatus: function() {
            if (this.user.otp == false) {
                if (this.$refs.otpForm.validate()) {
                    this.$store
                        .dispatch("account/enableOtp", {
                            "verify-code": this.otpCode
                        })
                        .then(
                            function(result) {
                                this.$store.dispatch(
                                    "global/showSnackbarSuccess",
                                    "Update Success"
                                );
                                this.getProfile();
                                this.closeOtpDialog();
                            }.bind(this)
                        )
                        .catch(
                            function(error) {
                                this.$store.dispatch(
                                    "global/showSnackbarError",
                                    error.messgae
                                );
                                this.otpError = true;
                            }.bind(this)
                        );
                }
            } else {
                this.$store
                    .dispatch("account/disableOtp")
                    .then(
                        function(result) {
                            this.$store.dispatch(
                                "global/showSnackbarSuccess",
                                "Update Success"
                            );
                            this.getProfile();
                        }.bind(this)
                    )
                    .catch(
                        function(error) {
                            this.$store.dispatch(
                                "global/showSnackbarError",
                                error.messgae
                            );
                        }.bind(this)
                    );
                this.closeAllDialog();
            }
        }
    },
    created() {
        this.getProfile();
        // this.getAuth();
    }
};
</script>

<style scoped>
.setting-title {
    min-width: 200px;
}
</style>