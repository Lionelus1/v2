<template>
  <Button type="button" @click="showSocials" class="p-button-rounded ml-4" icon="fa-solid fa-share-nodes" label=""/>
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

const props = defineProps(['data'])
const op = ref()
const showSocials = (event) => {
  console.log(props.data)
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