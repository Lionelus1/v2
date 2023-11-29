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
}