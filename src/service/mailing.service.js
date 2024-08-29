import api from "./api";
import { getHeader } from "../config/config";

export class MailingService {

    mailing(data) {
        return api.post("/mailing/mailing", data, { headers: getHeader() });
    }

    getMailingTemplateByID(data) {
        return api.post("/mailing/getMailingTemplateByID", data, { headers: getHeader() });
    }

    getMailingByID(mailingId) {
        return api.post("/mailing/getMailingByID",{ mailingId: mailingId }, {headers: getHeader() });
    }
}

// display: flex;
// flex-direction: column;
// align-items: center;