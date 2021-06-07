<template>
    <div class="p-grid">
        <div class="p-col-12">
            <DocInfo :document="currentDocument" v-if="!incorrect"/>
            <div class="p-card" v-if="!incorrect">
                <div class="p-card-body">
                    <TabView v-model:activeIndex="active">
                        <TabPanel v-bind:header="$t('ncasigner.signatureListTitle')">
                            <Message severity="success" :closable="false" v-if="correct && !isSuccess">
                                <p><b>{{$t('ncasigner.success.header')}}</b></p>
                                <p>{{$t('ncasigner.success.subHeader')}}</p>
                                <ul>
                                    <li>{{$t('ncasigner.success.firstRow')}}</li>
                                    <li>{{$t('ncasigner.success.secondRow')}}
                                    </li>
                                </ul>
                            </Message>
                            <Message severity="success" :closable="false" v-if="isSuccess && !correct">
                                <p><b>{{$t('ncasigner.success.signSuccess')}}</b></p>
                            </Message>
                            <SignerInfo v-for="signature in signatures"
                                        :key="signature.id"
                                        :signature="signature"/>
                        </TabPanel>
                        <TabPanel v-bind:header="$t('ncasigner.verifySignatureTitle')">
                            <div class="p-grid">
                                <div class="p-col-12 p-md-2">
                                    <FileUpload ref="form" mode="basic"
                                                :customUpload="true"
                                                @uploader="uploadToVerify($event)" :auto="true"
                                                v-bind:chooseLabel="$t('ncasigner.chooseFile')"></FileUpload>
                                </div>
                                <div class="p-col-12 p-md-5">
                                    <InlineMessage show v-if="documentToVerify" severity="info">
                                        {{$t('ncasigner.chosenFile' ,{fn: documentToVerify ?
                                        documentToVerify.name : '' })}}
                                    </InlineMessage>
                                </div>
                            </div>
                            <hr>
                            <Button type="submit" v-bind:label="$t('ncasigner.verify')" :disabled="!documentToVerify"
                                    v-on:click="verifyDocumentSignature(documentToVerify, false)"/>
                        </TabPanel>
                        <TabPanel v-bind:header="$t('ncasigner.signDocTitle')">
                            <div class="p-grid">
                                <div class="p-col-12 p-md-2">
                                    <FileUpload ref="form" mode="basic"
                                                :customUpload="true"
                                                @uploader="uploadToSign($event)" :auto="true"
                                                v-bind:chooseLabel="$t('ncasigner.chooseFile')"></FileUpload>
                                </div>
                                <div class="p-col-12 p-md-5">
                                    <InlineMessage show v-if="documentToSign" severity="info">
                                        {{$t('ncasigner.chosenFile', {fn:
                                        documentToSign ? documentToSign.name : '' })}}
                                    </InlineMessage>
                                </div>
                            </div>
                            <hr>
                            <Button type="submit" v-bind:label="$t('ncasigner.sign')" :disabled="!documentToSign"
                                    v-on:click="verifyDocumentSignature(documentToSign, true)"/>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
            <IncorrectFile :document-name="docName" v-if="incorrect"/>
        </div>
    </div>
</template>

<script>
    import DocInfo from "./DocInfo";
    import SignerInfo from "./SignerInfo";
    import {apiDomain, signerApi, header} from "../../config/config";
    import {arrayBufferToB64, checkIdAvailability, docToByteArray} from "../../helpers/SignDocFunctions";
    import axios from "axios";
    import IncorrectFile from "./IncorrectFile";
    import {NCALayerClient} from "ncalayer-js-client";
    export default {
        components: {IncorrectFile, DocInfo, SignerInfo},
        data() {
            return {
                active: 0,
                currentDocument: null,
                documentToSign: null,
                documentToVerify: null,
                id: atob(this.$route.params.id),
                url: apiDomain,
                signatures: [],
                correct: false,
                incorrect: false,
                docName: null,
                CMSSignature: null,
                isSuccess: false
            }
        },
        created() {
            this.getDocument(this.id)
            this.getSignatures()
        },
        methods: {
            uploadToVerify(event) {
                this.documentToVerify = event.files[0]
            },
            uploadToSign(event) {
                this.documentToSign = event.files[0]
            },
            async verifyDocumentSignature(document, withSigning) {
                if (document === null) {
                    this.$toast.add({severity: 'warn', summary: this.$t('ncasigner.chooseDocument'), life: 3000});
                    return
                }
                let documentByteArray = null
                try {
                    documentByteArray = await docToByteArray(document)
                } catch (error) {
                    this.$toast.add({
                        severity: 'error',
                        summary: this.$t('ncasigner.failToBase64'),
                        life: 3000
                    });
                    return
                }
                axios.post(signerApi + '/signature/cms/verify', {
                    documentUuid: this.id,
                    plainData: arrayBufferToB64(documentByteArray)
                }, {headers: header}).then((response) => {
                    console.log(response)
                    if (response.data.code === 1) {
                        if(!withSigning) {
                            this.correct = true
                            this.active = 0
                            this.isSuccess = false
                        } else {
                            this.sign(documentByteArray)
                        }
                    } else if (response.data.code === 0) {
                        this.incorrect = true
                        this.docName = document.name
                    } else {
                        this.$toast.add({severity: 'error', summary: this.$t('ncasigner.signError'), life: 3000});
                    }
                })
            },
            async sign(documentByteArray) {
                let NCALaClient = new NCALayerClient()
                try {
                    await NCALaClient.connect();
                } catch (error) {
                    this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failConnectToNcaLayer'), life: 3000});
                    return
                }
                try {
                    this.CMSSignature = await NCALaClient.createCAdESFromBase64('PKCS12', documentByteArray, 'SIGNATURE', false)
                    this.addSignature()
                } catch (error) {
                    this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failToSign'), life: 3000});
                }
            },
            getSignatures() {
                axios.get(signerApi + '/signature/signatures/' + this.id, {headers: header}).then((response) => {
                    if (response.data !== null || response.data !== '') {
                        this.signatures = response.data
                    } else {
                        this.$toast.add({
                            severity: 'warn',
                            summary: this.$t('ncasigner.signNotFoundById'),
                            life: 3000
                        });
                    }
                })
            },
            addSignature() {
                axios.post(signerApi + '/signature', {
                    id: null,
                    documentUuid: this.id,
                    signature: this.CMSSignature
                }, {headers: header}).then((response) => {
                    if (response.data.id !== null || response.data.id !== '') {
                        this.isSuccess = true
                        this.active = 0
                        this.correct=false
                        this.getSignatures()
                    } else {
                        this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failToSign'), life: 3000});
                    }
                });
            },
            getDocument(docId) {
                axios.get(signerApi + '/documents/' + docId, {headers: header}).then((response) => {
                    if (response.data.id !== null || response.data.id !== '') {
                        this.currentDocument = response.data
                    } else {
                        this.$toast.add({
                            severity: 'error',
                            summary: this.$t('ncasigner.docNotFoundById'),
                            life: 3000
                        });
                    }
                }).catch((error) => {
                    if (error.response.status === 500) {
                        this.$toast.add({
                            severity: 'error',
                            summary: this.$t('ncasigner.docNotFoundById'),
                            life: 3000
                        });
                    }
                })
            }
        }
    }
</script>
