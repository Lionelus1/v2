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

    helpDeskCategoryGet(params) {
        return api.post(`/helpdesk/category/get`, params, {headers: getHeader()});
    }
}