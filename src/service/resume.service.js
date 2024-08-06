import api from "./api";
import {getHeader, smartEnuApi} from "@/config/config";

export default class ResumeService {

    createCandidate() {
        return api.post(
            smartEnuApi + "/candidate/create",
            {},
            {headers: getHeader()}
        )
    }

    deleteCandidate() {
        return api.post(
            smartEnuApi + "/candidate/delete",
            {},
            {headers: getHeader()}
        )
    }

    getCandidate() {
        return api.post(
            smartEnuApi + "/candidate/get",
            {},
            {headers: getHeader()}
        )
    }

    getCandidateEducations(candidateId) {
        return api.post(
            smartEnuApi + "/candidate/education/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateAcademicDegrees(candidateId) {
        return api.post(
            smartEnuApi + "/candidate/academic-degree/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateAcademicTitles(candidateId) {
        return api.post(
            smartEnuApi + "/candidate/academic-title/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateLanguages(candidateId) {
        return api.post(
            smartEnuApi + "/candidate/language/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateWorkExperiences(candidateId) {
        return api.post(
            smartEnuApi + "/candidate/experience/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateRefresherCourses(candidateId) {
        return api.post(
            smartEnuApi + "/candidate/refresher-course/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateReferees(candidateId) {
        return api.post(
            smartEnuApi + "/candidate/referee/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateIdentificationDetail(candidateId) {
        return api.post(
            smartEnuApi + "/candidate/id/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateAcademicDetail(candidateId) {
        return api.post(
            smartEnuApi + "/candidate/academic-detail/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }
}
