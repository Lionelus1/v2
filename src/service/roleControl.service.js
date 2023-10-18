import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class RoleControlService {
    roleControlAdd(data) {
        return api.post("/roleControl/add", data, {headers: getHeader()});
    }
}