import api from "@/service/api";
import {getHeader, smartEnuApi} from "@/config/config";
import axios from "axios";

export class NotificationService {

    viewNotifications(data) {
        return api.post("/viewnotifications", data, {headers: getHeader()});
    }

    getNotifications(page, rows) {
        return api.post("/notifications", {
            pageNum: page,
            itemsPerPage: rows
        }, {headers: getHeader()})
    }

}