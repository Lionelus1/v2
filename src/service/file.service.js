import api from "@/service/api";
import {getHeader} from "@/config/config";

export class FileService {

    uploadFile(data) {
        return api.post("/upload", data, {headers: getHeader(), transformRequest: data});
    }

    webUploadFile(data) {
        return api.post("/webFileUpload", data, {headers: getHeader()});
    }

    getFile(params) {
        return api.post(`/getFile`, params, {headers: getHeader()});
    }
    downloadManifestFiles(data) {
        return api.post("/downloadManifestFiles", data, {headers:getHeader()})
    }
    downloadFile(data) {
        return api.post("/downloadFile", data, {headers: getHeader()})
    }
    
    getFilesDirName(dirName) {
        return api.get("getFiles?dirName="+dirName, {headers: getHeader()});
    }

    upload(data) {
        return api.post("/upload", data, {headers: getHeader(), 'Content-Type': 'multipart/form-data'})
    }

    serve(path) {
        return api.get("/serve?path="+path, {headers: getHeader()})
    }
}
