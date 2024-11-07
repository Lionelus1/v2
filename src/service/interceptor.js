import instance from "./api";
import router from "@/router";
import axios from "axios";
import { smartEnuApi } from "../config/config";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";

let isRefreshing = false;
const failedRequests = [];

const setup = (store, app) => {
  const configG = app.config.globalProperties;
  const toast = configG.$toast
  const t = configG.$t;

  instance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    async (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response && error.response.status === 401 && !originalRequest._retry) {
          if (!isRefreshing) {
            isRefreshing = true;

          try {
            const tokenDataString = window.localStorage.getItem("authUser");
            const tokenData = tokenDataString ? JSON.parse(tokenDataString) : null;
            if (tokenData && tokenData.refresh_token) {

              const res = await axios.post(smartEnuApi + "/refreshToken", {
                refresh_token: tokenData.refresh_token,
              });

              const authUser = {
                access_token: res.data.access_token,
                refresh_token: res.data.refresh_token,
              };

              window.localStorage.setItem("authUser", JSON.stringify(authUser));
              originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;

              store.dispatch("setNewUserInfo")

              originalRequest._retry = true;
              return instance(originalRequest);
            }
          } catch (e) {
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        } else {
          return new Promise((resolve, reject) => {
            failedRequests.push({ resolve, reject });
          }).then((instance) => instance(originalRequest));
        }
      }

      if (error.response && error.response.data && error.response.data.error) {
        switch (error.response.status) {
          case 400:
            toast.add({severity: "error", summary: t('error.400'), life: 3000});
            break;
          case 401:
            toast.add({severity: "error", summary: t('error.401'), life: 3000});
            store.dispatch("logLout");
            break;
          case 403:
            toast.add({severity: "error", summary: t('error.403'), life: 3000});
            break;
          case 404:
            toast.add({severity: "error", summary: t('error.404'), life: 3000});
            break;
          case 500:
            toast.add({severity: "error", summary: t('error.500'), life: 3000});
            break;
          default:
            toast.add({severity: "error", summary: t('error.unknown'), life: 3000});
        }
      }

      return Promise.reject(error);
    }
  );

  function retryFailedRequests(instance) {
    failedRequests.forEach((request) => {
      request.resolve ? request.resolve(instance) : request.reject(instance);
    });
    failedRequests.length = 0;
  }

  instance.interceptors.response.use(
    (response) => {
      retryFailedRequests(instance);
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        store.dispatch("solveAttemptedUrl", router.currentRoute.value);
        store.dispatch("logLout");
      }

      retryFailedRequests(instance);
      return Promise.reject(error);
    }
  );
};

export default setup;
