import api from "@/service/api";
import {getHeader} from "@/config/config";

export class IntegrationService {

    getIntegrations(params) {
        return api.post(`/integrations`, params, {headers: getHeader()})
    }

    addIntegration(params) {
        return api.post(`/integration/add`, params, {headers: getHeader()})
    }

    editIntegration(params) {
        return api.post(`/integration/edit`, params, {headers: getHeader()})
    }

    deleteIntegration(id) {
        return api.delete(`/integration/${id}`, {headers: getHeader()})
    }

    getIntegrationParams(params) {
        return api.post(`/integration/params`, params, {headers: getHeader()})
    }

    addIntegrationParams(params) {
        return api.post(`/integration/params/add`, params, {headers: getHeader()})
    }

    editIntegrationParam(params) {
        return api.post(`/integration/params/edit`, params, {headers: getHeader()})
    }

    deleteIntegrationParam(id) {
        return api.delete(`/integration/params/${id}`, {headers: getHeader()})
    }

    getIntegration(id) {
        return api.get(`/ingetration/${id}`, {headers: getHeader()})
    }

    toggleIntegrationSync(id) {
        return api.post(`/integration/toggle/${id}`, {}, {headers: getHeader()})
    }

    runIntegrationSync(id) {
        return api.post(`/integration/run/${id}`, {headers: getHeader()})
    }

}