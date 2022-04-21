<template>
    <div v-if="!loading">
        <DocInfo :document="docInfo" v-if="!incorrect" :docID="doc_id" />
        <ProgressBar v-if="signing" mode="indeterminate" style="height: .5em" />
        <BlockUI :blocked="signing" :fullScreen="true"></BlockUI>
        <TabView v-model:activeIndex="active" @tab-change="showFile">
            <TabPanel v-bind:header="$t('ncasigner.signatureListTitle')">
                <div class="p-col-12" v-if="isShow">
                    <Button :label="$t('common.downloadSignaturesPdf')" icon="pi pi-download" @click="downloadSignatures" class="p-button p-ml-2" />
                    <SignatureQrPdf ref="qrToPdf" :signatures="signatures" :title="docInfo.name"></SignatureQrPdf>
                </div>
                <div class="p-col-12" v-else>
                    <div class="card">
                        <Message severity="error">{{ $t('common.message.accessDenied') }}</Message>
                    </div>
                </div>
            </TabPanel>
            <TabPanel :header="$t('ncasigner.goToDoc')" :disabled="!isShow">
                <div class="card">
                  <embed :src="file" style="width: 100%; height: 1000px" v-if="file" type="application/pdf" />

                </div>
            </TabPanel>
            <TabPanel v-if="docInfo.docHistory.stateId==2 ||docInfo.docHistory.stateId==6" :header="$t('ncasigner.sign')" :disabled="!isShow">
                <InlineMessage severity="info">{{$t('ncasigner.noteMark')}}</InlineMessage>
                <div class="p-mt-2">
                    <Button icon="pi pi-user-edit" class="p-button-primary" @click="sign" :label="$t('ncasigner.sign')" />
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>

<script>
import SignatureQrPdf from "@/components/ncasigner/SignatureQrPdf";
import { runNCaLayer } from "@/helpers/SignDocFunctions"

import axios from "axios";
import { getHeader, smartEnuApi, b64toBlob } from "@/config/config";
import html2pdf from "html2pdf.js";
import DocInfo from "@/components/ncasigner/DocInfo";


export default {
    name: "DocSignaturesInfo",
    components: { SignatureQrPdf, DocInfo },
    props: {
        docIdParam: {
            type: String,
            default: null
        },
    },
    data() {
        return {
            signatures: null,
            plan: null,
            doc_id: this.$route.params.uuid,
            docInfo: null,
            loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
            isShow: false,
            loading: true,
            signing: false,
            file: null,
            active: 0, 
        }
    },
    created() {
        if (!this.doc_id) {
            this.doc_id = this.docIdParam
        }

        this.getData();
    },
    methods: {
        b64toBlob: b64toBlob,
        showMessage(msgtype, message, content) {
            this.$toast.add({ severity: msgtype, summary: message, detail: content, life: 3000 });
        },
        showFile() {
          if (this.active == 1 && !this.file) { // showFileTab
             axios.post(
                    smartEnuApi + "/downloadFile", {
                        filePath: this.docInfo.filePath
                    }, {
                        headers: getHeader()
                    }
                )
                .then(response => {(
                  this.file = this.b64toBlob(response.data)
                )})
          }
        },
        getData() {
            axios.get(smartEnuApi + `/getDocInfo/${this.doc_id}`, { headers: getHeader() })
                .then(res => {
                    if (res.data) {
                        this.docInfo = res.data;
                        this.signatures = res.data.signatures;
                        this.isShow = this.signatures.some(x => x.userId === this.loginedUserId) || this.docInfo.docHistory.setterId === this.loginedUserId;
                        this.signatures.map(e => {
                            e.sign = this.chunkString(e.signature, 1200)
                        });
                    }
                    this.loading = false;
                }).catch(error => {
                    if (error.response && error.response.status === 401) {
                        this.$store.dispatch("logLout");
                    } else {
                        this.$toast.add({
                            severity: "error",
                            summary: error,
                            life: 3000,
                        });
                    }
                    this.loading = false;
                });
        },
        sign() {
            axios.post(
                    smartEnuApi + "/downloadFile", {
                        filePath: this.docInfo.filePath
                    }, {
                        headers: getHeader()
                    }
                )
                .then(response => {
                    (
                        runNCaLayer(this.$t, this.$toast, response.data)
                        .then(sign => {

                            if (sign != undefined) {
                                var req = {
                                    userID: this.$store.state.loginedUser.userID,
                                    docUUID: this.docInfo.uuid,
                                    sign: sign
                                };
                            this.signing = true

                                axios.post(smartEnuApi + "/doc/sign", req, { headers: getHeader() })
                                    .then(response => {
                                        this.signing = false
                                        this.getData()
                                        this.showMessage('success', this.$t('ncasigner.signDocTitle'), this.$t('ncasigner.success.signSuccess'));
                                    })
                                    .catch(error => {
                                        this.signing = false
                                        if (error.response.status == 405) {
                                            this.$toast.add({
                                                severity: "error",
                                                summary: this.$t(error.response.data),
                                                life: 3000,
                                            });
                                        }
                                        if (error.response.status == 401) {
                                            this.$store.dispatch("logLout");
                                        } else
                                            this.signing = false;
                                    })

                            }
                        })

                    ).catch(error => {
                        this.signing = false;

                        if (error.response.status == 401) {
                            this.$store.dispatch("logLout");
                        }
                    })
                })
        },
        getSignatures() {
            axios.post(smartEnuApi + `/workPlan/getSignatures`, { doc_id: this.plan.doc_id }, { headers: getHeader() }).then(res => {
                if (res.data) {
                    this.signatures = res.data;
                    const signUser = res.data.find(x => x.userId === this.loginedUserId);
                    if (signUser) {
                        this.isApproved = true;
                    }
                }
            }).catch(error => {
                this.$toast.add({
                    severity: 'error',
                    summary: error,
                    life: 3000
                });
                 if (error.response.status == 401) {
                            this.$store.dispatch("logLout");
                }
            })
        },
        downloadSignatures() {
            let pdfOptions = {
                margin: 10,
                image: {
                    type: 'jpeg',
                    quality: 0.95,
                },
                html2canvas: { scale: 3, letterRendering: true },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    hotfixes: ["px_scaling"]
                },
                pagebreak: { avoid: '#qr' },
                filename: this.docInfo.name + ".pdf"
            };
            const pdfContent = this.$refs.qrToPdf.$refs.qrToPdf;
            html2pdf().set(pdfOptions).from(pdfContent).save();
        },
        chunkString(str, length) {
            return str.match(new RegExp('.{1,' + length + '}', 'g'));
        }
    }
}
</script>

<style scoped>

</style>