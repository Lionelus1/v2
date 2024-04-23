<template>
  <div :class="['card',{'talon_bg': currentStep === 3 , 'mt-6': currentStep !==3 }]">
    <div class="text-center flex flex-column gap-4 m-auto" v-if="currentStep === 1">
      <h4>{{ $t('contact.phone') }}</h4>
      <InputMask class="p-inputtext-lg" v-model="phoneNumber"
                 @update:modelValue="validatePhoneNumber" placeholder="+7-(777)-777-77-77" mask="+7-(999)-999-99-99" @keyup.enter="sendNumber"/>
      <Button class="justify-content-center p-button-lg" @click="sendNumber()" :disabled="isDisabled">{{ $t('common.continue') }}</Button>
    </div>
    <div class="m-auto flex flex-column gap-3" v-if="currentStep === 2">
      <Button class="p-button-lg text-left p-3" style="width: 100%" v-for="i of queues" :key="i" @click="registerQueue(i.key)">
        {{
          $i18n.locale === "kz"
              ? i.queueNamekz
              : $i18n.locale === "ru"
                  ? i.queueNameru
                  : i.queueNameen
        }}
      </Button>
    </div>
    <div v-if="currentStep === 3">
      <div class="relative">
        <div class="talon">
          <template v-if="queinfo">
            <template v-if="!called">
            <div class="talon_top">
              <img src="assets/layout/images/logo.svg" style="width:110px; margin: 10px ">

              <div class="talon_number">{{ padTo2Digits(queinfo.queueNumber) }}</div>
              <b>Сіздің кезектегі нөміріңіз</b>
            </div>
            <div class="talon_content">
              <div class="dashed flex justify-content-between">
                <div>Сіздің алдыңызда</div>
                <!--                      <div class="talon_badge">{{queinfo.queueCount}}</div>-->
                <b>{{ queinfo.queueCount }}</b>
              </div>
              <div class="dashed flex justify-content-between">
                <div>Шамамен күтетін уақытыңыз</div>
                <div><b>{{ queinfo.averageTime }}</b> (мин)</div>
              </div>
              <div class="flex justify-content-between font-bold">
                <div>{{ talonDate }}</div>
                <div>{{ talonTime }}</div>
              </div>
            </div>
            </template>
            <template v-if="called">
              <div class="talon_called">
                <img src="assets/layout/images/logo.svg" style="width:110px; margin: 10px ">
                <div class="bg">
                <div class="talon_top">
                  <div class="talon_number">{{ padTo2Digits(queinfo.queueNumber) }}</div>
                  <b>Сіз шақырылдыңыз, өтіңіз</b>
                </div>
                <div class="talon_content">
                  <div class="go_to flex justify-content-center align-items-center">
                    <i class="fa-solid fa-person-walking-arrow-right"></i>
                    № {{ calledWindow }} терезе
                  </div>
                </div>
                </div>
              </div>
            </template>
            <div class="dots"></div>
          </template>
          <ProgressSpinner v-else class="progress-spinner" strokeWidth="2" style="width: 50px;"/>
        </div>
        <div class="talon_list">
          <div class="flex justify-content-between ml-5 mb-2">
            <div>№</div>
            <div>Терезе</div>
          </div>
          <template v-if="!called">
            <div class="item flex justify-content-between align-items-center blinking" v-for="i of queuesWS" :key="i">
              <div>{{ padTo2Digits(i.ticket) }}</div>
              <i class="pi pi-arrow-right"></i>
              <div>{{ i.window }}</div>
            </div>
          </template>
          <template v-if="called">
            <div class="item flex justify-content-between align-items-center blinking_called" v-for="i of queuesWS.slice(0, 1)" :key="i">
              <div>{{ padTo2Digits(i.ticket) }}</div>
              <i class="pi pi-arrow-right"></i>
              <div>{{ i.window }}</div>
            </div>
          </template>
        </div>
        <div style="width: 90%; margin: auto">
          <Button class="p-button-lg p-button-outlined justify-content-center w-full" style="border-radius: 8px;color: red !important;
    background: rgba(255, 0, 0, 0.15);"
                  @click="refusalVisible = true">Кезектен бас тарту
          </Button>
        </div>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="refusalVisible" :style="{ width: '450px' }" modal header=" ">
    <div class="text-center">
      <h4 v-if="locale === 'ru'">Вы уверены, что хотите отказаться от место в очереди?</h4>
      <h4 v-if="locale === 'kz'">Кезектегі орыннан бас тартқыңыз келетініне сенімдісіз бе?</h4>
    </div>
      <Button :label="$t('common.yes')" icon="pi pi-check" class="p-button p-component p-button-success w-full mb-3 mt-6"
              @click="refusal()"/>
      <Button :label="$t('common.no')" icon="pi pi-times" class="p-button p-component p-button-danger w-full"
              @click="refusalVisible = false"/>
  </Dialog>
