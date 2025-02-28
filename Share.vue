<template>
  <InputText v-model="dataInput" type="text" :disabled="disabled"></InputText>
  <Button v-if="param" icon="fa-solid fa-copy" :label="label" class="p-button-secondary"
          v-clipboard:copy="dataInput" v-clipboard:success="onClick" v-clipboard:error="error"></Button>
  <Button v-if="param" type="button" @click="showSocials" class="p-button-rounded ml-2" icon="fa-solid fa-share-nodes" label=""/>
  <OverlayPanel ref="op">
    <div class="flex flex-column gap-2">
      <Button type="button" @click="shareWhatsApp" class="p-button-success" icon="fa-brands fa-whatsapp" label="Whats App"/>
      <Button type="button" @click="shareFacebook" class="" icon="fa-brands fa-facebook" label="Facebook"/>
      <Button type="button" @click="shareTelegram" class="" icon="fa-brands fa-telegram" label="Telegram"/>
    </div>
  </OverlayPanel>
</template>

<script setup>
import {ref} from "vue";

const props = defineProps(['data','disabled','param','label'])
const dataInput = ref(props.data)
const op = ref()
const emit = defineEmits(['copy','error'])
const onClick = () => {
  emit('copy')
}
const error = () => {
  emit('error')
}
const showSocials = (event) => {
  op.value.toggle(event);
}
const shareWhatsApp = () => {
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(props.data)}`;
  window.open(whatsAppUrl);
}
const shareFacebook = () => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.data)}`
  window.open(facebookUrl)
}
const shareTelegram = () => {
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(props.data)}`;
  window.open(telegramUrl);
}
</script>

<style scoped>

</style>
