import { getMultipartHeader } from "../config/config";
import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class HelpDeskService {
    helpDeskTicketCreate(data) {
        return api.post("/helpdesk/ticket/create", data, {headers: getHeader()});
    }

    helpDeskTicketGet(data) {
        return api.post("/helpdesk/ticket/get", data, {headers: getHeader()});
    }

    helpDeskDeleteTicket(data){
        return api.post("/helpdesk/ticket/delete", data, {headers: getHeader()});
    }

    helpDeskCategoryGet(params) {
        return api.post(`/helpdesk/category/get`, params, {headers: getHeader()});
    }

    helpDeskDocApproval(data){
        return api.post(`/helpdesk/doc/approval`, data, {headers: getHeader()});
    }
    helpDeskDocumentRevision(data){
        return api.post(`/helpdesk/doc/revision`, data, {headers: getHeader()})
    }
    helpDeskStudentInfo(data){
        return api.post(`/helpdesk/studentInfo`, data, {headers: getHeader()})
    }
    helpDeskTicketForm(data){
        return api.post(`helpdesk/ticketForm`, data, {headers: getHeader()});
    }
    helpDeskUpdateCategory(data) {
        return api.post(`/helpdesk/update/category`, data, {headers: getHeader()})
    }
    helpDeskUpdateCategoryLine(data){
        return api.post(`/helpdesk/update/categoryLine`, data, {headers: getHeader()})
    }
    helpDeskGetCategoryLine(data){
        return api.post(`/helpdesk/get/categoryLine`,data, {headers: getHeader()})
    }
}