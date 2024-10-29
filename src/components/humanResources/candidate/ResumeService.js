import api from "@/service/api";
import {getHeader, smartEnuApi} from "@/config/config";

export default class ResumeService {

    createCandidate() {
        return api.post("/candidate/create",
            {},
            {headers: getHeader()}
        )
    }

    deleteCandidate() {
        return api.post("/candidate/delete",
            {},
            {headers: getHeader()}
        )
    }

    getCandidate(userID) {
        return api.post("/candidate/get",
            {userId: userID},
            {headers: getHeader()}
        )
    }

    getCandidateEducations(candidateId) {
        return api.post("/candidate/education/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateAcademicDegrees(candidateId) {
        return api.post("/candidate/academic-degree/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateAcademicTitles(candidateId) {
        return api.post("/candidate/academic-title/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateLanguages(candidateId) {
        return api.post("/candidate/language/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateWorkExperiences(candidateId) {
        return api.post("/candidate/experience/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateRefresherCourses(candidateId) {
        return api.post("/candidate/refresher-course/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateReferees(candidateId) {
        return api.post("/candidate/referee/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateIdentificationDetail(candidateId) {
        return api.post("/candidate/id/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }

    getCandidateAcademicDetail(candidateId) {
        return api.post("/candidate/academic-detail/get",
            {id: candidateId},
            {headers: getHeader()}
        )
    }
}
