import api from './api';
import {getHeader} from "@/config/config";

export class QuestionService {

    getQuestions(data) {
        return api.post("/question/get", data, {headers: getHeader()})
	}

	createQuestion(data) {
        return api.post("/question/create", data, {headers: getHeader()})
    }

    deleteQuestion(data) {
        return api.post("/question/delete", data, {headers: getHeader()})
    }
}
