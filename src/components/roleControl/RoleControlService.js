import axios from "axios";
import {getHeader, getMultipartHeader, smartEnuApi} from "@/config/config";

export const RIGHTS = {
    MAIN_ADMINISTRATOR: 'main_administrator',
    HEAD_OF_COMPANY: 'head_of_company'
}

export default class RoleControlService {
    getOrganizations(orgParams) {
        return axios.post(
            smartEnuApi + "/roleControl/organizations",
            orgParams,
            {headers: getHeader()}
        )
    }

    getRoleRelations(lazyParams) {
        return axios.post(
            smartEnuApi + "/roleControl/roleRelations",
            lazyParams,
            {headers: getHeader()}
        )
    }

    deleteRoleRelation(roleId) {
        return axios.post(
            smartEnuApi + "/roleControl/delete",
            {id: roleId},
            {headers: getHeader()}
        )
    }

    addRoleRelation(params) {
        return axios.post(
            smartEnuApi + "/roleControl/add",
            params,
            {headers: getHeader()}
        )
    }

    getRoles(orgId) {
        return axios.post(
            smartEnuApi + "/roleControl/roles",
            {orgId: orgId},
            {headers: getHeader()}
        )
    }

    getEmployeeByIIN(iin) {
        return axios.post(
            smartEnuApi + "/roleControl/getEmployee",
            {IIN: iin},
            {headers: getHeader()}
        )
    }
}