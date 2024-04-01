<template>
  <div class="talon_bg">
    <div class="relative">
      <div class="talon">
        <div class="talon_top">
        <div class="talon_number">107</div>
        <b>Сіздің кезектегі нөміріңіз</b>
        </div>
        <div class="talon_content">
          <div class="dashed flex justify-content-between">
            <div>Сіздің алдыңызда</div>
            <Badge>3</Badge>
          </div>
          <div class="dashed flex justify-content-between">
            <div>Ағымдағы нөмір</div>
            <div>104</div>
          </div>
          <div class="flex justify-content-between">
            <div>01.04.2024</div>
            <div>11:25</div>
          </div>
        </div>
      </div>
      <div class="talon_list">
        <div class="flex justify-content-between text-white ml-5 mb-2">
          <div>№</div>
          <div>Терезе</div>
        </div>
        <div class="item flex justify-content-between align-items-center">
          <div>104</div>
          <i class="pi pi-arrow-right"></i>
          <div>1</div>
        </div>
        <div class="item flex justify-content-between align-items-center">
          <div>289</div>
          <i class="pi pi-arrow-right"></i>
          <div>4</div>
        </div>
        <div class="item flex justify-content-between align-items-center">
          <div>356</div>
          <i class="pi pi-arrow-right"></i>
          <div>8</div>
        </div>
      </div>
    </div>
  </div>
<!--  <div class="card text-center flex flex-column gap-4 m-auto" style="width: 385px">
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
</div>-->
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

<style lang="scss" scoped>
.talon_bg{
  background: #000e39;
  height: 100vh;
  margin: -20px;
  padding-top: 30px;
}
.talon{
  background: #fff;
  margin: auto;
  text-align: center;
  border-radius: 8px;
  //padding: 30px;
  //box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  width: 90%;
  z-index: 2;
  //border-bottom: 8px dotted #000000;
  &_top{
    padding: 50px 0;
    //border-radius: 10px;
    //background: #a7d8ff;
  }
  &_number{
    font-size: 50px;
    font-weight: 600;
  }
  &_content{
    padding: 0 30px;
  }
}
.talon:after{
  background:
      linear-gradient(-45deg, transparent 16px, #ffffff 0),
      linear-gradient(45deg, transparent 16px, #ffffff 0);
  background-repeat: repeat-x;
  background-position: left bottom;
  background-size: 15px 32px;
  content: "";
  display: block;
  width: 100%;
  height: 32px;
  position: relative;
  top:20px;
  left:0px;
}
.dashed{
  margin: 10px 0;
  padding: 5px 0;
  border-bottom: 2px dashed #ccc;
}
.talon_list{
  margin: 40px auto;
  width: 90%;
  .item{
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    font-size: 20px;
    margin-bottom: 10px;
  }
}
/*.talon_top{
  background: #5b5b5b;
  height: 20px;
  width: 100%;
  border-radius: 5px;
  position: absolute;
  z-index: 1;
}
.talon_top:after{
  content: '';
  position: absolute;
  top:50%;
  left: 50%;
  transform: translate(-50%, -50%);
  bottom: 0;
  display: block;
  background: #000;
  height: 10px;
  width: 95%;
  border-radius: 3px;
}*/

</style>