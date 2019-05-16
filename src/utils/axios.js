import axios from "axios";
import store from "../store";
import errorHandler from "./errorHandler";

axios.defaults.timeout = process.env.VUE_APP_API_TIMEOUT;
axios.defaults.baseURL = process.env.VUE_APP_API_BASEURL;

//Http Request
axios.interceptors.request.use(
    config => {
        var token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = "Bearer " + token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

//Http Response
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        switch (error.response.status) {
            case 403:
                store.dispatch("account/logout");
                break;
        }

        error.response.data.text = error.response.data.errorCode
            ? errorHandler[error.response.data.errorCode]
            : error.response.data.message;
        return Promise.reject(error);
    }
);

export default axios;
