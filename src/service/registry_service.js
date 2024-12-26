import api from "./api";
import {getHeader} from "../config/config";


export default class RegistryService {
    createRegistry(data){
        return api.post(`/registry/create`, data, {headers: getHeader()})
    }
    getRegistry(data) {
        return api.post(`/registry/get`, data, {headers: getHeader()})
    }

    getRegistryParameters(data) {
        return api.post(`/registry/parameter`, data, { headers: getHeader() });
    }

    createRegistryParameter(data) {
        return api.post(`/registry/parameter/create`, data, { headers: getHeader() });
    }

    updateRegistryParameters(data) {
        return api.post(`/registry/parameter/update`, data, { headers: getHeader() });
    }

    deleteRegistryParameters(data) {
        return api.post(`/registry/parameter/delete`, data, { headers: getHeader() });
    }
}