import axios from "axios";
import {getHeader, smartEnuApi} from "../config/config";

export class EventsService {

    getEvents() {
        return axios.get(smartEnuApi + "/allEvents");
    }

    downloadEventFile(event) {
        return axios.post(smartEnuApi + `/downloadEventFile`, {additional_file_path: event.additional_file_path});
    }

    getParticipantsCategories() {
        return axios.get(smartEnuApi + "/getParticipantsCategories", {headers: getHeader()});
    }

    deleteEvent(id) {
        return axios.post(smartEnuApi + "/delEvent", {id: id}, {headers: getHeader()});
    }

    addEvent(fd) {
        return axios.post(smartEnuApi + "/addEvent", fd, {headers: getHeader()});
    }

    publishEvent(id, userId) {
        return axios.post(smartEnuApi + "/publishEvent", {
            id: id,
            userId: userId
        }, {headers: getHeader()})
    }

}