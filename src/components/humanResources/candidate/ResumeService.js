import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default class ResumeService {

    createCandidate() {
        return axios.post(
            smartEnuApi + "/candidate/create",
            {},
            {headers: getHeader()}
        )
    }

    deleteCandidate(candidateId) {
        return axios.post(
            smartEnuApi + "/candidate/delete",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidate() {
        return axios.post(
            smartEnuApi + "/candidate/get",
            {},
            {headers: getHeader()}
        )
    }

    getCandidateEducations(candidateId) {
        return axios.post(
            smartEnuApi + "/candidate/education/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateAcademicDegrees(candidateId) {
        return axios.post(
            smartEnuApi + "/candidate/academic-degree/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateAcademicTitles(candidateId) {
        return axios.post(
            smartEnuApi + "/candidate/academic-title/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateLanguages(candidateId) {
        return axios.post(
            smartEnuApi + "/candidate/language/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateWorkExperiences(candidateId) {
        return axios.post(
            smartEnuApi + "/candidate/experience/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateRefresherCourses(candidateId) {
        return axios.post(
            smartEnuApi + "/candidate/refresher-course/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateReferees(candidateId) {
        return axios.post(
            smartEnuApi + "/candidate/referee/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateIdentificationDetail(candidateId) {
        return axios.post(
            smartEnuApi + "/candidate/id/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateAcademicDetail(candidateId) {
        return axios.post(
            smartEnuApi + "/candidate/academic-detail/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }
}
