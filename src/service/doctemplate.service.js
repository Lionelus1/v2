import api from "@/service/api";
import {getHeader} from "@/config/config";

export class DocTemplateService {
    updatedoсtemplatestate(data) {
        return api.post("/doctemplate/updatedoсtemplatestate", data, {headers: getHeader()});
    }

    toapproval(data) {
        return api.post("/doctemplate/toapproval", data, {headers: getHeader()});
    }

    getpdf(data) {
        return api.post("/doctemplate/getpdf", data, {headers: getHeader()});
    }


    update(data) {
        return api.post("/doctemplate/update", data, {headers: getHeader()});
    }

    create(data) {
        return api.post("/doctemplate/create", data, {headers: getHeader()});
    } 
    createFolder(data) {
        return api.post("/doctemplate/createFolder", data, {headers: getHeader()});
    }
    initApiCall(url) {
        return api.get(url, {headers: getHeader()});
    }

    getApprovalStages(data) {
        return api.post("/doctemplate/getApprovalStages", data, {headers: getHeader()});
    }

    updateApprovalStages(data) {
        return api.post("/doctemplate/updateApprovalStages", data, {headers: getHeader()});
    }
}