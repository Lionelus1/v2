const {NCALayerClient} = require("ncalayer-js-client");
((exports, WebSocket, window) => {
    class NCALayerClientExtension extends NCALayerClient {

        constructor(url = 'wss://127.0.0.1:13579') {
            super(url);
        }
        async sign(signatureType, tsaProfile, data, signerType, locale, decodeBase64) {
            let decode = decodeBase64
            let encapsulate = false
            let digested = false
            let extKeyUsageOids = ['1.3.6.1.5.5.7.3.4']
            if (signerType !== null) {
                if (signerType === 'auth')
                    extKeyUsageOids = ['1.3.6.1.5.5.7.3.2']
                if (signerType === 'fl')
                    extKeyUsageOids = ['1.3.6.1.5.5.7.3.4', '1.2.398.3.3.4.1.1']
                if (signerType === 'ul')
                    extKeyUsageOids = ['1.3.6.1.5.5.7.3.4', '1.2.398.3.3.4.1.2']
            }
            const request = {
                module: 'kz.gov.pki.knca.basics',
                method: 'sign',
                args: {
                    'allowedStorages': ['PKCS12'],
                    'format': signatureType,
                    'data': data,
                    'signingParams': { decode, encapsulate, digested, tsaProfile},
                    "signerParams": {
                        "extKeyUsageOids": extKeyUsageOids,
                        "chain": []
                    },
                    'locale': locale
                }
            };

            super.sendRequest(request);

            return new Promise((resolve, reject) => {
                this.setHandlers(resolve, reject);
            });
        }
    }

    exports.NCALayerClientExtension = NCALayerClientExtension
})(
    typeof exports === 'undefined' ? this : exports,
    typeof WebSocket === 'undefined' ? require('ws') : WebSocket,
    typeof window === 'undefined' ? {
        btoa(x) {
            return x;
        }
    } : window // eslint-disable-line comma-dangle
);