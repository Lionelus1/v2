<template>
  <div class="card flex justify-content-end">
    <LanguageDropdown/>
  </div>
  <div class="card talon_bg">
    <Toast />
    <div class="text-center flex flex-column gap-4 m-auto" v-if="currentStep === 1">
      <Button class="justify-content-center p-button-lg" @click="queue(false)">{{ $t('queue.liveQueue') }}</Button>
      <Button class="justify-content-center p-button-lg" @click="queue(true)">{{ $t('queue.choiceTime') }}</Button>
    </div>
    <div :class="['flex', 'flex-column', 'm-auto', 'gap-2', {'text-center': !reservation, 'gap-4': !reservation,}]" v-if="currentStep === 2">
      <template v-if="reservation">
        <h4 class="m-0">{{ $t('contact.lname') }}</h4>
        <InputText class="p-inputtext-lg" v-model="lastName"/>
        <h4 class="m-0">{{ $t('common.name') }}</h4>
        <InputText class="p-inputtext-lg" v-model="name"/>
        <h4 class="m-0">Email</h4>
        <InputText class="p-inputtext-lg" v-model="email" @input="validateEmail" type="email"/>
        <span v-if="emailError" style="color: red">{{ emailError }}</span>
      </template>
      <h4 class="m-0">{{ $t('contact.phone') }}</h4>
      <InputMask class="p-inputtext-lg" v-model="phoneNumber"
                 @update:modelValue="validatePhoneNumber" placeholder="+7-(777)-777-77-77" mask="+7-(999)-999-99-99" @keyup.enter="sendNumber"/>
      <Button :class="['justify-content-center', 'p-button-lg', {'mt-4': reservation}]" @click="sendNumber()" :disabled="isDisabled">
        {{ $t('common.continue') }}
      </Button>
    </div>

    <div class="m-auto flex flex-column gap-3" v-if="currentStep === 3">
      <template v-if="!reservation">
        <Button :disabled="disabledRezervation" class="p-button-lg text-left p-3" style="width: 100%" v-for="i of queues" :key="i" @click="registerQueue(i.key,i)">
          {{
            $i18n.locale === "kz"
                ? i.queueNamekz
                : $i18n.locale === "ru"
                    ? i.queueNameru
                    : i.queueNameen
          }}
        </Button>
      </template>
      <template v-if="reservation">
        <Dropdown @change="changeQueues" v-model="selectedQueue" :options="queues" option-label="queueNamekz" :placeholder="$t('common.select')"
                  class="p-inputtext-lg w-full mb-4"/>
        <Dropdown v-if="selectDayBool" @change="changeDay" v-model="selectedDay" :options="daysList" :option-label="formatDay" :placeholder="$t('queue.day')"
                  class="p-inputtext-lg w-full mb-4"/>
        <Dropdown v-if="selectTimeBool" @change="changeTime" v-model="selectedTime" :options="timeList" :option-label="formatTime" :placeholder="$t('queue.time')"
                  class="p-inputtext-lg w-full mb-4"/>
        <Button v-if="reservationBtn" class="justify-content-center p-button-lg w-full"
                @click="registerQueue(selectedItem.value.key, selectedItem.value)" :disabled="disabledRezervation">{{ $t('queue.reserve') }}
        </Button>
      </template>
    </div>
    <div class="flex justify-content-center">
      <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="2" style="width: 50px;"/>
    </div>
    <div v-if="currentStep === 4">
      <div class="relative">
        <div class="talon">
          <template v-if="queinfo">
            <template v-if="!called && !reservation">
              <div class="talon_top">
                <img src="assets/layout/images/logo.svg" style="width:110px; margin: 10px ">

                <div class="talon_number">{{ padTo2Digits(queinfo.queueNumber) }}</div>
                <b v-if="locale === 'kz'">Сіздің кезектегі нөміріңіз</b>
                <b v-if="locale === 'ru'">Ваш номер в очереди</b>
                <b v-if="locale === 'en'">Your number in the queue</b>
              </div>
              <div class="talon_content">
                <div class="text-left font-bold">
                  {{
                    $i18n.locale === "kz"
                        ? categoryName.queueNamekz
                        : $i18n.locale === "ru"
                            ? categoryName.queueNameru
                            : categoryName.queueNameen
                  }}
                </div>
                <div class="dashed flex justify-content-between">
                  <div v-if="locale === 'kz'">Сіздің алдыңызда</div>
                  <div v-if="locale === 'ru'">В очереди перед вами</div>
                  <div v-if="locale === 'en'">In queue in front of you</div>
                  <div>
                    <b>{{ queinfo.queueCount }} </b>
                    <template v-if="locale === 'kz'"> (адам)</template>
                    <template v-if="locale === 'ru'"> (человек)</template>
                    <template v-if="locale === 'en'"> (people)</template>
                  </div>
                </div>
                <div class="dashed flex justify-content-between">
                  <div v-if="locale === 'kz'">Шамамен күтетін уақытыңыз</div>
                  <div v-if="locale === 'ru'">Примерное время ожидания</div>
                  <div v-if="locale === 'en'">Approximate waiting time</div>
                  <div><b>{{ queinfo.averageTime }}</b>
                    <template v-if="locale === 'kz' || locale === 'ru'"> (мин)</template>
                    <template v-if="locale === 'en'"> (min)</template>
                  </div>
                </div>
                <div class="flex justify-content-between font-bold">
                  <div>{{ talonDate }}</div>
                  <div>{{ talonTime }}</div>
                </div>
              </div>
            </template>
            <template v-if="called && !reservation">
              <div class="talon_called">
                <img src="assets/layout/images/logo.svg" style="width:110px; margin: 10px ">
                <div class="bg">
                  <div class="talon_top">
                    <div class="talon_number">{{ padTo2Digits(queinfo.queueNumber) }}</div>
                    <b v-if="locale === 'kz'">Сіз шақырылдыңыз, өтіңіз</b>
                    <b v-if="locale === 'ru'">Вас вызвали, проходите</b>
                    <b v-if="locale === 'en'">You have been called, come in</b>
                  </div>
                  <div class="talon_content">
                    <div class="go_to flex justify-content-center align-items-center">
                      <i class="fa-solid fa-person-walking-arrow-right"></i>
                      № {{ calledWindow }}
                      <template v-if="locale === 'kz'">терезе</template>
                      <template v-if="locale === 'ru'">окно</template>
                      <template v-if="locale === 'en'">window</template>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="reservation">
              <div class="talon_top">
                <img src="assets/layout/images/logo.svg" style="width:110px; margin: 10px ">

                <div class="talon_number">{{ padTo2Digits(queinfo.queueNumber) }}</div>
                <b v-if="locale === 'kz'">Сіздің кезектегі нөміріңіз</b>
                <b v-if="locale === 'ru'">Ваш номер в очереди</b>
                <b v-if="locale === 'en'">Your number in the queue</b>
              </div>
              <div class="talon_content">
                <div class="text-left font-bold">
                  {{
                    $i18n.locale === "kz"
                        ? categoryName.queueNamekz
                        : $i18n.locale === "ru"
                            ? categoryName.queueNameru
                            : categoryName.queueNameen
                  }}
                </div>
                <div class="dashed text-left">
                  <span v-if="locale === 'kz'">Құрметті </span>
                  <span v-if="locale === 'ru'">Уважаемый(-ая) </span>
                  <span v-if="locale === 'en'">Dear </span>
                  <b>{{ queinfo.last_name + ' ' + queinfo.first_name }} </b>
                  <span v-if="locale === 'kz'">, сіз кезекке сәтті жазылдыңыз!</span>
                  <span v-if="locale === 'ru'">, вы успешно записались!</span>
                  <span v-if="locale === 'en'">, you have successfully registered! </span>
                </div>
                <div class="dashed text-left">
                  <span v-if="locale === 'kz'">Күні: </span>
                  <span v-if="locale === 'ru'">Дата: </span>
                  <span v-if="locale === 'en'">Day: </span>
                  <b>{{ queinfo.day }}</b>
                </div>
                <div class="dashed text-left">
                  <span v-if="locale === 'kz'">Уақыты: </span>
                  <span v-if="locale === 'ru'">Время: </span>
                  <span v-if="locale === 'en'">Time: </span>
                  <b>{{ queinfo.time }}</b>
                </div>
                <div class="dashed text-left">
                  <span v-if="locale === 'kz'">Қабылдайтын оператор: </span>
                  <span v-if="locale === 'ru'">Принимающий оператор: </span>
                  <span v-if="locale === 'en'">Receiving operator: </span>
                  <b>{{ queinfo.queueName }}</b>
                </div>
                <!--                <div class="flex justify-content-between font-bold">
                                  <div>{{ talonDate }}</div>
                                  <div>{{ talonTime }}</div>
                                </div>-->
              </div>
            </template>
            <div class="dots"></div>
          </template>
          <div v-if="!queinfo">{{ t('common.noData') }}</div>
        </div>
        <div class="talon_list" v-if="!reservation">
          <div class="flex justify-content-between ml-5 mb-2">
            <div>№</div>
            <div v-if="locale === 'kz'">Терезе</div>
            <div v-if="locale === 'ru'">Окно</div>
            <div v-if="locale === 'en'">Window</div>
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
        <div style="width: 90%; margin: auto"  v-if="reservation">
        <InlineMessage class="mb-4" severity="info">{{ $t('queue.emailMsg') }}</InlineMessage>
        </div>
          <div style="width: 90%; margin: auto">
          <Button v-if="!called" class="p-button-lg p-button-outlined justify-content-center w-full" style="border-radius: 8px;color: red !important;
    background: rgba(255, 0, 0, 0.15);"
                  @click="refusalVisible = true">
            <template v-if="locale === 'kz'">Кезектен бас тарту</template>
            <template v-if="locale === 'ru'">Отказаться от очереди</template>
            <template v-if="locale === 'en'">Skip the queue</template>
          </Button>
        </div>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="refusalVisible" :style="{ width: '450px' }" modal header=" ">
    <div class="text-center">
      <h4 v-if="locale === 'kz'">Кезектегі орыннан бас тартқыңыз келетініне сенімдісіз бе?</h4>
      <h4 v-if="locale === 'ru'">Вы уверены, что хотите отказаться от место в очереди?</h4>
      <h4 v-if="locale === 'en'">Are you sure you want to give up your place in queue?</h4>
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
import {getHeader, serverUrl, smartEnuApi} from "@/config/config";
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import moment from "moment";
import io from "socket.io-client";
import LanguageDropdown from "@/LanguageDropdown.vue";
import {useToast} from "primevue/usetoast";

