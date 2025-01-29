import api from "./api";
import {getFileHeader, getHeader} from "@/config/config";

export class SignatureService {
    signatureCmsVerify(data) {
        return api.post("/signature/cms/verify", data, {headers: getHeader()});
    }

    signatures(id) {    
        return api.get("/signature/signatures/" + id, {headers: getHeader()});
    }

    signature(data) {
        return api.post("/signature", data, {headers: getHeader()});
    }

    signerInfo(id) {
        return api.get("/signature/signer/info/" + id, {headers: getHeader()});

    }

}