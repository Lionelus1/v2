<template>
    <div>
        <Card>
            <template #title>
                <Message severity="error" :closable="false"><b>{{$t('ncasigner.filHasNoIdTitle')}}</b></Message>
            </template>
            <template #content>
                <p>{{$t('ncasigner.fileHasNoIdContent')}}</p>
                <p>{{docNameAndType[0]}}-SignerAppIdXXXXXXXXXXXXXXXXXXXXXXXXXXXX.{{docNameAndType[1]}}</p>
            </template>
            <template #footer>
                <div>
                    <Button class="p-button-danger p-md-4" type="submit" v-on:click="reload"
                            v-bind:label="$t('ncasigner.reload')"/>
                </div>
            </template>
        </Card>
    </div>
</template>

<script>
    export default {
        name: 'FileHasNoId',
        props: ['documentName'],
        data() {
            return {
                docNameAndType: this.documentName.split('.')
            }
        },
        methods: {
            reload() {
                location.reload()
            }
        }
    }
</script>