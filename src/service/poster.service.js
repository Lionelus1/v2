import { getHeader, smartEnuApi } from "../config/config";
import api from "./api";

export class PosterService {

    addPoster(data) {
        return api.post(smartEnuApi + "/addPoster", data, {headers: getHeader()})
    }

}