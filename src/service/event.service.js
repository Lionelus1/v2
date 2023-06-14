import {getHeader, smartEnuApi} from "../config/config";
import api from "./api";

export class EventsService {

    getEvents() {
        return api.get("/allEvents");
    }

    downloadEventFile(event) {
        return api.post(`/downloadEventFile`, {additional_file_path: event.additional_file_path});
    }

    getParticipantsCategories() {
        return api.get("/getParticipantsCategories", {headers: getHeader()});
    }

    deleteEvent(id) {
        return api.post("/delEvent", {id: id}, {headers: getHeader()});
    }

    addEvent(fd) {
        return api.post("/addEvent", fd, {headers: getHeader()});
    }

    deleteEventFile(id) {
        return api.post(`/delEventFile`, {id: id}, {headers: getHeader()});
    }

    getEventFiles(id) {
        return api.post(`/getEventFiles`, {id: id}, {headers: getHeader()});
    }

    publishEvent(id, userId) {
        return api.post("/publishEvent", {
            id: id,
            userId: userId
        }, {headers: getHeader()})
    }

}