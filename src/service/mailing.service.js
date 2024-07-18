import api from "./api";
import { getHeader } from "../config/config";

export class MailingService {

    mailing(data) {
        return api.post("/mailing/mailing", data, { headers: getHeader() });
    }

    getMailingTemplateByID(templateId, value) {
        return api.post("/mailing/getMailingTemplateByID", { templateID: templateId, value: value }, { headers: getHeader() });
    }

    getMailingByID(mailingId) {
        return api.post("/mailing/getMailingByID",{ mailingId: mailingId }, {headers: getHeader() });
    }
}