</template>

<script setup>
import {onMounted, ref, watch} from "vue";
import axios from "axios";
import {getHeader, smartEnuApi, socketApi} from "@/config/config";
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import moment from "moment";

const {t, locale} = useI18n()
const route = useRoute()
const parentId = ref(parseInt(route.params.id))
const queues = ref();
const called = ref(false);
const phoneNumber = ref('');
const isDisabled = ref(true);
const queinfo = ref();
const queuesWS = ref([]);
const currentStep = ref(1);
const talonDate = ref('')
const talonTime = ref('')
const queueKey = ref()
const currentTicketWS = ref(null)
const currentTicketAPI = ref(null)
const calledWindow = ref()
const refusalVisible = ref(false)

const validatePhoneNumber = (val) => {
  const phoneNumberRegex = /^\+7-\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
  isDisabled.value = !phoneNumberRegex.test(val)
};
const sendNumber = () => {
  if (phoneNumber.value) {
    localStorage.setItem('phoneNumber', phoneNumber.value);
    localStorage.setItem('queueParentId', parentId.value);
    currentStep.value = 2
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

watch(()=> currentTicketWS.value, (newValue, oldValue) => {
  if (currentTicketWS.value !== null && currentTicketAPI.value !== null) {
    called.value = currentTicketWS.value === currentTicketAPI.value;
    localStorage.removeItem('queueKey')
  }
});

const splitDateTime = (dateTimeString) => {
  const dateTime = moment(dateTimeString);

  const formattedDate = dateTime.format('DD.MM.YYYY');
  const formattedTime = dateTime.utc().format('HH:mm');

  talonDate.value = formattedDate;
  talonTime.value = formattedTime;
};
const registerQueue = (queue) => {
  if (localStorage.getItem('phoneNumber')) {
    localStorage.setItem('queueKey', queue);
    const phoneNumber = localStorage.getItem('phoneNumber')
    const req = {
      queueID: queue, lang: locale.value, phoneNumber: phoneNumber
    }
    axios
        .post(smartEnuApi + "/queue/registerService", req, {
          headers: getHeader(),
        })
        .then((response) => {
          queinfo.value = response.data
          currentTicketAPI.value = queinfo.value.queueNumber
          const numMin = response.data.averageTime / 60
          queinfo.value.averageTime = numMin.toFixed(0);
          splitDateTime(response.data.queueDate)
          currentStep.value = 3
        })
        .catch((error) => {
          console.log(error)
        });
  }
}
const useRealtimeStream = (qId = 0) => {
  if (qId === 0) {
    alert("must declrare to connect queue");
    return
  }
  let socket = new WebSocket(socketApi + "/qws");

  socket.onopen = () => {
    const newTv = {
      serviceId: 0,
      windowId: 0,
      queueId: qId
    };
    socket.send(JSON.stringify(newTv));
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.lang === 'ru') {
      msg.lang = 2
    } else if (msg.lang === 'kz') {
      msg.lang = 1
    } else {
      msg.lang = 3
    }
    msg.window = Number(msg.window)
    queuesWS.value.unshift(JSON.parse(event.data));
    currentTicketWS.value = queuesWS.value[0].ticket
    calledWindow.value = queuesWS.value[0].window
    if (queuesWS.value.length > 3) {
      queuesWS.value = queuesWS.value.slice(0, 3);
    }
  };

  socket.onclose = (event) => {
    if (event.wasClean) {
      //alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      // event.code is usually 1006 in this case
      // alert('[close] Connection died');
    }
  };

  socket.onerror = (error) => {
    console.log(error)
    console.error(error)
    alert(`[error] ${error}`);
  };
}
const padTo2Digits = (num) => {
  return num.toString().padStart(3, '0');
}
const refusal = () => {
  const phoneNumber = localStorage.getItem('phoneNumber')
  axios
      .post(smartEnuApi + "/queue/stateChange", {phoneNumber: phoneNumber}, {
        headers: getHeader(),
      })
      .then((response) => {
        refusalVisible.value = false
        localStorage.removeItem('queueKey')
        currentStep.value = 2
      })
      .catch((error) => {
        console.log(error)
      });
}

onMounted(() => {
  useRealtimeStream(parentId.value)
  if(parentId.value !== parseInt(localStorage.getItem('queueParentId'))){
    localStorage.removeItem('phoneNumber')
  }
  if (localStorage.getItem('phoneNumber') !== null && localStorage.getItem('queueKey') !== null && (parentId.value === parseInt(localStorage.getItem('queueParentId')))) {
    registerQueue(parseInt(localStorage.getItem('queueKey')))
    currentStep.value = 3
  } else if (localStorage.getItem('phoneNumber') !== null) {
    currentStep.value = 2
  }
})
</script>

<style lang="scss" scoped>
.talon_bg {
  //background: #007dbe;
  height: 100vh;
  margin: -20px;
  padding-top: 30px;
}

.talon {
  min-height: 300px;
  position: relative;
  padding: 20px;
  background: #fff;
  margin: 30px auto;
  text-align: center;
  border-radius: 8px;
  width: 90%;
  z-index: 2;
  box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px, rgba(0, 0, 0, 0.24) 0 1px 2px;

  &_top {
    padding: 20px 0;
  }

  &_number {
    font-size: 50px;
    font-weight: 600;
  }

  .dots {
    margin: 20px 0;
    //border-bottom: 4px dotted #000e39;
    position: relative;
    bottom: 170px;
  }

  .talon_badge {
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

.talon_called {
  margin: auto;
  width: 90%;

.bg{
  margin-top: 20px;
  background: #49e740;
  //border: 2px solid #ccc;
  box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px, rgba(0, 0, 0, 0.24) 0 1px 2px;
  border-radius: 8px;
  padding-bottom: 30px;
}
  &_top {
    padding-bottom: 50px;
  }

  &_number {
    font-size: 50px;
    font-weight: 600;
  }

  .talon_content {
    padding: 0 30px;
  }

  svg {
    font-size: 30px;
    margin-right: 10px;
  }

  .go_to {
    font-size: 18px;
    font-weight: 600;
  }
}

.dashed {
  margin: 10px 0;
  padding: 5px 0;
  //border-bottom: 2px dashed #ccc;
}

.talon_list {
  margin: 20px auto;
  width: 90%;

  .item {
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    font-size: 20px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    //box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
  }

  .blinking {
    animation: blink 0.8s ease-in-out 3;
  }
  .blinking_called {
    background: #49e740;
    animation: blink_called 0.8s ease-in-out 3;
  }
}

@keyframes blink {
  0% {
    background-color: #fff;
  }
  25% {
    background-color: #add8fb;
  }
  50% {
    background-color: #fff;
  }
  75% {
    background-color: #add8fb;
  }
  100% {
    background-color: #fff;
  }
}
@keyframes blink_called {
  0% {
    background-color: #fff;
  }
  25% {
    background-color: #49e740;
  }
  50% {
    background-color: #fff;
  }
  75% {
    background-color: #49e740;
  }
  100% {
    background-color: #fff;
  }
}

.p-inputtext::placeholder {
  color: #ced4da;
}

</style>