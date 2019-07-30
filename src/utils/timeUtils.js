import moment from "moment";

export default {
    methods: {
        timestampToString: function(time) {
            return moment(time * 1000).format("YYYY/MM/DD HH:mm:ss");
        }
    }
};
