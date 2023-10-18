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
}