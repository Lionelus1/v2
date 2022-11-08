<template>
    <Dialog
            v-model:visible="newsViewVisible"
            :style="{ width: '1000px' }"
            :modal="true"
            class="p-fluid"
            :closable="false"
    >
        <Card style="box-shadow: none">
            <template #header>
                <div class="dialog_img">
                    <img :src="selectedNews.imageUrl" style="width: 100%; height: 100%"/>
                </div>
            </template>
            <template #title>
                <div class="card_title">
                    {{
                    $i18n.locale === "kz"
                    ? selectedNews.titleKz
                    : $i18n.locale === "ru"
                    ? selectedNews.titleRu
                    : selectedNews.titleEn
                    }}
                </div>
            </template>
            <template #subtitle>
                {{ new Date(selectedNews.history.modifyDate).toLocaleString() }}
            </template>
            <template #content>
                <div class="news_content" v-html="
                    $i18n.locale === 'kz'
                    ? selectedNews.contentKz
                    : $i18n.locale === 'ru'
                    ? selectedNews.contentRu
                    : selectedNews.contentEn"
                     ></div>
            </template>
            <template #footer>
                <div style="padding: 0 100px">
                    <img :src="selectedNews.image2" v-if="selectedNews.image2" style="width: 100%; height: 100%"/>
                </div>
            </template>
        </Card>
        <template #footer>
            <Button
                    v-bind:label="$t('common.close')"
                    icon="pi pi-times"
                    class="p-button p-component p-button-primary"
                    @click="closeModal"
            />
        </template>
    </Dialog>
</template>

<script>
    export default {
        name: "NewsView",
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

    .news_content{
        p{
            img {
                width: auto !important;
                display: block !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }
        }
    }
    .p-card .p-card-content{
        font-weight: bold;
        img {
            width: auto !important;
            display: block !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
    }

</style>
