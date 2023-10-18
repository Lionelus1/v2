import api from "./api";
import {getHeader} from "@/config/config";

export class UserService {
    loginedUserInfo() {
        return api.get('/logineduserinfo', {headers: getHeader()});
    }
    getUserSlug() {
        return api.get('/getUserSlug', {headers: getHeader()});
    }
    insertOrUpdateUser(url, data) {
        return api.post(url, data, {headers: getHeader()});
    }
    updateUser(data) {
        return api.post('/updateUser', data, {headers: getHeader()});
    }
    getCurrentUserType() {
        return api.get('/getCurrentUserType', {headers: getHeader()});
    }
    getDictionary(data) {
        return api.post('/auth/getDictionary',data, {headers: getHeader()});
    }
    getRoleRelations(data) {
        return api.post('/auth/getDictionary',data, {headers: getHeader()});
    }

    getUser(data, token) {
        return api.post('/getUser',data, {headers: getHeader(), cancelToken: token});
    }
    addDepartment(data) {
        return api.post('/add-department',data, {headers: getHeader()});
    }
 }