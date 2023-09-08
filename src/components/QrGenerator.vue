<template>
    <div class="col-12">
        <div class="card mt-2">
            <TitleBlock :title="$t('common.qrGenerator')" :show-back-button="showBackButton"/>
        </div>
        <div class="card pt-8">
            <div class="qr_card flex justify-content-center gap-3">
                <div class="text-center">
                    <InputText class="qr_input w-30rem" type="text" v-model="inputData"
                               @keyup.enter="onEnterClick"/>
                    <Message v-if="warningText">
                        {{
                        $i18n.locale === 'kz' ? 'Мәтінде "enu" сөзі болуы қажет!' : $i18n.locale === 'ru' ? 'Текст должен содержать слово "enu"' : 'The text must contain the word "enu"'
                        }}
                    </Message>
                </div>
                <Button class="generate_btn" :label="$t('common.generate')" @click="onEnterClick"/>
            </div>
            <div class="flex justify-content-center">
                <div class="qr_shadow mt-5">
                    <Qr :qrData="inputData" :generationMethod="generationText" :download="download" ref="formatRef"/>
                </div>
            </div>
            <div class="flex justify-content-center gap-3">
                <Dropdown v-model="extension" :options="formats" optionLabel="name"
                          :placeholder="$t('common.selectFormat')"
                          class="qr_select"/>
                <Button :label="$t('common.download')" :disabled="extension === ''" @click="download"/>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue';
import Qr from "@/components/Qr.vue";
import {useRoute} from "vue-router";

const props = defineProps(['data', 'showBackButton'])

const route = useRoute();
const courseQR = ref(props.data ? props.data : route.query.url)
const inputData = ref(courseQR.value? courseQR.value:'https://smart.enu.kz');
const warningText = ref(false);
const sendText = ref(null);
const extension = ref('');
const formatRef = ref();



const download = () => {
    formatRef.value.extensionDownload(extension.value.value)
}

const generationText = (text) => {
    sendText.value = text;
};

const onEnterClick = () => {
    if (inputData.value.includes('enu')) {
        sendText.value(inputData.value);
        warningText.value = false
    } else {
        warningText.value = true
    }
}

const formats = ref([
    {name: 'SVG', value: 'svg'},
    {name: 'PNG', value: 'png'},
    {name: 'JPEG', value: 'jpeg'},
    {name: 'WEBP', value: 'webp'},
]);


</script>

<style lang="scss" scoped>
.qr_shadow {
  width: fit-content;
  margin: 0 auto 20px auto;
  box-shadow: 0 3px 3px -2px rgba(0, 0, 0, 0.2), 0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 1px 8px 0 rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.generate_btn {
  height: fit-content;
}

@media (max-width: 550px) {
  .qr_card {
    display: block !important;

    .qr_input {
      width: 100% !important;
    }
  }
  .generate_btn {
    margin-top: 10px;
  }
}
</style>