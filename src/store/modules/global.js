import Vue from "vue";

export default {
    namespaced: true,
    // -----------------------------------------------------------------
    state: {
        snackbar: {
            text: "",
            color: "success",
            status: false,
            timeout: 6000
        },
        isLoading: false
    },
    // -----------------------------------------------------------------
    getters: {
        // getters and computed props on the data
    },
    // -----------------------------------------------------------------
    mutations: {
        // stuff to set data locally
        updateSnackbar: (state, snackbar) => {
            state.snackbar = snackbar;
        },
        updateLoadingStatus: (state, status) => {
            state.isLoading = status;
        }
    },
    // -----------------------------------------------------------------
    actions: {
        showSnackbar: (context, snackbar) => {
            snackbar.status = true;
            context.commit("updateSnackbar", snackbar);
        },
        showSnackbarSuccess: (context, text) => {
            context.commit("updateSnackbar", {
                status: true,
                text: text,
                color: "success",
                timeout: 6000
            });
        },
        showSnackbarError: (context, text) => {
            context.commit("updateSnackbar", {
                status: true,
                text: text,
                color: "error",
                timeout: 10000
            });
        },
        closeSnackbar: context => {
            context.commit("updateSnackbar", {
                text: "",
                color: "success",
                status: false,
                timeout: 6000
            });
        },
        startLoading: context => {
            context.commit("updateLoadingStatus", true);
        },
        finishLoading: context => {
            context.commit("updateLoadingStatus", false);
        }
    }
};
