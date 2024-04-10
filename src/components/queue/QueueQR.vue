<template>
  <div class="card text-center flex flex-column gap-4 m-auto" v-if="isBoolPhone">
    <h4>{{$t('contact.phone')}}</h4>
    <InputMask class="p-inputtext-lg" v-model="phoneNumber"
               @update:modelValue="validatePhoneNumber" placeholder="+7-(777)-777-77-77" mask="+7-(999)-999-99-99" />
    <Button class="justify-content-center p-button-lg" @click="sendNumber()" :disabled="isDisabled">{{$t('common.continue')}}</Button>
  </div>
<div class="card m-auto mt-4" v-if="isBoolList">
  <Button class="p-button-lg mb-3" style="width: 100%" v-for="i of queues" :key="i" @click="registerQueue(i)">{{i.queueNamekz}}</Button>
</div>
  <div class="talon_bg"  v-if="isBoolTalon">
    <div class="relative">
      <div class="talon" v-if="inQueue">
        <embed :src="queinfo + '#toolbar=0'" style="width: 100%;height: 320px;" v-if="queinfo" type="application/pdf" />
        <div v-if="queinfo">{{queinfo}}</div>
        <div class="dots"></div>
<!--        <div class="talon_top">
          <img src="assets/layout/images/logo.svg" style="width:110px; margin: 10px ">

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
        </div>-->
      </div>
<!--      <div class="talon_called" v-if="called">
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
      </div>-->
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import axios from "axios";
import {b64toBlob, getHeader, smartEnuApi} from "@/config/config";
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";

const {t, locale} = useI18n()
const route = useRoute()
const parentId = ref(parseInt(route.params.id))
const queues = ref();
const inQueue = ref(true);
const called = ref(false);
const phoneNumber = ref('');
const isDisabled = ref(true);
const isBoolPhone = ref(true);
const isBoolList = ref(false);
const isBoolTalon = ref(false);
const queinfo = ref();

const validatePhoneNumber = (val) => {
  const phoneNumberRegex = /^\+7-\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
  isDisabled.value = !phoneNumberRegex.test(val)
};
const sendNumber=()=>{
  if(phoneNumber.value){
    localStorage.setItem('phoneNumber', phoneNumber.value);
    isBoolPhone.value = false
    isBoolList.value = true
  }
}

const getQueue = (data) => {
  axios
      .post(smartEnuApi + "/queue/allQueuesForQr", {parentID: data}, {
        headers: getHeader(),
      })
      .then((response) => {
        queues.value = response.data.queues
      })
      .catch((error) => {
        console.log(error)
      });
}
getQueue(parentId.value)

const registerQueue = (queue) => {
  const req = {
    queueID: queue.key, lang: locale.value
  }
  axios
      .post(smartEnuApi + "/queue/registerService", req, {
        headers: getHeader(),
      })
      .then((response) => {
        queinfo.value = b64toBlob(response.data)
        isBoolList.value = false
        isBoolTalon.value = true
      })
      .catch((error) => {
        console.log(error)
      });
}
onMounted(()=>{
  if (localStorage.getItem('phoneNumber') !== null){
    isBoolPhone.value = false
    isBoolList.value = true
  }
})
</script>

<style lang="scss" scoped>
.talon_bg{
  background: #000e39;
  height: 100vh;
  margin: -20px;
  padding-top: 30px;
}
.talon{
  min-height: 375px;
  position: relative;
  padding: 20px;
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
    //border-bottom: 4px dotted #000e39;
    position: relative;
    bottom: 220px;
  }
  .dots:after{
    content: '';
    position: absolute;
    display: block;
    border-radius: 50%;
    width: 23px;
    height: 23px;
    background: #000e39;
    left: -33px;
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
    right: -33px;
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
.p-inputtext::placeholder{
  color: #ced4da;
}

</style>