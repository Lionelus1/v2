import axios from "axios";
import {getHeader, smartEnuApi} from "../config/config";

export class PosterService {

    addPoster(data) {
        return axios.post(smartEnuApi + "/addPoster", data, {headers: getHeader()})
    }

}