import api from "./api";
import {getHeader, getMultipartHeader,} from "@/config/config";

export class VacancyService {
    
    vacancyUser(data) {
        return api.post('/vacancy/user',data, {headers: getHeader()});
    }

    petition(data) {
        return api.post('/vacancy/petition',data, {headers: getHeader()});
    }

    report(data) {
        return api.post('/vacancy/report',data, {headers: getHeader()});
    }

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
        return api.post(
            '/vacancy/' + path,
            {
                id: vacancyId,
            },
            {headers: getHeader()}
        )
    }

    applyAction(request, path) {
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

    single(data) {
        return api.post('/vacancy/single',data, {headers: getHeader()});
    }

    sources(data) { 
        return api.post('/vacancy/sources',data, {headers: getHeader()});
    }

    vacancyApply(data) {
        return api.post('/vacancy/apply',data, {headers: getHeader()});
    }

    public(data) {
        return api.post('/vacancy/public',data, {headers: getHeader()});
    }

    getDetailsList(data) {
        return api.post('/getDetailsList',data, {headers: getHeader()});
    }

    getAllVaccines() {
        return api.get('/getAllVaccines', {headers: getHeader()});
    }

    getMyDetails() {
        return api.get('/getMyDetails', {headers: getHeader()});
    }

    downloadFile(data) {
        return api.post('/vaccine/downloadFile',data, {headers: getHeader()});
    }

    addNewVaccine(data) {
        return api.post('/addNewVaccine',data, {headers: getHeader()});
    }

    updateMyDetails(data) {
        return api.post('/updateMyDetails',data, {headers: getHeader()});
    }
}
