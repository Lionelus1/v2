<template>
    <div>
        <Card v-if="existId && !isSuccess">
            <template #title>
                {{$t('ncasigner.signDocTitle')}}
            </template>
            <template #content>
                <div class="p-grid">
                    <div class="p-col-12 p-md-2">
                        <FileUpload ref="form" mode="basic"
                                    :customUpload="true"
                                    @uploader="upload($event)" :auto="true"
                                    v-bind:chooseLabel="$t('ncasigner.chooseFile')"></FileUpload>
                    </div>
                    <div class="p-col-12 p-md-5">
                        <InlineMessage severity="info" show v-if="document">{{ $t('ncasigner.chosenFile', {fn: document
                            ? document.name: ""})}}
                        </InlineMessage>
                    </div>
                </div>
            </template>
            <template #footer>
                <hr>
                <Button type="submit" v-bind:label="$t('ncasigner.sign')" :disabled="!document" v-on:click="sign"/>
            </template>
        </Card>
        <SuccessSign :document="document" :document-new-name="documentNewName" :document-id="documentID"
                     v-if="isSuccess && existId"/>
        <DocIdNotExist :document-name="document.name" :is-signing="true" v-if="!existId && !isSuccess"/>
    </div>
</template>

<script>
    import {NCALayerClient} from "ncalayer-js-client";
    import {checkIdAvailability, docToByteArray} from "../../helpers/SignDocFunctions";
    import axios from "axios";
    import {signerApi, header} from "../../config/config";
    import DocIdNotExist from "./DocIdNotExist";
    import SuccessSign from "./SuccessSign";

    export default {
        components: {SuccessSign, DocIdNotExist},
        data() {
            return {
                document: null,
                documentByteArray: null,
                CMSSignature: null,
                documentID: null,
                documentNewName: null,
                isSuccess: false,
                existId: true,
                docIDName: null,
            }
        },
        created() {
            this.getInfo()
        },
        methods: {
            upload(event) {
                this.document = event.files[0]
                console.log(this.document)
                console.log(this.document.name)
            },
            async getInfo() {
                let NCALaClient = new NCALayerClient()
                try {
                    await NCALaClient.connect();
                } catch (error) {
                    this.$toast.add({
                        severity: 'error',
                        summary: this.$t('ncasigner.failConnectToNcaLayer'),
                        life: 3000
                    });
                    return
                }

                try {
                    console.log(await NCALaClient.getKeyInfo("PKCS12"))
                } catch (error) {
                    this.$toast.add({
                        severity: 'error',
                        summary: this.$t('ncasigner.failConnectToNcaLayer'),
                        life: 3000
                    });
                    return
                }
            },
            async sign() {
                let NCALaClient = new NCALayerClient()
                if (this.document === null) {
                    this.$toast.add({severity: 'warn', summary: this.$t('ncasigner.chooseDocument'), life: 3000});
                    return
                }

                try {
                    this.documentByteArray = await docToByteArray(this.document)
                } catch (error) {
                    this.$toast.add({
                        severity: 'error',
                        summary: this.$t('ncasigner.failToBase64'),
                        life: 3000
                    });
                    return;
                }

                try {
                    await NCALaClient.connect();
                } catch (error) {
                    this.$toast.add({
                        severity: 'error',
                        summary: this.$t('ncasigner.failConnectToNcaLayer'),
                        life: 3000
                    });
                    return
                }

                try {
                    this.CMSSignature = await NCALaClient.createCAdESFromBase64('PKCS12', this.documentByteArray, 'SIGNATURE', false)
                    let docId = checkIdAvailability(this.document)
                    if (docId === null) {
                        this.addDocument();
                    } else {
                        this.getDocument(docId)
                    }
                } catch (error) {
                    this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failToSign'), life: 3000});
                }
            },
            addDocument() {
                axios.post(signerApi + '/documents', {
                    id: null,
                    name: this.document.name
                }, {headers: header}).then((response) => {
                    if (response.data.id !== null || response.data.id !== '') {
                        console.log(response.data)
                        this.documentID = response.data.uuid
                        console.log('DOCID', this.documentID);
                        this.addSignature(response.data)
                    } else {
                        this.$toast.add({
                            severity: 'error',
                            summary: this.$t('ncasigner.failToSendDoc'),
                            life: 3000
                        });
                    }
                });
            },

            addSignature(document) {
                axios.post(signerApi + '/signature', {
                    id: null,
                    documentUuid: document.uuid,
                    signature: this.CMSSignature
                }, {headers: header}).then((response) => {
                    if (response.data === '') {
                        this.$toast.add({severity: 'error', summary: this.$t('ncasigner.notEnoughRights'), life: 3000});
                    } else if (response.data.id !== null || response.data.id !== '') {
                        this.isSuccess = true
                        let nameAndType = this.document.name.split('.')
                        if (checkIdAvailability(this.document) === null) {
                            this.documentNewName = nameAndType[0] + '-' + 'SignerAppId' + btoa(this.documentID)
                        } else {
                            let nameAndType = this.document.name.split('.')
                            this.documentNewName = nameAndType[0]
                        }
                    } else {
                        this.$toast.add({severity: 'error', summary: this.$t('ncasigner.failToSign'), life: 3000});
                    }
                });
            },

            getDocument(docId) {
                axios.get(signerApi + '/documents/' + docId, {headers: header}).then((response) => {
                    if (response.data.id !== null || response.data.id !== '') {
                        console.log(response.data)
                        this.documentID = response.data.uuid
                        this.addSignature(response.data)
                    } else {
                        this.$toast.add({
                            severity: 'warn',
                            summary: this.$t('ncasigner.docNotFoundById'),
                            life: 3000
                        });
                    }
                }).catch((error) => {
                    if (error.response.status === 500) {
                        this.existId = false
                    }
                })
            }
        }
    }
</script>