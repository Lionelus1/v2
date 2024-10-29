import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class PositionService {
    getRoles() {
        return api.get("/positionRoleRel/roles",  {headers: getHeader()});
    }

    getPositions() {
        return api.get("/positionRoleRel/positions",  {headers: getHeader()});
    }

    delete(data) {
        return api.post("/positionRoleRel/delete", data,  {headers: getHeader()});
    }

    create(data) {
        return api.post("/positionRoleRel/create", data,  {headers: getHeader()});
    }

    getPositionRoleRel(data) {
        return api.post("/positionRoleRel", data,  {headers: getHeader()});
    }
    getpositions() {
        return api.get("/getpositions",  {headers: getHeader()});
    }
}