<template>
  <div :class="['card',{'talon_bg': currentStep === 3 , 'mt-6': currentStep !==3 }]">
    <div class="text-center flex flex-column gap-4 m-auto" v-if="currentStep === 1">
      <h4>{{ $t('contact.phone') }}</h4>
      <InputMask class="p-inputtext-lg" v-model="phoneNumber"
                 @update:modelValue="validatePhoneNumber" placeholder="+7-(777)-777-77-77" mask="+7-(999)-999-99-99" @keyup.enter="sendNumber"/>
      <Button class="justify-content-center p-button-lg" @click="sendNumber()" :disabled="isDisabled">{{ $t('common.continue') }}</Button>
    </div>
    <div class="m-auto flex flex-column gap-3" v-if="currentStep === 2">
      <Button class="p-button-lg text-left p-3" style="width: 100%" v-for="i of queues" :key="i" @click="registerQueue(i)">
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
        <div class="talon" v-if="inQueue">
          <embed :src="queinfo + '#toolbar=0'" style="width: 100%;height: 250px;" v-if="queinfo" type="application/pdf"/>
          <div class="dots"></div>
        </div>
        <div class="talon_list" v-if="inQueue">
          <div class="flex justify-content-between text-white ml-5 mb-2">
            <div>№</div>
            <div>Терезе</div>
          </div>
          <div class="item flex justify-content-between align-items-center blinking" v-for="i of queuesWS" :key="i">
            <div>{{ padTo2Digits(i.ticket) }}</div>
            <i class="pi pi-arrow-right"></i>
            <div>{{ i.window }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import axios from "axios";
import {b64toBlob, getHeader, smartEnuApi, socketApi} from "@/config/config";
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
const queinfo = ref();
const queuesWS = ref([]);
const currentStep = ref(1);

const validatePhoneNumber = (val) => {
  const phoneNumberRegex = /^\+7-\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
  isDisabled.value = !phoneNumberRegex.test(val)
};
const sendNumber = () => {
  if (phoneNumber.value) {
    localStorage.setItem('phoneNumber', phoneNumber.value);
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

const registerQueue = (queue) => {
  if (localStorage.getItem('phoneNumber')) {
    const phoneNumber = localStorage.getItem('phoneNumber')
    const req = {
      queueID: queue.key, lang: locale.value, phoneNumber: phoneNumber
    }
    axios
        .post(smartEnuApi + "/queue/registerService", req, {
          headers: getHeader(),
        })
        .then((response) => {
          queinfo.value = b64toBlob(response.data)
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
onMounted(() => {
  useRealtimeStream(parentId.value)
  if (localStorage.getItem('phoneNumber') !== null) {
    currentStep.value = 2
  }
})
</script>

<style lang="scss" scoped>
.talon_bg {
  background: #000e39;
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

  &_top {
    padding: 20px 0;
  }

  &_number {
    font-size: 50px;
    font-weight: 600;
  }

  &_content {
    padding: 0 30px;
  }

  .dots {
    margin: 20px 0;
    //border-bottom: 4px dotted #000e39;
    position: relative;
    bottom: 170px;
  }

  .dots:after {
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

  .dots:before {
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
  background: #2aed1f;
  margin: auto;
  text-align: center;
  border-radius: 8px;
  width: 90%;
  z-index: 2;

  &_top {
    padding: 50px 0;
  }

  &_number {
    font-size: 50px;
    font-weight: 600;
  }

  &_content {
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

.talon_called:after {
  background: linear-gradient(-45deg, transparent 16px, #2aed1f 0),
  linear-gradient(45deg, transparent 16px, #2aed1f 0);
  background-repeat: repeat-x;
  background-position: left bottom;
  background-size: 15px 32px;
  content: "";
  display: block;
  width: 100%;
  height: 32px;
  position: relative;
  top: 20px;
  left: 0;
}

.talon:before {
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
.dashed {
  margin: 10px 0;
  padding: 5px 0;
  //border-bottom: 2px dashed #ccc;
}

.talon_list {
  margin: 40px auto;
  width: 90%;

  .item {
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    font-size: 20px;
    margin-bottom: 10px;
  }

  .blinking {
    animation: blink 0.8s ease-in-out 3;
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

.p-inputtext::placeholder {
  color: #ced4da;
}

</style>