const {t, locale} = useI18n()
const toast = useToast()
const route = useRoute()
const parentId = ref(parseInt(route.params.id))
const queues = ref();
const called = ref(false);
const phoneNumber = ref('');
const isDisabled = ref(true);
const queinfo = ref();
const queuesWS = ref([]);
const currentStep = ref(1);
const reservation = ref(false);
const talonDate = ref('')
const talonTime = ref('')
const queueKey = ref()
const currentTicketWS = ref(null)
const currentTicketAPI = ref(null)
const calledWindow = ref()
const refusalVisible = ref(false)
const categoryName = ref()
const name = ref('');
const lastName = ref('');
const email = ref('');
const emailBool = ref(false);
const selectedQueue = ref();
const selectedDay = ref('');
const selectDayBool = ref(false);
const selectedTime = ref('');
const selectTimeBool = ref(false);
const reservationBtn = ref(false);
const disabledRezervation = ref(false);
const selectedItem = ref();
const daysList = ref([]);
let options = {}
let url = smartEnuApi
if (process.env.NODE_ENV === 'production') {
  url = serverUrl
  options.path = "/api/socket.io"
}
const socket = io(url, options)
const timeList = ref([]);
const emailError = ref('');
const queueId = ref();
const loading = ref(false);

const validateEmail = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value) {
    emailError.value = t('queue.emailReq');
  } else if (!emailPattern.test(email.value)) {
    emailError.value = t('queue.emailInvalid');
  } else {
    emailBool.value = true
    emailError.value = '';
  }
};

