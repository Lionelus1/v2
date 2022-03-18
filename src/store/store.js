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
        attemptedUrl:""
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
                    router.push({ "name": "PublicVacancies" })
                })
                .catch((err) => {
                    //alert(JSON.stringify(err))
                    localStorage.removeItem('authUser');
                    localStorage.removeItem('loginedUser');
                
                    router.push({ "name": "/login" })
                })

        }
    },
    actions: {
        setLoginedUser(context) {
            //alert("it shoild be call the state");
            context.commit("SET_LOGINED_USER");
        },
        logLout(context) {
            context.commit("LOG_OUT_SYSTEM");
        },
        solveAttemptedUrl(context,data){
            if(data.fullPath){
                context.commit("SOLVE_ATTEMPT",data.fullPath);
            }else{
                context.commit("SOLVE_ATTEMPT","");
            }
            
        }
    },
    getters: {
        isAuthenticated: state => !!state.token,

    }

})

export default store