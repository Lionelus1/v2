const {NCALayerClient} = require("ncalayer-js-client");
((exports, WebSocket, window) => {
class NCALayerClientExtension extends NCALayerClient {

    constructor(url = 'wss://127.0.0.1:13579') {
        super(url);
    }

    async applyCAdES(storageType, keyType = 'SIGNATURE', cms) {
        const request = {
            module: 'kz.gov.pki.knca.commonUtils',
            method: 'applyCAdEST',
            args: [
                storageType,
                keyType,
                cms
            ],
        };

        super.sendRequest(request);

        return new Promise((resolve, reject) => { this.setHandlers(resolve, reject); });
    }
}
exports.NCALayerClientExtension = NCALayerClientExtension
})(
    typeof exports === 'undefined' ? this : exports,
    typeof WebSocket === 'undefined' ? require('ws') : WebSocket,
    typeof window === 'undefined' ? { btoa(x) { return x; } } : window // eslint-disable-line comma-dangle
);