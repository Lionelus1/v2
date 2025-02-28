<template>
    <div>
        <Card>
            <template #title>
                {{$t('ncasigner.successSignTitle', {dn: document? document.name: ''})}}
            </template>
            <template #content>
                <p>{{$t('ncasigner.successSignContentFirstRow')}}</p>
                <p v-html="$t('ncasigner.successSignContentSecondRow')"></p>
                <p>
                    <Button class="p-button-success" type="submit" @click="downloadDocument"
                            v-bind:label="$t('ncasigner.saveFileCopyWithId')"/>
                </p>
                <p>{{$t('ncasigner.changeNameManually')}}</p>
                <div class="container p-inputgroup">
                    <InputText v-model="docName" :disabled="true"/>
                    <Button v-bind:label="$t('ncasigner.copy')" v-clipboard:copy="documentNewName"
                            v-clipboard:success="onCopy" v-clipboard:error="onFail" class="p-button-secondary"/>
                </div>
            </template>
            <template #footer>
                <div>
                    <hr>
                    <Button class="" type="submit" v-on:click="goTo"
                            v-bind:label="$t('ncasigner.goToDoc')"/>
                </div>
            </template>
        </Card>
    </div>
</template>

<script>
    export default {
        props: ['document', 'documentNewName', 'documentId'],
        data() {
            return {
                docName: this.documentNewName
            }
        },
        methods: {
            downloadDocument() {
                let aLink = document.createElement("a")
                aLink.download = this.documentNewName
                aLink.href = URL.createObjectURL(this.document);
                aLink.click();
            },

            goTo() {
                this.$router.push({path: "/ncasigner/showdoc/" + btoa(this.documentId)})
            },

            onCopy() {
                this.$toast.add({severity: 'success', summary: this.$t('ncasigner.successCopy'), life: 3000});
            },

            onFail() {
                this.$toast.add({severity: 'warn', summary: this.$t('ncasigner.failCopy'), life: 3000});
            }
        }
    }
</script>