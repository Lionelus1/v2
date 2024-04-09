<template>
  <div class="talon_bg">
    <div class="relative">
      <div class="talon" v-if="inQueue">
        <div class="talon_top">
          <img src="assets/layout/images/logo.svg" style="width:110px; margin: 10px ">
          <div class="dots"></div>
        <div class="talon_number">107</div>
        <b>Сіздің кезектегі нөміріңіз</b>
        </div>
        <div class="talon_content">
          <div class="dashed flex justify-content-between">
            <div>Сіздің алдыңызда</div>
            <div class="talon_badge">3</div>
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
      <div class="talon_called" v-if="called">
        <div class="talon_top">
          <div class="talon_number">107</div>
          <b>Сіз шақырылдыңыз, өтіңіз</b>
        </div>
        <div class="talon_content">
          <div class="go_to flex justify-content-center align-items-center mb-4">
          <i class="fa-solid fa-person-walking-arrow-right"></i>
          № 8 терезе
          </div>
          <div class="flex justify-content-between">
            <div>01.04.2024</div>
            <div>11:25</div>
          </div>
        </div>
      </div>
      <div class="talon_list" v-if="inQueue">
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
      <div class="talon_list" v-if="called">
        <div class="flex justify-content-between text-white ml-5 mb-2">
          <div>№</div>
          <div>Терезе</div>
        </div>
        <div class="item flex justify-content-between align-items-center">
          <div>356</div>
          <i class="pi pi-arrow-right"></i>
          <div>8</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card text-center flex flex-column gap-4 m-auto">
    <h3>{{$t('contact.phone')}}</h3>
    <input type="text" v-model="phoneNumber" @input="validatePhoneNumber">
    <InputMask class="p-inputtext-lg"  mask="+7-(999)-999-99-99" />
    <Button class="justify-content-center p-button-lg" :disabled="isDisabled">{{$t('common.continue')}}</Button>
    <small v-if="!validPhoneNumber" class="p-error">{{ $t("common.error")}} Некорректный номер телефона</small>
    {{validPhoneNumber}}
  </div>
<div class="card m-auto mt-4">
<!--  <a class="block mb-2 cursor-pointer" @click="getQueue()">
    <i class="pi pi-arrow-left"></i>
    Артқа
  </a>-->
  <Button class="p-button-lg mb-3" style="width: 100%" v-for="i of queues" :key="i" @click="getQueue(i.key)">{{i.queueNamekz}}</Button>
</div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import {useRoute} from "vue-router";

const route = useRoute()
const parentId = ref(parseInt(route.params.id))
const validationError = ref(false);
const queues = ref();
const inQueue = ref(true);
const called = ref(false);
const inputValue = ref('');
const isDisabled = computed(() => inputValue.value.length <= 8);
const phoneNumber = ref('');
const validPhoneNumber = ref(true);

const validatePhoneNumber = () => {
  const phoneRegex = /^\+(?:[0-9] ?){10}[0-9]$/;

  if (!phoneRegex.test(phoneNumber.value)) {
    console.log(phoneNumber)
    validPhoneNumber.value = false;
  } else {
    validPhoneNumber.value = true;
  }
};

const checkInput = (event) => {
  console.log(event.target.value)
  inputValue.value = event.target.value;
};

const getQueue = (data) => {
  axios
      .post(smartEnuApi + "/queue/allQueuesForQr", {parentID: data}, {
        headers: getHeader(),
      })
      .then((response) => {
        queues.value = response.data.queues
      })
      .catch((error) => {
      });
}
getQueue(parentId.value)
</script>

<style lang="scss" scoped>
.talon_bg{
  background: #000e39;
  height: 100vh;
  margin: -20px;
  padding-top: 30px;
}
.talon{
  position: relative;
  padding-bottom: 30px;
  background: #fff;
  margin: 30px auto;
  text-align: center;
  border-radius: 8px;
  width: 90%;
  z-index: 2;
  &_top{
    padding: 20px 0;
  }
  &_number{
    font-size: 50px;
    font-weight: 600;
  }
  &_content{
    padding: 0 30px;
  }
  .dots{
    margin: 20px 0;
    border-bottom: 4px dotted #000e39;
    position: relative;
  }
  .dots:after{
    content: '';
    position: absolute;
    display: block;
    border-radius: 50%;
    width: 23px;
    height: 23px;
    background: #000e39;
    left: -13px;
    top: -10px;
  }
  .dots:before{
    content: '';
    position: absolute;
    display: block;
    border-radius: 50%;
    width: 23px;
    height: 23px;
    background: #000e39;
    right: -13px;
    top: -10px;
  }
  .talon_badge{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    //background: #000e39;
    padding: 5px;
    font-weight: 600;
  }
}
.talon_called{
  background: #2aed1f;
  margin: auto;
  text-align: center;
  border-radius: 8px;
  width: 90%;
  z-index: 2;
  &_top{
    padding: 50px 0;
  }
  &_number{
    font-size: 50px;
    font-weight: 600;
  }
  &_content{
    padding: 0 30px;
  }
  svg{
    font-size: 30px;
    margin-right: 10px;
  }
  .go_to{
    font-size: 18px;
    font-weight: 600;
  }
}
.talon_called:after{
  background:
      linear-gradient(-45deg, transparent 16px, #2aed1f 0),
      linear-gradient(45deg, transparent 16px, #2aed1f 0);
  background-repeat: repeat-x;
  background-position: left bottom;
  background-size: 15px 32px;
  content: "";
  display: block;
  width: 100%;
  height: 32px;
  position: relative;
  top:20px;
  left:0;
}
.talon:before{
  content: "";
  display: block;
  position: absolute;
  width: 40px;
  height: 20px;
  background: #000e39;
  bottom: -10px;
  border-radius: 8px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
}
/*.talon:after{
  background:
      linear-gradient(-45deg, transparent 16px, #fff 0),
      linear-gradient(45deg, transparent 16px, #fff 0);
  background-repeat: repeat-x;
  background-position: left bottom;
  background-size: 15px 32px;
  content: "";
  display: block;
  width: 100%;
  height: 32px;
  position: relative;
  top:20px;
  left:0;
}*/
.dashed{
  margin: 10px 0;
  padding: 5px 0;
  //border-bottom: 2px dashed #ccc;
}
.talon_list{
  margin: 40px auto;
  width: 90%;
  .item{
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    font-size: 20px;
    margin-bottom: 10px;
  }
}

</style>