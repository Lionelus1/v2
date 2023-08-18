<template>
    <div class="card">
        <h3 class="mb-8">{{ $t('common.qrGenerator') }}</h3>
        <div class="qr_card flex justify-content-center gap-3">
            <InputText class="qr_input w-30rem" type="text" v-model="inputData"
                       @keyup.enter="onEnterClick"/>
            <Button :label="$t('common.generate')" @click="onEnterClick"/>
        </div>
        <div class="flex justify-content-center">
            <div class="qr_shadow mt-5" id="qr-code" ref="qrCodeContainer"></div>
        </div>
        <div class="flex justify-content-center gap-3">
            <Dropdown v-model="extension" :options="formats" optionLabel="name" :placeholder="$t('common.selectFormat')"
                      class="qr_select"/>
            <Button :label="$t('common.download')" @click="download"/>
        </div>
    </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import QRCodeStyling from 'qr-code-styling';

const inputData = ref('https://smart.enu.kz');
const qrCodeContainer = ref(null);
let qrCodeInstance = null;
const options = ref({
    width: 300,
    height: 300,
    type: 'svg',
    data: "https://smart.enu.kz",
    image: '/assets/layout/images/logo_enu.svg',
    margin: 5,
    qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H',
    },
    imageOptions: {
        imageSize: 0.2,
        margin: 2,
        crossOrigin: 'anonymous',
    },
    dotsOptions: {
        color: '#000',
        type: 'square',
    },
    cornersSquareOptions: {
        color: '#000',
        type: 'square',
    },
    cornersDotOptions: {
        color: '#000',
        type: 'square',
    },
})

const updateQRCode = () => {
    options.value.data = inputData.value
    qrCodeInstance = new QRCodeStyling(options.value);
    qrCodeInstance.append(qrCodeContainer.value);
};

onMounted(() => {
    updateQRCode()
})

const onEnterClick = () => {
    if(inputData.value.includes('enu')){
        options.value.data = inputData.value;
    }
    qrCodeInstance.update(options.value)
}

const formats = ref([
    {name: 'PNG', value: 'png'},
    {name: 'JPEG', value: 'jpeg'},
    {name: 'WEBP', value: 'webp'},
]);

const extension = ref('svg');

const download = () => {
    qrCodeInstance.download({extension: extension.value.value});
};
</script>

<style lang="scss" scoped>
.qr_shadow {
    width: fit-content;
    margin: 0 auto 20px auto;
    box-shadow: 0 3px 3px -2px rgba(0, 0, 0, 0.2), 0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 1px 8px 0 rgba(0, 0, 0, 0.12);
    border-radius: 4px;
}
@media (max-width: 550px) {
    .qr_card{
        display: block!important;
        .qr_input{
            width: 100%!important;
            margin-bottom: 10px;
        }
    }
}
</style>