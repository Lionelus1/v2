import api from "@/service/api";
import {getHeader} from "@/config/config";

export class UserService {
    
    getUserAccount(data) {
        return api.post(`/user/account/get`, data, {headers: getHeader()});
    }
    
    updateUserAccountHandler(data) {
        return api.post(`/user/account/update`, data, {headers: getHeader()});
    }

    deleteEducation(data) {
        return api.post(`/user/account/academicdegree/delete`, data, {headers: getHeader()});
    }

    updateAccount(data) {
        return api.post(`/account/info/update`, data, {headers: getHeader()});
    }

    getUserAcademicDegree(data) {
        return api.post(`/user/account/academicdegree/get`, data, {headers: getHeader()});
    }

    createOrUpdateUserAcademicDegree(data) {
        return api.post(`/user/account/academicdegree/create`, data, {headers: getHeader()});
    }

}