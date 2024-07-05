import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class OrganizationService {
    departments(data) {
        return api.post("/departments", data, {headers: getHeader()});
    }
}