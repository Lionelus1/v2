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
}
