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
    getDoctorals(data){
        return api.post(`/dissertation/getdoctorals`, data, {headers: getHeader()});
    }
    deleteMember(data) {
        return api.post("/dissertation/deleteCouncilMember", data,  {headers: getHeader()});
    }
    addCouncilMember(data) {
        return api.post("/dissertation/addCouncilMember", data,  {headers: getHeader()});
    }
    getcouncilmembers(data) {
        return api.post("/dissertation/getcouncilmembers", data,  {headers: getHeader()});
    }
    startRegistration(data) {
        return api.post("/dissertation/startRegistration", data,  {headers: getHeader()});
    }
    changeDissertationState(data) {
        return api.post("/dissertation/changeDissertationState", data,  {headers: getHeader()});
    }
    vote(data) {
        return api.post("/dissertation/vote", data,  {headers: getHeader()});
    }
    checkMyVoice(data) {
        return api.post("/dissertation/checkMyVoice", data,  {headers: getHeader()});
    }
    getVoteInformation(data) {
        return api.post("/dissertation/getVoteInformation", data,  {headers: getHeader()});
    }
    getRegistrationInfo(data) {
        return api.post("/dissertation/getRegistrationInfo", data,  {headers: getHeader()});
    }

    setMeetingTime(data) {
        return api.post("/dissertation/setMeetingTime", data,  {headers: getHeader()});
    }

    deleteDissertation(data) {
        return api.post("/dissertation/deleteDissertation", data,  {headers: getHeader()});
    }

    addDoctoral(data) {
        return api.post("/dissertation/addDoctoral", data,  {headers: getHeader()});
    }

    memberregister(data) {
        return api.post("/dissertation/memberregister", data,  {headers: getHeader()});
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

    updateDoctoral(params) {
        return api.post(`/dissertation/updateDoctoral`, params, {headers: getHeader()});
    }

    newStartRegistration(data) {
        return api.post(`/dissertation/newStartRegistration`, data, {headers: getHeader()});
    }
}