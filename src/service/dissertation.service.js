import api from "@/service/api";
import {getHeader} from "@/config/config";

export class DissertationService {

    getMemberCouncils(userId) {
        return api.post(`/dissertation/getMemberCouncils`, {user_id: userId}, {headers: getHeader()})
    }

    closeCouncil(params) {
        return api.post(`/dissertation/closeCouncil`, params, {headers: getHeader()})
    }

    getCouncils(params) {
        return api.post(`/dissertation/getcouncils`, params, {headers: getHeader()});
    }

    newCouncil(params) {
        return api.post(`/dissertation/newcouncil`, params, {headers: getHeader()})
    }

    deleteCouncil(id) {
        return api.post(`/dissertation/deletecouncil`, {id: id}, {headers: getHeader()});
    }

    getMemberState() {
        return api.post(`/dissertation/getMemberState`)
    }

    getDissertationList(params) {
        return api.post(`/dissertation/addReport`, params, {headers: getHeader()});
    }
    addDissertationReportByYear(params) {
        return api.post(`/dissertation/addYearReport`, params, {headers: getHeader()});
    }
    getDissertationHtml(params) {
        return api.post(`/dissertation/htmlcode`, params, {headers: getHeader()});
    }
    dissertationReport(params) {
        return api.post(`/dissertation/report`, params, {headers: getHeader()});
    }
    dissertationReportSendToSign(params) {
        return api.post(`/dissertation/sendToSign`, params, {headers: getHeader()});
    }
    deleteReport(id) {
        return api.post(`/dissertation/deleteReport`, {id: id}, {headers: getHeader()});
    }

    updateDoctoral(params) {
        return api.post(`/dissertation/updateDoctoral`, params, {headers: getHeader()});
    }
}