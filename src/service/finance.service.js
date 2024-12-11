import api from "@/service/api";
import {getHeader} from "@/config/config";

export class FinanceService {

    getServiceCatalog() {
        return api.post(`/service-catalog/list`, {}, {headers: getHeader()})
    }

    addServiceCatalog(data) {
        return api.post(`/service-catalog/add`, data, {headers: getHeader()})
    }

    editServiceCatalog(data) {
        return api.post(`/service-catalog/edit`, data, {headers: getHeader()})
    }

    deleteServiceCatalog(id) {
        return api.delete(`/service-catalog/delete/${id}`, {headers: getHeader()})
    }
    getServiceFinance(){
        return api.post(`/service-catalog/finance`, {}, {headers: getHeader()})
    }
}