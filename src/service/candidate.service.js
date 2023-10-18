import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class CandidateService {
    documentsCreate(data) {
        return api.post("/candidate/documents/create", data, {headers: getHeader()});
    }

    academicTitleCreateOrUpdate(url, data) {
        return api.post(url, data, {headers: getHeader()});
    }

    candidateLanguageCreateOrUpdate(url, data) {
        return api.post(url, data, {headers: getHeader()});
    }

    documentsDownload(data) {
        return api.post("/candidate/documents/download", data, {headers: getHeader()});
    }

    resumeDownload(data) {
        return api.post("/candidate/resume/download", data, {headers: getHeader()});
    }

    documentsExistence(data) {
        return api.post("/candidate/documents/existence", data, {headers: getHeader()});
    }

    getUserCandidate(data) {
        return api.post("/candidate/get", data, {headers: getHeader()});
    }
    create(data) {
        return api.post("/candidate/create", data, {headers: getHeader()});
    }
    delete(data) {
        return api.post("/candidate/delete", data, {headers: getHeader()});
    }
    academicDetailCreateOrUpdate(url, data) {
        return api.post(url, data, {headers: getHeader()});
    }
    educationCreateOrUpdate(url, data) {
        return api.post(url, data, {headers: getHeader()});
    }
    experienceCreateOrUpdate(url, data) {
        return api.post(url, data, {headers: getHeader()});
    }
    idCreateOrUpdate(url, data) {
        return api.post(url, data, {headers: getHeader()});
    }
    infoUpdate(data) {
        return api.post("/candidate/info/update", data, {headers: getHeader()});
    }
    refereeCreateOrUpdate(url, data) {
        return api.post(url, data, {headers: getHeader()});
    }
    refresherCourseCreateOrUpdate(url, data) {
        return api.post(url, data, {headers: getHeader()});
    }
    academicDegreeDelete(data) {
        return api.post("/candidate/academic-degree/delete", data, {headers: getHeader()});
    }
    academicDetailDelete(data) {
        return api.post("/candidate/academic-detail/delete", data, {headers: getHeader()});
    }
    academicTitleDelete(data) {
        return api.post("/candidate/academic-title/delete", data, {headers: getHeader()});
    }
    educationDelete(data) {
        return api.post("/candidate/education/delete", data, {headers: getHeader()});
    }
    idDelete(data) {
        return api.post("/candidate/id/delete", data, {headers: getHeader()});
    }
    languageDelete(data) {
        return api.post("/candidate/language/delete", data, {headers: getHeader()});
    }
    refereeDelete(data) {
        return api.post("/candidate/referee/delete", data, {headers: getHeader()});
    }
    refresherCourse(data) {
        return api.post("/candidate/refresher-course/delete", data, {headers: getHeader()});
    } 
    experienceDelete(data) {
        return api.post("/candidate/experience/delete", data, {headers: getHeader()});
    }
}