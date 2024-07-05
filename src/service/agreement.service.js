import api from "@/service/api";
import {getHeader} from "@/config/config";

export class AgreementService {
    getSignInfo(data) {
        return api.post("/agreement/getSignInfo", data, {headers: getHeader()});
    }
    sendtosign(data) {
        return api.post("/agreement/sendtosign", data, {headers: getHeader()});
    }
    sendToApprove(data) {
        return api.post("/agreement/sendtoapprove", data, {headers: getHeader()});
    }
    getAgreement(data) {
        return api.post("/agreement/get", data, {headers: getHeader()});
    }
    getApprovalStages(data) {
        return api.post("/agreement/getApprovalStages", data, {headers: getHeader()});
    }
    updatedocparams(data) {
        return api.post("/agreement/updatedocparams", data, {headers: getHeader()});
    }
    getpdf(data) {
        return api.post("/agreement/getpdf", data, {headers: getHeader()});
    }
    setnumber(data) {
        return api.post("/agreement/setnumber", data, {headers: getHeader()});
    }
    updateApprovalStages(data) {
        return api.post("/agreement/updateApprovalStages", data, {headers: getHeader()});
    }
    createAgreement(data) {
        return api.post("/agreement/create", data, {headers: getHeader()});
    }
    getJournal(data) {
        return api.post("/agreement/journal", data, {headers: getHeader()});
    }
}
