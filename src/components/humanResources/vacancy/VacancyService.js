import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

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

    createOrUpdateVacancy(value, path) {
        return axios.post(
            smartEnuApi + path,
            value,
            {headers: getHeader()}
        )
    }

    vacancyAction(vacancyId, userId, path) {
        return axios.post(
            smartEnuApi + path,
            {
                id: vacancyId,
                userId: userId
            },
            {headers: getHeader}
        )
    }
}