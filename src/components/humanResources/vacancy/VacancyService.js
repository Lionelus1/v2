import axios from "axios";
import {getHeader, getMultipartHeader, smartEnuApi} from "@/config/config";

export const RIGHTS = {
    MAIN_ADMINISTRATOR: 'main_administrator',
    HR_ADMINISTRATOR: 'hr_administrator',
    HR_MODERATOR: 'hr_moderator',
    CAREER_ADMINISTRATOR: 'career_administrator',
    CAREER_MODERATOR: 'career_moderator'
}

export default class VacancyService {


    actions = [
        {
            alias: 'submit',
            label: 'common.action.submit',
            visible: true,
        },
        {
            alias: 'accept',
            label: 'common.action.accept',
            visible: true
        },
        {
            alias: 'not-accept',
            label: 'common.action.notAccept',
            visible: true
        },
        {
            alias: 'send-to-approve',
            label: 'common.action.sendToApprove',
            visible: true
        },
        {
            alias: 'approve',
            label: 'common.action.approve',
            visible: true
        },
        {
            alias: 'publish',
            label: 'common.action.publish',
            visible: true
        }
    ]

    applyActions = [
        {
            alias: 'interview',
            label: 'hr.action.interview',
            visible: true,
        },
        {
            alias: 'hire',
            label: 'hr.action.hire',
            visible: true,
        },
        {
            alias: 'not-hire',
            label: 'hr.action.notHire',
            visible: true,
        },
        {
            alias: 'reserve',
            label: 'hr.action.reserve',
            visible: true,
        }
    ]


    getVacancies(lazyParams) {
        return axios.post(
            smartEnuApi + "/vacancy/all",
            lazyParams,
            {headers: getHeader(),}
        )
    }


    createOrUpdateVacancy(value, path) {
        return axios.post(
            smartEnuApi + path,
            value,
            {headers: getHeader()}
        )
    }

    vacancyAction(vacancyId, path) {
        console.log(vacancyId + ', ' + path)
        return axios.post(
            smartEnuApi + '/vacancy/' + path,
            {
                id: vacancyId,
            },
            {headers: getHeader()}
        )
    }

    applyAction(request, path) {
        console.log(request)
        console.log(path)
        return axios.post(
            smartEnuApi + '/vacancy/apply/' + path,
            request,
            {headers: getHeader()}
        )
    }

    downloadLetter(vacancyId, userId) {
        return axios.post(
            smartEnuApi + '/vacancy/download/letter',
            {
                vacancyId: vacancyId,
                userId: userId
            },
            {headers: getHeader()}
        )
    }

    checkAction(statusId) {
        console.log(statusId)
        return axios.post(
            smartEnuApi + '/vacancy/check/action',
            {
                statusId: statusId
            },
            {headers: getHeader()}
        )
    }

    checkApplyAction(statusId) {
        console.log(statusId)
        return axios.post(
            smartEnuApi + '/vacancy/check/apply/action',
            {
                statusId: statusId
            },
            {headers: getHeader()}
        )
    }

    deleteVacancy(vacancyId) {
        return axios.post(
            smartEnuApi + "/vacancy/delete",
            {id: vacancyId},
            {headers: getHeader()}
        )
    }

    rightsValidity() {
        return axios.get(
            smartEnuApi + '/vacancy/rights/validity',
            {headers: getHeader()}
        )
    }

    generatePetitionPdf(petition) {
        return axios.post(
            smartEnuApi + '/vacancy/petition/pdf',
            petition,
            {headers: getHeader()}
        )
    }
    sendSign(fd) {
        return axios.post(
            smartEnuApi + '/vacancy/petition/sign',
            fd,
            {headers: getMultipartHeader()}
        )
    }
}


