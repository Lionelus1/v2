import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class ContragentService {
    initApiCall(data) {
        return api.post("/contragent/banks", data,  { headers: getHeader()});
    }
    getOrgForms() {
        return api.get("/contragent/orgforms", {headers: getHeader()});
    }

    updateOrg(data) {
        return api.post("/contragent/updateorg", data, {headers: getHeader()});
    }

    initOurside(data) {
        return api.post("/contragent/get", data, {headers: getHeader()});
    }

    persons(data) {
        return api.post("/contragent/persons", data, {headers: getHeader()});
    }

    organizations(data) {
        return api.post("/contragent/organizations", data, {headers: getHeader()});
    }
    contragents(data) {
        return api.post("/contragent/contragents", data, {headers: getHeader()});
    }

    getOrganizations(data) {
        return api.post("/organizations", data, {headers: getHeader()});
    }
    updateOrganization(data) {
        return api.post("/organization/update", data, {headers: getHeader()});
    }
    getOrganizationForms() {
        return api.get("/organization/forms", {headers: getHeader()});
    }
    getPersons(data, cancelToken) {
        return api.post("/getUser", data, {headers: getHeader(), cancelToken: cancelToken});
    }
    getLocality(data) {
        return api.post("/locality", data, {headers: getHeader()});
    }
    getCooperations(data) {
        return api.post("/organization/cooperation", data, {headers: getHeader()});
    }
    getCooperationSubjects(data) {
        return api.post("/organization/cooperation/subject", data, {headers: getHeader()});
    }
    updateCooperation(data) {
        return api.post("/organization/cooperation/update", data, {headers: getHeader()});
    }
    deleteCooperation(data) {
        return api.post("/organization/cooperation/delete", data, {headers: getHeader()});
    }
    createCooperationSubject(data) {
        return api.post("/organization/cooperation/subject/create", data, {headers: getHeader()});
    }
    getRatings(data){
        return api.post("/organization/rating", data, {headers: getHeader()});
    }
    updateRating(data) {
        return api.post("/organization/rating/update", data, {headers: getHeader()});
    }
    deleteRating(data) {
        return api.post("/organization/rating/delete", data, {headers: getHeader()});
    }
    getDepartments(data) {
        return api.post('/departments', data, {headers: getHeader()});
    }
    getResume(data) {
        return api.post('/candidate/generate/resume', data,{headers: getHeader()});
    }
    checkResume(data) {
        return api.post('/candidate/check/resume', data, {headers: getHeader()});
    }
}