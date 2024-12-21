import api from './api';
import {getHeader} from "@/config/config";

export class ShowcaseService {

    getShowcase(data) {
        return api.post("/showcase/get", data, {headers: getHeader()})
    }
    createShowcase(data) {
        return api.post("/showcase/create", data, {headers: getHeader()})
    }
    deleteShowcase(data) {
        return api.post("/showcase/delete", data, {headers: getHeader()})
    }
    updateStatus(data) {
        return api.post("/showcase/update/state", data, {headers: getHeader()})
    }
    hideShowcase(data) {
        return api.post("/showcase/hide", data, {headers: getHeader()})
    }
}