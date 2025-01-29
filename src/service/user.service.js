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

    getUser(data) {
        return api.post('/getUser',data, {headers: getHeader()});
    }

    addDepartment(data) {
        return api.post('/add-department',data, {headers: getHeader()});
    }
    getDepartments(data) {
        return api.post('/getdepartments', data, {headers: getHeader()})
    }

    departments(data) {
        return api.post('/departments', data, {headers: getHeader()})
    }

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