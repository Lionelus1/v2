<template>
    <div>
        <Card v-if="existId && haveId">
            <template #title>
                {{$t('ncasigner.findDocTitle')}}
            </template>
            <template #content>
                <div class="grid">
                    <div class="col-12 md:col-2">
                        <FileUpload ref="form" mode="basic"
                                    :customUpload="true"
                                    @uploader="upload($event)" :auto="true"
                                    v-bind:chooseLabel="$t('ncasigner.chooseFile')"></FileUpload>
                    </div>
                    <div class="col-12 md:col-5">
                        <InlineMessage severity="info" show v-if="document">{{$t('ncasigner.chosenFile', {fn: document ? document.name : ''})}}</InlineMessage>
                    </div>
                </div>
            </template>
            <template #footer>
                <hr>
                <Button type="submit" v-bind:label="$t('ncasigner.find')" :disabled="!document" v-on:click="findDocument"/>
            </template>
        </Card>
    </div>
    <FileHasNoId :doc-name="document.name" v-if="!existId && haveId"/>
    <DocIdNotExist :doc-name="document.name" :is-signing="false" v-if="existId && !haveId"/>
</template>

<script>
    import {checkIdAvailability} from "../../helpers/SignDocFunctions";
    import axios from "axios";
    import {signerApi, header} from "@/config/config";
    import DocIdNotExist from "./DocIdNotExist";
    import FileHasNoId from "./FileHasNoId";
    export default {
        components: {DocIdNotExist, FileHasNoId},
        data() {
            return {
                document: null,
                haveId: true,
                existId: true
            }
        },
        methods: {
            upload(event) {
                this.document = event.files[0]
            },
            findDocument() {
                let docId = checkIdAvailability(this.document)
                if (docId === null) {
                    this.haveId = false
                } else {
                    this.getDocument(docId)
                }
            },
            getDocument(docId) {
                axios.get(signerApi + '/documents/' + docId, {headers: header}).then((response) => {
                    if (response.data.id !== null || response.data.id !== '') {
                        this.$router.push({path: "/ncasigner/showdoc/" + btoa(response.data.uuid)})
                    } else {
                        this.existId = false
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