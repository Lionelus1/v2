import api from "@/service/api";
import {getHeader} from "@/config/config";

export class AdmissionInfoService {

    getAdmissionInfoList() {
        return api.get(`/web/getAdmissionInfos`, {headers: getHeader()});
    }

    getAdmissionInfoById(id) {
        return api.get(`/web/getAdmissionInfoById/${id}`, {headers: getHeader()});
    }

    getAdmissionInfoByCategory(id) {
        return api.get(`/web/getAdmissionInfoById/${id}`, {headers: getHeader()});
    }

    addAdmissionInfo(data) {
        return api.post(`/web/addAdmissionInfo`, data, {headers: getHeader()});
    }

    editAdmissionInfo(data) {
        return api.post(`/web/editAdmissionInfo`, data, {headers: getHeader()});
    }

    deleteAdmissionInfo(id) {
        return api.post(`/web/deleteAdmissionInfo`, {id: id}, {headers: getHeader()});
    }

}