import api from "@/service/api";
import {getHeader, getMultipartHeader, smartEnuApi} from "@/config/config";

export const RIGHTS = {
    MAIN_ADMINISTRATOR: 'main_administrator',
    HR_ADMINISTRATOR: 'hr_administrator',
    HR_MODERATOR: 'hr_moderator',
    CAREER_ADMINISTRATOR: 'career_administrator',
    CAREER_MODERATOR: 'career_moderator',
    INITIAL_APPROVE: 'vacancy_initial_approve',
    FINAL_APPROVE: 'vacancy_final_approve'
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
        return api.post(
            "/vacancy/all",
            lazyParams,
            {headers: getHeader(),}
        )
    }


    createOrUpdateVacancy(value, path) {
        return api.post(
            path,
            value,
            {headers: getHeader()}
        )
    }

    vacancyAction(vacancyId, path) {
        console.log(vacancyId + ', ' + path)
        return api.post(
            '/vacancy/' + path,
            {
                id: vacancyId,
            },
            {headers: getHeader()}
        )
    }

    applyAction(request, path) {
        console.log(request)
        console.log(path)
        return api.post(
            '/vacancy/apply/' + path,
            request,
            {headers: getHeader()}
        )
    }

    downloadLetter(vacancyId, userId) {
        return api.post(
            '/vacancy/download/letter',
            {
                vacancyId: vacancyId,
                userId: userId
            },
            {headers: getHeader()}
        )
    }

    checkAction(statusId, vacancy) {
        console.log(statusId)
        console.log(vacancy)
        return api.post(
            '/vacancy/check/action',
            {
                statusId: statusId,
                vacancy: vacancy
            },
            {headers: getHeader()}
        )
    }

    checkApplyAction(statusId) {
        console.log(statusId)
        return api.post(
            '/vacancy/check/apply/action',
            {
                statusId: statusId
            },
            {headers: getHeader()}
        )
    }

    deleteVacancy(vacancyId) {
        return api.post(
            "/vacancy/delete",
            {id: vacancyId},
            {headers: getHeader()}
        )
    }

    rightsValidity() {
        return api.get(
            '/vacancy/rights/validity',
            {headers: getHeader()}
        )
    }

    generatePetitionPdf(petition) {
        return api.post(
            '/vacancy/petition/pdf',
            petition,
            {headers: getHeader()}
        )
    }
    sendSign(fd) {
        return api.post(
            '/vacancy/petition/sign',
            fd,
            {headers: getMultipartHeader()}
        )
    }
}


