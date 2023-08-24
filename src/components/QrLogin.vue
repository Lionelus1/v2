<template>
    <div class="" ref="qrCodeLogin"></div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import QRCodeStyling from 'qr-code-styling';

const props = defineProps(['qrData'])

const options = {
    width: 300,
    height: 300,
    type: 'svg',
    data: computed(() => props.qrData).value,
    image: '/assets/layout/images/logo_enu.svg',
    margin: 0,
    qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H',
    },
    imageOptions: {
        imageSize: 0.15,
        margin: 2,
        crossOrigin: 'anonymous',
    },
    dotsOptions: {
        type: "square",
        color: '#000',
    },
    cornersSquareOptions: {
        color: '#000',
        type: 'square',
    },
    cornersDotOptions: {
        color: '#000',
        type: 'square',
    },
};
const qrCodeLogin = ref(new QRCodeStyling(options));

const qrCodeInstance = new QRCodeStyling(options);

onMounted(() => {
    qrCodeInstance.append(qrCodeLogin.value);
});

</script>

<style scoped>
</style>