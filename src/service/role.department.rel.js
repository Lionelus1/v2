import api from "@/service/api";
import {getHeader} from "@/config/config";

export default class RoleDepartmentRel {
    getDepartmentRoleRel(data) {
        return api.post('/departmentRoleRel/get', data, {headers: getHeader()});
    }

    insertDepartmentRoleRel(data) {
        return api.post('/departmentRoleRel/insert', data, {headers: getHeader()});
    }

    deleteDepartmentRoleRel(data) {
        return api.post('/departmentRoleRel/delete', data, {headers: getHeader()});
    }
}