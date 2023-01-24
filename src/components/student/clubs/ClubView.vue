<template>
    <div class="content-section introduction">
        <div class="feature-intro p-ml-3">
            <table style="width:100%;">
                <tbody>
                    <tr>
                        <td><h3>{{ $t("student.pageTitle") }}</h3></td>
                        <td> <Button :label="$t('common.add')" icon="pi pi-plus" class="p-button-success p-mr-2" v-on:click="createClub"/></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div class="card" style="background-color:white">
        <div class="p-blockui-container">Contents here
         
        </div>
    </div>
</template>

<script>
    export default {
        name: "ClubView",
        props: ['isVisible', 'selectedNews'],
        data() {
            return {
                newsViewVisible: this.isVisible ?? false
            }
        },
        methods: {
            closeModal() {
                this.emitter.emit("newsViewModalClose", false);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .dialog_img {
        padding: 0 100px;
    }

    @media (max-width: 780px) {
        .dialog_img {
            padding: 0;
        }
    }

</style>
