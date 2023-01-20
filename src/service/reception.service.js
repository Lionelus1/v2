import api from "@/service/api";
import {getHeader} from "@/config/config";

export default class ReceptionService {

    getQuestion(data) {
        return api.post('/reception/getQuestion', data, {headers: getHeader()});
    }

    downloadFile(data) {
        return api.post('/downloadFile', data, {headers: getHeader()});
    }

    answer(data) {
        return api.post('/reception/answer', data, {headers: getHeader()});
    }

    sendToResponsible(data) {
        return api.post('/reception/setRequestResponsible', data, {headers: getHeader()});
    }

}