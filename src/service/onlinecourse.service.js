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
    updateUserState(courseHistoryID, studentID, state) {
        return api.post('/onlinecourse/updateUserState', {"course_history_id": courseHistoryID, "student_id": studentID, "state": state}, {headers:getHeader()});
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
    getCourseStudents(data) {
        return api.post(`/onlinecourse/students`, data, { headers: getHeader()});
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
    deleteModule(id) {
        return api.post('/onlinecourse/deleteModule', {id: parseInt(id)}, {headers:getHeader()});
    }
    updateModuleOfCourse(data){
        return api.post('onlinecourse/updateModule', data, {headers:getHeader()});
    }
    updateCourseOrganizerLastNumber(data){
        return api.post('onlinecourse/organizers/updateLastNumber', data, {headers:getHeader()});
    }
    getCourseOrganizerByCourseID(courseID) {
        return api.get(`onlinecourse/organizers/${courseID}`, {headers: getHeader()});
    }
}