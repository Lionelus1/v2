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

    questions(data) {
        return api.post('/reception/questions', data, {headers: getHeader()});
    }

    sendQuestion(data) {
        return api.post('/reception/sendQuestion', data, {headers: getHeader()});
    }
    
    deleteReceptionQuestion(id) {
        return api.post('/reception/questions/delete/id', id, {headers: getHeader()});
    }
}