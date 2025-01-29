import api from "@/service/api";
import {getHeader} from "@/config/config";

export class AccountService {
    
    getMyAccount(data) {
        return api.post(`/account/getAccount`, data, {headers: getHeader()});
    }

    deleteEducation(data) {
        return api.post(`/account/education/delete/id`, data, {headers: getHeader()});
    }

    updateAccount(data) {
        return api.post(`/account/info/update`, data, {headers: getHeader()});
    }

    getAttempt(data) {
        return api.post(`/user/account/attempt`, data, {headers: getHeader()});
    }

    getSettings() {
        return api.get(`/smartenu/settings/get`, {headers: getHeader()});
    }

    saveSettings(data) {
        return api.post(`/smartenu/settings/insert`, data, {headers: getHeader()});
    }

}