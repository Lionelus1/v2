<template>
  <div class="card text-center flex flex-column gap-4 m-auto" style="width: 385px">
    <h3>{{$t('contact.phone')}}</h3>
    <InputMask class="p-inputtext-lg" @input="validatePhoneNumber" id="mobile" mask="+7-(999)-999-99-99" />
    <Button class="justify-content-center p-button-lg">{{$t('common.continue')}}</Button>
    <small v-if="validationError" class="p-error">{{ $t("error")}}</small>
  </div>
<div class="card m-auto mt-4" style="width: 385px">
  <a class="block mb-2 cursor-pointer" @click="getQueue()">
    <i class="pi pi-arrow-left"></i>
    Артқа
  </a>
  <Button class="p-button-lg mb-3" style="width: 100%" v-for="i of queues" :key="i" @click="getQueue(i.key)">{{i.queueNamekz}}</Button>
</div>
</template>

<script setup>
import {ref} from "vue";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

const phoneNumber = ref('');
const validationError = ref(false);
const queues = ref();

const validatePhoneNumber = () => {
  if (phoneNumber.value.length !== 10) {
    validationError.value = true;
  } else {
    validationError.value = false;
  }
};

const getQueue = (data) => {
  axios
      .post(smartEnuApi + "/queue/allQueues", {parentID: data}, {
        headers: getHeader(),
      })
      .then((response) => {
        queues.value = response.data.queues
        console.log(response.data.queues)
      })
      .catch((error) => {
      });
}
getQueue()
</script>

<style scoped>

</style>