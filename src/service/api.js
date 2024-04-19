import axios from "axios";
import {getHeader} from "../config/config";

const instance = axios.create({
    baseURL: process.env.VUE_APP_SMARTENU_API,
    headers: getHeader(),
    transformRequest: [function (data, headers) {
        return data instanceof FormData ? data : JSON.stringify(data);
    }],

});

export default instance;
