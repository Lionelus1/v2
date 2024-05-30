<template>
  <div :class="['card',{'talon_bg': currentStep === 3 , 'mt-6': currentStep !==3 }]">
    <div :class="['flex', 'flex-column', 'm-auto', 'gap-2', {'text-center': !reservation, 'gap-4': !reservation,}]" v-if="currentStep === 1">
      <template v-if="reservation">
        <h4 class="m-0">{{ $t('contact.lname') }}</h4>
        <InputText class="p-inputtext-lg" v-model="lastName"/>
        <h4 class="m-0">{{ $t('common.name') }}</h4>
        <InputText class="p-inputtext-lg" v-model="name"/>
        <h4 class="m-0">Email</h4>
        <InputText class="p-inputtext-lg" v-model="email"/>
      </template>
      <h4 class="m-0">{{ $t('contact.phone') }}</h4>
      <InputMask class="p-inputtext-lg" v-model="phoneNumber"
                 @update:modelValue="validatePhoneNumber" placeholder="+7-(777)-777-77-77" mask="+7-(999)-999-99-99" @keyup.enter="sendNumber"/>
      <Button :class="['justify-content-center', 'p-button-lg', {'mt-4': reservation}]" @click="sendNumber()" :disabled="isDisabled">
        {{ $t('common.continue') }}
      </Button>
    </div>
    <div class="m-auto flex flex-column gap-3" v-if="currentStep === 2">
      <template v-if="!reservation">
        <Button class="p-button-lg text-left p-3" style="width: 100%" v-for="i of queues" :key="i" @click="registerQueue(i.key,i)">
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
        <div class="card">
          <Dropdown @change="changeQueues" v-model="selectedQueue" :options="queues" option-label="queueNamekz" :placeholder="$t('common.select')"
                    class="p-inputtext-lg w-full mb-4"/>
          <Dropdown v-if="selectDayBool" @change="changeDay" v-model="selectedDay" :options="futureDays" placeholder="Күн"
                    class="p-inputtext-lg w-full mb-4"/>
          <Dropdown v-if="selectTimeBool" @change="changeTime" v-model="selectedTime" :options="hoursList" placeholder="Уақыт"
                    class="p-inputtext-lg w-full mb-4"/>
          <Button v-if="reservationBtn" class="justify-content-center p-button-lg w-full"
                  @click="registerQueue(selectedItem.value.key, selectedItem.value)">{{ $t('Брондау') }}
          </Button>
        </div>
      </template>
    </div>
    <div v-if="currentStep === 3">
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
                  <span v-if="locale === 'en'"> </span>
                  <b>{{ lastName + ' ' + name }} </b>
                  <span v-if="locale === 'kz'">, сіз кезекке сәтті жазылдыңыз!</span>
                  <span v-if="locale === 'ru'">, вы успешно записались!</span>
                  <span v-if="locale === 'en'"> </span>
                </div>
                <div class="dashed text-left">
                  <span v-if="locale === 'kz'">Күні: </span>
                  <span v-if="locale === 'ru'">Дата: </span>
                  <span v-if="locale === 'en'">Day: </span>
                  <b>{{ selectedDay }}</b>
                </div>
                <div class="dashed text-left">
                  <span v-if="locale === 'kz'">Уақыты: </span>
                  <span v-if="locale === 'ru'">Время: </span>
                  <span v-if="locale === 'en'">Time: </span>
                  <b>{{ selectedTime }}</b>
                </div>
                <!--                <div class="flex justify-content-between font-bold">
                                  <div>{{ talonDate }}</div>
                                  <div>{{ talonTime }}</div>
                                </div>-->
              </div>
            </template>
            <div class="dots"></div>
          </template>
          <ProgressSpinner v-else class="progress-spinner" strokeWidth="2" style="width: 50px;"/>
        </div>
        <div class="talon_list">
          <div v-if="!reservation" class="flex justify-content-between ml-5 mb-2">
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
import {computed, onMounted, ref, watch} from "vue";
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import moment from "moment";
import {socket} from "@/main";

const {t, locale} = useI18n()
const route = useRoute()
const parentId = ref(parseInt(route.params.id))
const queues = ref();
const called = ref(false);
const phoneNumber = ref('');
const isDisabled = ref(true);
const queinfo = ref();
const queError = ref();
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
const selectedQueue = ref();
const selectedDay = ref('');
const selectDayBool = ref(false);
const selectedTime = ref('');
const selectTimeBool = ref(false);
const reservationBtn = ref(false);
const selectedItem = ref();
const daysOfWeek = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
const futureDays = ref([]);

const changeQueues = (event) => {
  selectDayBool.value = true
  selectedItem.value = event
}
const changeDay = () => {
  selectTimeBool.value = true
}

const changeTime = () => {
  reservationBtn.value = true
}
const formatDate = (date) => {
  const dayOfWeek = daysOfWeek[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${dayOfWeek}, ${day}.${month}.${year}`;
};

const calculateFutureDays = () => {
  const currentDate = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + i);
    days.push(formatDate(futureDate));
  }
  futureDays.value = days;
};

calculateFutureDays();

const hoursList = ref([]);

const generateHoursList = computed(() => {
  const hours = [];
  for (let hour = 9; hour <= 18; hour++) {
    hours.push(`${hour}:00`);
    hours.push(`${hour}:20`);
  }
  return hours;
});

const updateHoursList = () => {
  hoursList.value = generateHoursList.value;
};

updateHoursList();

const validatePhoneNumber = (val) => {
  const phoneNumberRegex = /^\+7-\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
  if (reservation.value) {
    if (name.value.trim() !== '' && lastName.value.trim() !== '') {
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

watch(() => currentTicketWS.value, (newValue, oldValue) => {
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
  return talonTime.value
};
const registerQueue = (queueId, queue) => {
  if (localStorage.getItem('phoneNumber')) {
    localStorage.setItem('queueKey', queueId);
    if (queue) {
      localStorage.setItem('queueCategory', JSON.stringify(queue));
    }

    categoryName.value = JSON.parse(localStorage.getItem('queueCategory'))
    const phoneNumber = localStorage.getItem('phoneNumber')
    const req = {
      queueID: queueId, lang: locale.value, phoneNumber: phoneNumber
    }
    if (reservation.value && name.value.trim() !== '' && lastName.value.trim() !== '' && selectedDay.value && selectedTime.value) {
      req.lastName = lastName.value
      req.firstName = name.value
      req.email = name.value
      req.day = selectedDay.value
      req.time = selectedTime.value
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
  },500)

}


onMounted(() => {
  connected()
  if (parentId.value !== parseInt(localStorage.getItem('queueParentId'))) {
    localStorage.removeItem('phoneNumber')
  }
  if (localStorage.getItem('phoneNumber') !== null && localStorage.getItem('queueKey') !== null && (parentId.value === parseInt(localStorage.getItem('queueParentId')))) {
    registerQueue(parseInt(localStorage.getItem('queueKey')), event)
    currentStep.value = 3
  } else if (localStorage.getItem('phoneNumber') !== null) {
    currentStep.value = 1
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

  .bg {
    margin-top: 20px;
    background: #2cc511;
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