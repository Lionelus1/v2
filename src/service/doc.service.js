import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class DocService {
    uploadRelatedDocs(data) {
        return api.post("/doc/uploadRelatedDocs", data, {headers: getFileHeader()});
    }
    getRelatedDocs(data) {
        return api.post("/doc/getRelatedDocs", data, {headers: getHeader()});
    }
    downloadCms(data) {
        return api.post("/doc/downloadCms", data, {headers: getHeader()});
    }
    docSign(data){
        return api.post("/doc/sign", data, {headers: getHeader()});
    }
    docSendTorevision(data) {
        return api.post("/doc/sendtorevision", data, {headers: getHeader()});
    }
    checkDataAttaching(data) {
        return api.post("/doc/check-data-attaching", data, {headers: getHeader()});
    }
    docVerify(data) {
        return api.post("/doc/verify", data, {headers: getHeader()});
    }
    getFoldersByType(data) {
        return api.post("/doc/getFoldersByType", data, {headers: getHeader()});
    }
    documentDownload(data) {
        return api.post("/document/download", data, {headers: getHeader()});
    }
    docRemoveFile(data) {
        return api.post("/doc/removeFile", data, {headers: getHeader()});
    }
    docUpdateFile(data) {
        return api.post("/doc/updateFile", data, {headers: getHeader()});
    }

    docDeleteFile(data) {
        return api.post("/doc/deleteFile", data, {headers: getHeader()});
    }

    docDeleteFolder(data) {
        return api.post("/doc/deleteFolder", data, {headers: getHeader()});
    }

    showFolder(data) {
        return api.post("/doc/showFolder", data, {headers: getHeader()});
    }
    showFile(data) {
        return api.post("/doc/showFile", data, {headers: getHeader()});
    }

    documents(data) {
        return api.post("/doc/showFile", data, {headers: getHeader()});
    }
    documentDelete(data) {
        return api.post("/document/delete", data, {headers: getHeader()});
    }

    sendtoapprovebystage(data) {
        return api.post("/document/sendtoapprovebystage", data, {headers: getHeader()});
    }

    documentRevision(data) {
        return api.post("/document/revision", data, {headers: getHeader()});
    }
  
    getFolders(data) {
        return api.post("/folders", data,  {headers: getHeader()});
    }

    documentTemplates(data) {
        return api.post("/document/templates", data,  {headers: getHeader()});
    }

    getDocuments(data) {
        return api.post("/documents", data,  {headers: getHeader()});
    }
    getDocument(docId) {
        return api.get("/documents/" + docId,  {headers: getHeader()});
    }

    share(data) {
        return api.post("/document/share", data,  {headers: getHeader()});
    }

    newRequest(data) {
        return api.post("/document/newRequest", data,  {headers: getHeader()});
    }

    docrequests(data) {
        return api.post("/docrequests", data,  {headers: getHeader()});
    }

    docrequestUpdate(data) {
        return api.post("/docrequests/update", data,  {headers: getHeader()});
    }

    documentGet(data) {
        return api.post("/document/get", data,  {headers: getHeader()});
    }

    documentCreate(data) {
        return api.post("/document/create", data,  {headers: getHeader()});
    }
    
}   