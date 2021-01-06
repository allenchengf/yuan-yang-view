export default {
    data() {
        return {
            rules: {
                required: value => !!value || "Required.",
                min: value =>
                    (value != null && value.length >= 8) ||
                    "Please use at least 8 characters.",
                ttl: value =>
                    (value != null && value >= 60 && value <= 604800) ||
                    "TTL must be 60 ~ 604800.",
                password: value =>
                    this.password.new == value || "Passwords don't match.",
                otp: value =>
                    (value != null && value.length == 6) ||
                    "Please enter 6-digit code.",
                // 舊的驗證 domain
                // domain: value => {
                //     const pattern = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9]+\.[a-zA-Z]{2,11}?$/;
                //     return pattern.test(value) || "Invalid Domain Name.";
                // },
                domain: value=>{
                    const pattern = /^([a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]{2,25}?$/;
                    return pattern.test(value) || "Invalid Domain Name.";
                },
                email: value => {
                    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return pattern.test(value) || "Invalid e-mail.";
                }
            }
        };
    }
};
