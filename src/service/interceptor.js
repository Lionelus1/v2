import instance from "./api";
import router from "@/router";
import axios from "axios";
import { smartEnuApi } from "../config/config";

let isRefreshing = false;
const failedRequests = [];

const setup = (store, app) => {
  const configG = app.config.globalProperties;

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