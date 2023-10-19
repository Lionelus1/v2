import { createStore } from "vuex"
import createPersistedState from 'vuex-persistedstate'
import axios from "axios";
import { getHeader, smartEnuApi } from "@/config/config";
import router from '@/router';


const store = createStore({
    plugins: [createPersistedState()],
    state: {

        loginedUser: {},
        token: "",
        attemptedUrl:"",
        userSlug: {}
    },
    mutations: {
        SET_LOGINED_USER(state) {
            //alert("yess");
            state.loginedUser = JSON.parse(window.localStorage.getItem('loginedUser'));
            //alert(JSON.stringify(state.loginedUser))
            state.token = JSON.parse(window.localStorage.getItem('authUser')).access_token;

        },
        SOLVE_ATTEMPT(state,data){
            state.attemptedUrl=data;
        },
        LOG_OUT_SYSTEM(globalState) {
            globalState.loginedUser={};
            globalState.token = "";
            axios.post(smartEnuApi + "/logoutsystem", {}, { headers: getHeader() })
                .then(() => {
                    localStorage.removeItem('authUser');
                    localStorage.removeItem('loginedUser');
                    localStorage.removeItem('journalCurrentPage');
                    localStorage.removeItem('contractFilters');
                    localStorage.removeItem('userSlug')
                    localStorage.removeItem('selectedSlug')
                    router.push({ "name": "PublicVacancies" })
                })
                .catch((err) => {
                    //alert(JSON.stringify(err))
                    localStorage.removeItem('authUser');
                    localStorage.removeItem('loginedUser');
                    localStorage.removeItem('userSlug');
                    localStorage.removeItem('selectedSlug')
                
                    router.push({ "name": "/login" })
                })

        },
        USER_SITE_SLUG(state) {
            state.userSlug = JSON.parse(window.localStorage.getItem('userSlug'));
        },
        REMOVE_USER_SITE_SLUG(state) {
            state.userSlug = {}
        },
        REFRESH_TOKEN(state) {
            const tokenData = JSON.parse(window.localStorage.getItem("authUser"));
            let authUser = {}
            axios.post("/refreshToken", {
              refresh_token: tokenData.refresh_token,
            }).then(res => {
              authUser.access_token = res.data.access_token;
              authUser.refresh_token = res.data.refresh_token;
              window.localStorage.setItem('authUser', JSON.stringify(authUser));
            }).catch(error => {
                console.log('refresh token error')
            });
          }
    },
    actions: {
        setLoginedUser(context) {
            //alert("it shoild be call the state");
            context.commit("SET_LOGINED_USER");
        },
        logLout(context) {
            context.commit("LOG_OUT_SYSTEM");
            context.commit("REMOVE_USER_SITE_SLUG")
        },
        solveAttemptedUrl(context,data){
            if(data.fullPath){
                context.commit("SOLVE_ATTEMPT",data.fullPath);
            }else{
                context.commit("SOLVE_ATTEMPT","");
            }
            
        },
        setUserSiteSlug(context) {
            context.commit("USER_SITE_SLUG")
        },
        removeUserSiteSlug(context) {
            context.commit("REMOVE_USER_SITE_SLUG")
        },
        refreshToken(context) {
            context.commit('REFRESH_TOKEN')
        }
    },
    getters: {
        isAuthenticated: state => !!state.token,
        isMainAdministrator: state => state.loginedUser && state.loginedUser.roles && state.loginedUser.roles.some(role => role.name === 'main_administrator')
    }

})

export default store