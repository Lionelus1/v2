import instance from "./api";

const setup = (store) => {
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
            store.dispatch('logLout')
        }
        return response;
    }, (error) => {
        if (error.response && error.response.data) {
            if (error.response.status === 401) {
                store.dispatch('logLout')
            } else {
                return Promise.reject(error.response.data);
            }
        }
        return Promise.reject(error.message);
    });
};

export default setup;
