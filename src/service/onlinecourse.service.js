import api from "./api";
import {getHeader} from "@/config/config";

export class OnlineCourseService {

    saveCertificateTemplate(data) {
        return api.post('/certificate/update', data, {headers: getHeader()});
    }
    getCertificateTemplateJournal(data) {
        return api.post('/certificate/templates', data, {headers:getHeader()});
    }
    getCertificateJournal(data) {
        return api.post('/certificate/journal', data, {headers:getHeader()});
    }
    updateCourseOrganizer(data) {
        return api.post('/onlinecourse/updateOrganizer', data, {headers:getHeader()});
    }
    getCourseOrganizers(data) {
        return api.post('/onlinecourse/organizers', data, {headers:getHeader()});
    }
    updateCourseCategory(data) {
        return api.post('/onlinecourse/updateCategory', data, {headers:getHeader()});
    }
    getCourseCategories(data) {
        return api.post('/onlinecourse/categories', data, {headers:getHeader()});
    }
    getCourses(data) {
        return api.post('/onlinecourse/courses', data, {headers:getHeader()});
    }
    getModulesByCourseID(courseID) {
        return api.get(`/onlinecourse/getModulesByCourseId/${courseID}`, { headers: getHeader() });
    }
    getCourse(courseID) {
        return api.get(`/onlinecourse/course/${courseID}`, {headers: getHeader()});
    }
    getCourseStudents(courseID,page,rows) {
        return api.get(`/onlinecourse/students/${courseID}/${page}/${rows}`, { headers: getHeader()});
    }

    getJournal(courseHistoryID, studentID) {
        return api.get(`/onlinecourse/getJournal/${courseHistoryID}/${studentID}`, { headers: getHeader()});
    }
    addStudentsToCourse(data) {
        return api.post('/onlinecourse/addStudent', data, {headers:getHeader()});
    }
    issueCertificate(data) {
        return api.post('/onlinecourse/issueCertificate', data, {headers:getHeader()});
    }
    addModulesToCourse(data){
        return api.post('/onlinecourse/addModule', data, { headers: getHeader()});
    }
    updateJournal(data) {
        return api.post('/onlinecourse/updateJournal', data, {headers:getHeader()});
    }
}