import instance from "./api";
import router from "@/router";

const setup = (store, app) => {
var configG = app.config.globalProperties
    instance.interceptors.request.use(
        (config) => {
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
    
    instance.interceptors.response.use((response) => {
        if(response.status === 401) {
            console.log(response)
            store.dispatch('logLout')
        }
        return response;
    }, (error) => {
        if (error.response && error.response.data) {
            if (error.response.status === 401) {
                store.dispatch('solveAttemptedUrl', router.currentRoute.value)
                store.dispatch('logLout')
            } else 
            if (error.response.status === 405) {
                console.log(error.response)
                configG.$toast.add({
                    severity: "error",
                    summary:  configG.$t('common.message.notAllowed'),
                    life: 3000,
                  });
            }
            else {
                console.log(error)
                return Promise.reject(error.response.data);
            }
        }
        return Promise.reject(error.message);
    });
};

export default setup;
