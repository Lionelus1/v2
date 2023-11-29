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

}