const getDays = (data) => {
  axios
      .post(smartEnuApi + "/queue/getAvailableDays", {id: data}, {
        headers: getHeader(),
      })
      .then((response) => {
        daysList.value = response.data
      })
      .catch((error) => {
        console.log(error)
      });
}
const getTimes = (data,date) => {
  axios
      .post(smartEnuApi + "/queue/getAvailableTimes", {id: data, date: date}, {
        headers: getHeader(),
      })
      .then((response) => {
        timeList.value = response.data
      })
      .catch((error) => {
        console.log(error)
      });
}
const changeQueues = (event) => {
  queueId.value = event.value.key
  getDays(event.value.key)
  selectDayBool.value = true
  selectedItem.value = event
}
const changeDay = (event) => {
  selectTimeBool.value = true
  getTimes(queueId.value,event.value)
}

const changeTime = () => {
  reservationBtn.value = true
}

const validatePhoneNumber = (val) => {
  const phoneNumberRegex = /^\+7-\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
  if (reservation.value) {
    if (name.value.trim() !== '' && lastName.value.trim() !== '' && emailBool.value) {
      isDisabled.value = !phoneNumberRegex.test(val)
    }
  } else {
    isDisabled.value = !phoneNumberRegex.test(val)
  }
};

const queue = (bool) => {
  currentStep.value = 2
  reservation.value = bool
}
const sendNumber = () => {
  if (phoneNumber.value) {
    localStorage.setItem('phoneNumber', phoneNumber.value);
    localStorage.setItem('queueParentId', parentId.value);
    currentStep.value = 3
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

watch(() => currentTicketWS.value, (newValue, oldValue) => {
  if (currentTicketWS.value !== null && currentTicketAPI.value !== null) {
    if(currentTicketWS.value === currentTicketAPI.value){
      called.value = currentTicketWS.value === currentTicketAPI.value;
      localStorage.removeItem('queueKey')
    }
  }
});

const combineDateTime = (date, timeSlot) => {
  const datePart = date.split('T')[0];
  return `${datePart}T${timeSlot}Z`;
}
const registerQueue = (queueId, queue) => {
  loading.value = true
  disabledRezervation.value = true
  if (localStorage.getItem('phoneNumber')) {
    localStorage.setItem('queueKey', queueId);
    if (queue) {
      localStorage.setItem('queueCategory', JSON.stringify(queue));
    }
    categoryName.value = JSON.parse(localStorage.getItem('queueCategory'))
    const phoneNumber = localStorage.getItem('phoneNumber')
    const req = {
      queueID: queueId, lang: locale.value, phoneNumber: phoneNumber, queue_name: locale.value === "kz"
          ? categoryName.value.queueNamekz
          : locale.value === "ru"
              ? categoryName.value.queueNameru
              : categoryName.value.queueNameen
    }
    if (reservation.value && name.value.trim() !== '' && lastName.value.trim() !== '' && email.value && selectedDay.value && selectedTime.value) {
      if (queue) {
        queue.reserveBool = true
        localStorage.setItem('queueCategory', JSON.stringify(queue));
      }
      req.last_name = lastName.value
      req.first_name = name.value
      req.email = email.value
      req.reservision_time = combineDateTime(selectedDay.value, selectedTime.value.time_slot)
    }
    axios
        .post(smartEnuApi + "/queue/registerService", req, {
          headers: getHeader(),
        })
        .then((response) => {
          getRegisterService(queueId)
          loading.value = false
          currentStep.value = 4
        })
        .catch((error) => {
          console.log(error)
          toast.add({severity: "error", summary: t(`${error.response.data.error}`)});
          loading.value = false
          timeList.value = []
          currentStep.value = 1
          disabledRezervation.value = false
        });
  }
}
const getRegisterService = (queueId, queue) => {
  loading.value = true
  if (localStorage.getItem('phoneNumber')) {
    localStorage.setItem('queueKey', queueId);
    if (queue) {
      localStorage.setItem('queueCategory', JSON.stringify(queue));
    }

    categoryName.value = JSON.parse(localStorage.getItem('queueCategory'))
    const phoneNumber = localStorage.getItem('phoneNumber')
    const req = {
      phoneNumber: phoneNumber
    }
    if (reservation.value && name.value.trim() !== '' && lastName.value.trim() !== '' && email.value && selectedDay.value && selectedTime.value) {
      req.queueID = queueId
      req.lastName = lastName.value
      req.firstName = name.value
      req.email = email.value
      req.reservision_time = combineDateTime(selectedDay.value, selectedTime.value.time_slot)
    }
    axios
        .post(smartEnuApi + "/queue/getRegisterService", req, {
          headers: getHeader(),
        })
        .then((response) => {
          response.data.time = new Date(response.data.reservation_time).toISOString().substring(11, 16);
          response.data.day = new Date(response.data.reservation_time).toISOString().substring(0, 10);
          queinfo.value = response.data
          currentTicketAPI.value = queinfo.value.queueNumber
          const numMin = response.data.averageTime / 60
          queinfo.value.averageTime = numMin.toFixed(0);
          //splitDateTime(response.data.queueDate)
          loading.value = false
          currentStep.value = 4
        })
        .catch((error) => {
          console.log(error)
          toast.add({severity: "error", summary: t(`${error.response.data.error}`)});
          loading.value = false
          currentStep.value = 1
          disabledRezervation.value = false
        });
  }
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
        currentStep.value = 1
        disabledRezervation.value = false
      })
      .catch((error) => {
        console.log(error)
      });
}
const connected = () => {
  setTimeout(()=>{
    const data = {
      serviceId: 0,
      windowId: 0,
      queueId: parentId.value
    };
    socket.emit('join', data)
    socket.on('msg', (info) => {
      queuesWS.value.unshift(info);
      currentTicketWS.value = queuesWS.value[0].ticket
      calledWindow.value = queuesWS.value[0].window
      if (queuesWS.value.length > 3) {
        queuesWS.value = queuesWS.value.slice(0, 3);
      }
    });
    socket.on("connect_error", (err) => {
      console.log(err)
    });
  },500)
}
connected()
const formatDay = (date) => {
  return moment(new Date(date)).utc().format("YYYY-MM-DD");
}
const formatTime= (date) => {
  return date.time_slot.substring(0, 5);
}
onMounted(() => {
  if (parentId.value !== parseInt(localStorage.getItem('queueParentId'))) {
    localStorage.removeItem('phoneNumber')
  }
  if (localStorage.getItem('phoneNumber') !== null && localStorage.getItem('queueKey') !== null && (parentId.value === parseInt(localStorage.getItem('queueParentId')))) {
    //registerQueue(parseInt(localStorage.getItem('queueKey')), event)
    getRegisterService(parseInt(localStorage.getItem('queueKey')), event)
    const reserveStr = localStorage.getItem('queueCategory')
    const reserveObj = JSON.parse(reserveStr);
    if (reserveStr && reserveObj.reserveBool){
      reservation.value = true
      currentStep.value = 4
    }else {
      currentStep.value = 4
    }
  } else if (localStorage.getItem('phoneNumber') !== null) {
    currentStep.value = 1
  }
})
</script>

<style lang="scss" scoped>
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
    padding: 5px;
    font-weight: 600;
  }
}

.talon_called {
  margin: auto;
  width: 90%;

  .bg {
    margin-top: 20px;
    background: #2cc511;
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
  }

  .blinking {
    animation: blink 0.8s ease-in-out 3;
  }

  .blinking_called {
    background: #2cc511;
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
    background-color: #2cc511;
  }
  50% {
    background-color: #fff;
  }
  75% {
    background-color: #2cc511;
  }
  100% {
    background-color: #fff;
  }
}

.p-inputtext::placeholder {
  color: #ced4da;
}

</style>