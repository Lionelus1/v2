<template>
    <div>
        <Card>
            <template #title>
                <b>{{$t('ncasigner.IncorrectFileTitle', {dn:documentName})}}</b>
            </template>
            <template #content>
                <p>{{$t('ncasigner.IncorrectFileContent')}}</p>
            </template>
            <template #footer>
                <div>
                    <Button class="p-button-danger md:col-4" type="submit" v-on:click="reload"
                            v-bind:label="$t('ncasigner.reload')"/>
                </div>
            </template>
        </Card>
    </div>
</template>

<script>
    export default {
        props: ['documentName'],
        methods: {
            reload() {
                location.reload()
            }
        }
    }
</script>