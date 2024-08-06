import api from "@/service/api";
import {getHeader} from "@/config/config";

export class ScienceService {
    getScientists(data) {
        return api.post('/science/scientists', data, {headers: getHeader()});
    }

    getScienceInterests(data) {
        return api.post('/science/interests', data, {headers: getHeader()})
    }

    createOrUpdateScienceInterests(data) {
        return api.post('/science/interests/create', data, {headers: getHeader()})
    }

    deleteScienceInterests(data) {
        return api.post('/science/interests/delete', data, {headers: getHeader()})
    }

    getLaborActivity(data) {
        return api.post('/science/laborActivity', data, {headers: getHeader()})
    }

    deleteLaborActivity(data) {
        return api.post('/science/laborActivity/delete', data, {headers: getHeader()})
    }

    getScienceAward(data) {
        return api.post('/science/award', data, {headers: getHeader()})
    }
    
    addOrUpdateScienceAward(data) {
        return api.post('/science/award/addOrUpdate', data, {headers: getHeader()})
    }

    deleteAwards(data) {
        return api.post('/science/award/delete', data, {headers: getHeader()})
    }

    getQualificationsScience(data) {
        return api.post('/science/qualifications', data, {headers: getHeader()})
    }

    createOrUpdateQualificationsScience(data) {
        return api.post('/science/qualifications/add', data, {headers: getHeader()})
    }

    deleteQualificationsScience(data) {
        return api.post('/science/qualifications/delete', data, {headers: getHeader()})
    }

    getScienceEditions(data) {
        return api.post('/science/editions', data, {headers: getHeader()})
    }
    
    addScienceEditions(data) {
        return api.post('/science/editions/add', data, {headers: getHeader()})
    }

    getScienceEditionsRequest(data) {
        return api.post('/science/editions/request', data, {headers: getHeader()})
    }

    addScienceEditionsRequest(data) {
        return api.post('/science/editions/request/add', data, {headers: getHeader()})
    }

    updateScienceEditionsRequestStatus(data) {
        return api.post('/science/editions/request/status/update', data, {headers: getHeader()})
    }

    deleteScienceEdition(data) {
        return api.post('/science/editions/delete', data, {headers: getHeader()})
    }

    importSciencePublicationOfScientist(data) {
        return api.post('/science/editions/import', data, {headers: getHeader()})
    }

    getAwardTypes() {
        return api.get("/science/award/awardType", {headers: getHeader()})
    }

    getSourceOfFinance() {
        return api.get("/science/qualifications/fundingSource", {headers: getHeader()})
    }

    getQualificationForms() {
        return api.get("/science/qualifications/trainingForm", {headers: getHeader()})
    }

    getProfDocumentType() {
        return api.get("/science/qualifications/profDocumentType", {headers: getHeader()})
    }

    getScienceSchools(data) {
        return api.post("/science/school/get", data, {headers: getHeader()})
    }

    scienceSchoolUpdate(data) {
        return api.post('/science/school/update', data, {headers: getHeader()})
    }

    scienceSchoolDelete(data) {
        return api.post('/science/school/delete', data, {headers: getHeader()})
    }

    getScientificGrants(data) {
        return api.post('/science/scientific/grant/get', data, {headers: getHeader()})
    }

    updateScientificGrant(data) {
        return api.post('/science/scientific/grant/update', data, {headers: getHeader()})
    }

    deleteScientificGrant(data) {
        return api.post('/science/scientific/grant/delete', data, {headers: getHeader()})
    }

    getScientificGrantPositions(data) {
        return api.post('/science/scientific/grant/position', data, {headers: getHeader()})
    }
}