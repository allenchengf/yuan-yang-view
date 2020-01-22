import axios from "axios";
import store from "../store";
import router from "../router";
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
        // console.log(error.response);

        switch (error.response.status) {
            case 401:
                store.dispatch("account/logout");
                break;
            case 403:
                store.dispatch(
                    "global/showSnackbarError",
                    "Please contact iRoute Admin."
                );
            case 404:
                router.push({ path: "/" });
                break;
        }
        switch (error.response.data.errorCode) {
            case 1001:
                error.response.data.message =
                    errorHandler[error.response.data.errorCode];
                break;
            case 1002:
                error.response.data.message =
                    errorHandler[error.response.data.errorCode];
                break;
        }
        // error.response.data.text = error.response.data.errorCode
        //     ? errorHandler[error.response.data.errorCode]
        //     : error.response.data.message;
        return Promise.reject(error);
    }
);

export default axios;
