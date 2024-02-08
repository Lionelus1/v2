<template>
    <Dialog header=" "
            v-model:visible="newsViewVisible"
            :style="{ width: '1000px' }"
            :modal="true"
            class="p-fluid"
            :closable="true"
            :breakpoints="{'960px': '75vw', '640px': '90vw'}"
            :close-on-escape="true"
            @hide="closeModal"
    >
        <Card style="box-shadow: none">
            <template #header>
                <div class="dialog_img">
                    <img :src="getImageUrl(selectedNews)" style="width: 100%; height: 100%" alt=""/>
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

    </Dialog>
</template>

<script setup>
import {fileRoute, smartEnuApi} from "@/config/config";
import {inject, ref} from "vue";
const props = defineProps(['isVisible', 'selectedNews'])
const newsViewVisible = ref(props.isVisible ?? false)
const emitter = inject('emitter');

const closeModal = () => {
  emitter.emit("newsViewModalClose", false);
}

const getImageUrl = (data) => {
  if (data && data.main_image_file) {
    return  smartEnuApi + fileRoute + data.main_image_file?.filepath
  } else if (data && data?.image1) {
    return  smartEnuApi + fileRoute + data.image1
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
