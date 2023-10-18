import api from "@/service/api";
import {getHeader, getMultipartHeader, smartEnuApi} from "@/config/config";

export const RIGHTS = {
    MAIN_ADMINISTRATOR: 'main_administrator',
    HEAD_OF_COMPANY: 'head_of_company'
}

export default class RoleControlService {
    getOrganizations(orgParams) {
        return api.post(
            "/roleControl/organizations",
            orgParams,
            {headers: getHeader()}
        )
    }

    getRoleRelations(lazyParams) {
        return api.post(
            "/roleControl/roleRelations",
            lazyParams,
            {headers: getHeader()}
        )
    }

    deleteRoleRelation(roleId) {
        return api.post(
            "/roleControl/delete",
            {id: roleId},
            {headers: getHeader()}
        )
    }

    addRoleRelation(params) {
        return api.post(
            "/roleControl/add",
            params,
            {headers: getHeader()}
        )
    }

    getRoles(orgId) {
        return api.post(
            "/roleControl/roles",
            {orgId: orgId},
            {headers: getHeader()}
        )
    }

    getEmployeeByIIN(iin) {
        return api.post(
            "/roleControl/getEmployee",
            {IIN: iin},
            {headers: getHeader()}
        )
    }

    getDepartments(departmentRequest) {
        return axios.post(
            smartEnuApi + "/positionRel/getDepartmentByOrgId",
            departmentRequest,
            {headers: getHeader()}
        )
    }
}