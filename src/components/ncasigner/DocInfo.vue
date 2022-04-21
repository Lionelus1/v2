<template>
    <Card class="doc-info">
        <template #title>
            {{$t('ncasigner.signedDocPageTitle', {name: document ? document.name : ""})}}
        </template>
        <template #content>
            <p>{{$t('ncasigner.linkForOthersTitle')}}</p>
            <div class="p-inputgroup p-input-filled">
                <InputText v-model="url" :disabled="true"/>
                <Button v-bind:label="$t('ncasigner.copy')" v-clipboard:copy="url" v-clipboard:success="onCopy" v-clipboard:error="onFail" class="p-button-secondary"/>
            </div>
        </template>
    </Card>
</template>

<script>
    import {apiDomain} from "../../config/config";

    export default {
        props: ['document', 'docID'],
        
        data() {
            return {
                url: apiDomain + "/sign/" +  this.docID
            }
        },
        methods: {
            onCopy() {
                this.$toast.add({severity: 'success', summary: this.$t('ncasigner.successCopy'), life: 3000});
            },

            onFail() {
                this.$toast.add({severity: 'warn', summary: this.$t('ncasigner.failCopy'), life: 3000});
            }
        }
    }
</script>

<style>
    .doc-info {
        margin-bottom: 16px;
    }
</style>