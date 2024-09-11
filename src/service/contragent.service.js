import api from "./api";
import {getHeader} from "@/config/config";

export class ContragentService {
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
}
