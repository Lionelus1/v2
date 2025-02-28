<template>
    <div>
        <Card>
            <template #title>
                <Message severity="error" :closable="false"><b>{{$t('ncasigner.fileWithIdNotFound', {dn: documentName})}}</b></Message>
            </template>
            <template #content>
                <p v-if="!isSigning">{{$t('ncsigner.docIdNotExistMessageForSign')}}</p>
                <p v-if="isSigning">{{$t('ncsigner.docIdNotExistMessageForSign')}}</p>
            </template>
            <template #footer>
                <div>
                    <Button class="p-button-danger md:col-4" type="submit" v-on:click="reload"
                            v-bind:label="$t('ncsigner.reload')"/>
                </div>
            </template>
        </Card>
    </div>
</template>

<script>
    export default {
        props: ['documentName', 'isSigning'],
        methods: {
            reload() {
                location.reload()
            }
        }
    }
</script>