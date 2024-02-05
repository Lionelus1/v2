import { getMultipartHeader } from "../config/config";
import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class DocService {
    uploadRelatedDocs(data) {
        return api.post("/doc/uploadRelatedDocs", data, {headers: getFileHeader()});
    }
    getRelatedDocs(data) {
        return api.post("/doc/getRelatedDocs", data, {headers: getHeader()});
    }

    documentDeleteV2(data) {
        return api.post("/document/delete", data, {headers: getHeader()});
    }
    documentTemplatesV2(data) {
        return api.post("/document/templates", data, {headers: getHeader()});
    }
    getFoldersV2(data) {
        return api.post("/folders", data, {headers: getHeader()});
    }
    getDocumentsV2(data) {
        return api.post("/documents", data, {headers: getHeader()});
    }

    getDocumentsIdsV2(data) {
        return api.post("/documents/ids", data, {headers: getHeader()});
    }

    getDocumentV2(data) {
        return api.post("/document/get", data, {headers: getHeader()});
    }
    createDocumentV2(data) {
        return api.post("/document/create", data, {headers: getHeader()});
    }
    downloadDocumentV2(data) {
        return api.post("/document/download", data, {headers: getHeader()});
    }
    registerDocumentV2(data) {
        return api.post("/document/register", data, {headers: getHeader()});
    }
    saveDocumentV2(data) {
        return api.post("/document/save", data, {headers: getHeader()});
    }
    saveDocumentMultipartV2(data) {
        return api.post("/document/save", data, {headers: getMultipartHeader()});
    }
    sendDocumentToSignV2(data) {
        return api.post("/document/sendToSign", data, {headers: getHeader()});
    }
    sendDocumentToApprovalV2(data) {
        return api.post("/document/sendToApprove", data, {headers: getHeader()});
    }
    updateDocRequestV2(data) {
        return api.post("/docrequest/update", data, {headers: getHeader()});
    }
    getDefaultApprovalList(data) {
        return api.post("/approvalList/getDefault", data, {headers: getHeader()});
    }
    createNewDocumentRequest(data) {
        return api.post("/document/newRequest", data, {headers: getHeader()});
    }
    importScienceWorksFromPlatonus() {
        return api.get("/document/scienceWorks/import/platonus", {headers: getHeader()});
    }
    importScienceWorksFromScopus() {
        return api.get("/document/scienceWorks/import/scopus", {headers: getHeader()});
    }
    documentRevisionV2(data) {
        return api.post("/document/revision", data, {headers:getHeader()})
    }
}