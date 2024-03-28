<template>
  <div class="card text-center flex flex-column gap-4">
    <h3>{{$t('contact.phone')}}</h3>
    <InputMask @input="validatePhoneNumber" id="mobile" mask="+7-(999)-999-99-99" />
    <Button class="justify-content-center">{{$t('common.continue')}}</Button>
    <small v-if="validationError" class="p-error">{{ $t("error")}}</small>
  </div>
</template>

<script setup>
import {ref} from "vue";

const phoneNumber = ref('');
const validationError = ref(false);

const validatePhoneNumber = () => {
  if (phoneNumber.value.length !== 10) {
    validationError.value = true;
  } else {
    validationError.value = false;
  }
};
</script>

<style scoped>

</style>