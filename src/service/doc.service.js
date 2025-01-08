import api from "./api";
import {getFileHeader, getHeader, getMultipartHeader} from "@/config/config";


export class DocService {
    uploadRelatedDocs(data) {
        return api.post("/doc/uploadRelatedDocs", data, {headers: getFileHeader()});
    }
    createRelatedDocs(data) {
        return api.post("/doc/createRelatedDocs", data, {headers: getFileHeader()});
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
        return api.post("/doc/updateFile", data, {headers:  getFileHeader()});
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
        return api.post("/documents", data, {headers: getHeader()});
    }
    documentDelete(data) {
        return api.post("/document/delete", data, {headers: getHeader()});
    }

    sendtoapprovebystage(data) {
        return api.post("/doc/sendtoapprovebystage", data, {headers: getHeader()});
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

    getStates() {
        return api.get("/getStates", {headers: getHeader()});
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
    documentTemplateCreate(data) {
        return api.post("/document/templates/create", data, {headers:getHeader()})
    }
    documentTemplateSave(data) {
        return api.post("/document/templates/save", data, {headers:getHeader()})
    }
    documentTemplateDelete(data) {
        return api.post("/document/templates/delete", data, {headers:getHeader()})
    }
    sendDocumentTemplateToApproval(data) {
        return api.post("/document/templates/sendToApprove", data, {headers:getHeader()})
    }
    documentApproveV2(data) {
        return api.post("/document/approve", data, {headers:getHeader()})
    }
    documentDenyV2(data) {
        return api.post("/document/deny", data, {headers:getHeader()})
    }
    getGPCActsStatus(data, config) {
        return api.post("/document/gpcActsStatus", data, config)
    }
    changeCurrentStageApprovals(data) {
        return api.post("/document/changeCurrentStageApprovals", data, {headers:getHeader()})
    }
    getDocParams(id){
        return api.get(`/doc/getDocParams/${id}`, {headers: getHeader()});
    }
    showDoc(data) {
        return api.post(`/document/show`, data, {headers: getHeader()});
    }
    addAdditionalInfo(data){
        return api.post(`/doc/info`, data, {headers: getHeader()});
    }
    getAdditionalInfo(id){
        return api.get(`/doc/info/${id}`, {headers: getHeader()});
    }
    downloadFile(url){
        return api.get(url, {headers: getHeader(), responseType: 'blob'});
    }
}
