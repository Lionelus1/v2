<template lang="">
  <div v-for="(component, index) of components" :key="index">
    <div v-if="component.type == 'checklist'">
      <label>{{ $t(component.label) }}</label>
      <span
          v-if="`validate` in component && component.validate"
          style="font-size: 20px; color: red"
          >*</span
        >
      <div v-for="value of component.values" :key="value.key" class="flex items-center" style="margin-top: 2dvh">
      <Checkbox v-model="value.isSelected" :inputId="value.key" @change="handleChange(component)" name="value" :value="value.label" style="margin-right: 1dvh" indeterminate binary/>
    <label :for="value.key">{{ $t(value.label) }}</label>
    </div>
    </div>
    <div v-if="component.type == 'textarea'" class="p-fluid md:col-6">
      <label>{{ $t(component.label) }}</label>
      <span
        v-if="`validate` in component && component.validate"
        style="font-size: 20px; color: red"
        >*</span
      >
      <Textarea
        class="mt-2"
        :disabled="disabled"
        :invalid="component.incorrect"
        v-model="component.value[component.key]"
        autoResize
        rows="5"
        cols="30"
      />
      <small v-if="component.incorrect" id="username-help" style="color: red">{{
        $t("helpDesk.application.enteredIncorrectly")
      }}</small>
    </div>
    <div v-if="component.type == 'select'" class="p-fluid md:col-6">
      <label>{{ $t(component.label) }}</label>
      <span
        v-if="`validate` in component && component.validate"
        style="font-size: 20px; color: red"
        >*</span
      >
      <Dropdown
        v-model="component.value[component.key]"
        :options="component.values"
        optionLabel="label"
        :placeholder="$t('common.select')"
        :disabled="disabled"
        class="w-full md:w-14rem"
      />
      <small v-if="component.incorrect" id="username-help" style="color: red">{{
        $t("helpDesk.application.enteredIncorrectly")
      }}</small>
    </div>
    <div v-if="component.type == 'textfield'" class="p-fluid md:col-6">
      <label>{{ $t(component.label) }}</label
      ><span
        v-if="`validate` in component && component.validate"
        style="font-size: 20px; color: red"
        >*</span
      >
      <InputMask
      v-if="component.key == `phonenumber`"
      placeholder="+7-(777)-777-77-77" mask="+7-(999)-999-99-99"
        :disabled="disabled"
        :invalid="component.incorrect"
        class="mt-2"
        v-model="component.value[component.key]"
      />
      <InputText
      v-else
        :disabled="disabled"
        :invalid="component.incorrect"
        class="mt-2"
        v-model="component.value[component.key]"
      />
      <small v-if="component.incorrect" id="username-help" style="color: red">{{
        $t("helpDesk.application.enteredIncorrectly")
      }}</small>
    </div>
    <div v-if="component.type == 'datetime' && component.subtype == 'time'">
      
      <div class="p-fluid md:col-6">
        <label>{{ $t(component.timeLabel) }}</label>
        
        <span
          v-if="`validate` in component && component.validate"
          style="font-size: 20px; color: red"
          >*</span
        >
        <PrimeCalendar  id="datepicker-timeonly" :disabled="disabled" v-model="component.value[component.key]" timeOnly fluid />
        <!-- component.properties.show_after_button == "false" ? "true" : "false" -->
        <small
          v-if="component.incorrect"
          id="username-help"
          style="color: red"
          >{{ $t("helpDesk.application.enteredIncorrectly") }}</small
        >
      </div>
    </div>
    <div v-if="component.type == 'datetime' && component.subtype == 'date'">
      <div v-if="component.properties && component.properties.withAdditionalCalendar" class="p-fluid md:col-6">
        <label style="margin-bottom: 3dvh">{{ $t(component.dateLabel) }}asdasd</label>
        <div id="full_calendar"></div>
      </div>
      <div v-else class="p-fluid md:col-6">
        <label>{{ $t(component.dateLabel) }}</label>
        <span
          v-if="`validate` in component && component.validate"
          style="font-size: 20px; color: red"
          >*</span
        >
        <PrimeCalendar
          v-model="component.value[component.key]"
          :disabled="disabled"
          dateFormat="dd.mm.yy"
          :placeholder="$t('common.select')"
          :monthNavigator="true"
          :yearNavigator="true"
          yearRange="1990:2050"
        />
        <small
          v-if="component.incorrect"
          id="username-help"
          style="color: red"
          >{{ $t("helpDesk.application.enteredIncorrectly") }}</small
        >
      </div>
    </div>
    <div v-if="component.type == 'table' && component.subtype == 'time'">
      <div class="p-fluid md:col-6">
        <label>{{ $t(component.dateLabel) }}</label
        ><span
          v-if="`validate` in component && component.validate"
          style="font-size: 20px; color: red"
          >*</span
        >
        <PrimeCalendar
          id="calendar-timeonly"
          :disabled="disabled"
          dateFormat="dd.mm.yy"
          :placeholder="$t('common.select')"
          v-model="component.value[component.key]"
          timeOnly
        />
        <small
          v-if="component.incorrect"
          id="username-help"
          style="color: red"
          >{{ $t("helpDesk.application.enteredIncorrectly") }}</small
        >
      </div>
    </div>
    <div
      v-if="
        component.properties &&
        component.type == 'text' &&
        'vue_component' in component.properties
      "
    >
      <ApprovalUsers
        v-if="component.value"
        :approving="approving"
        v-model="component.value"
        @approve="sendToApprove($event)"
        @closed="closeDialog"
        :stages="stages"
        mode="standard"
      ></ApprovalUsers>
    </div>
    <div v-if="component.type == 'table'">
      <Button
        v-if="'show_after_button' in component.properties"
        class="toggle-button"
        style="margin-bottom: 3dvh"
        @click="showTalbe(component)"
        >{{ $t(component.properties.button_name) }}</Button
      >
      <small
          v-if="component.incorrect"
          id="username-help"
          style="color: red"
          >{{ $t("helpDesk.application.enteredIncorrectly") }}</small
        >
      <!-- <div v-if="'vue_component' in component.properties && component.properties["vue_component"] == 'ApprovalUsers'"> -->

      <!-- </div> -->
      <DataTable
        v-if="
          isExist(component.properties, 'show_after_button', 'false') ||
          !('show_after_button' in component.properties)
        "
        :disabled="disabled"
        :value="component.items"
        style="margin-top: 3dvh; margin-bottom: 5dvh; width: 100%"
        :paginator="'rowCount' in component"
        @lazy="true"
        @page="onPage($event, component)"
        :totalRecords="component.totalRecords"
        :rows="component.rowCount"
        :lazy="true"
        stripedRows
      >
        <Column v-if="`selects` in component.properties" field="checkbox">
          <template #body="{ data }">
            <Checkbox
              v-model="data.checked"
              :disabled="disabled"
              :binary="true"
              @change="
                checkBoxSelect(data, component, component.properties.selects)
              "
              style="margin-left: 20px"
            />
          </template>
</Column>
<Column v-for="col of component.columns" :key="col.key" :field="col.key" :header="col.label"></Column>
</DataTable>
</div>
</div>
</template>
<script>
import camundaServiceInstance from "../../../service/helpdesk.service";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import { findRole, getUser } from "@/config/config";
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interaction from '@fullcalendar/interaction';
import kkLocale from '@fullcalendar/core/locales/kk';
import ruLocale from '@fullcalendar/core/locales/ru';
// const { t, locale } = useI18n();
export default {
  props: {
    components: {
      type: Object,
      requried: true,
    },
    disabled: {
      type: Boolean,
      requried: false,
      default: false,
    },
    requestID: {
      requried: false,
    },
  },
  components: { ApprovalUsers },
  data() {
    return {
      stages: null,
      approving: false,
      currentUser: null,
      isComponentsInitialized: false,
      ALIAS: {},
      test: null,
      allEvents: [],
      calendar: null
    };
  },
  mounted() {
    this.initAlias()
    this.currentUser = getUser();
    if (
      this.components[0] &&
      this.components[0].properties &&
      "vue_component" in this.components[0].properties
    ) {
      this.initStages();
      // this.components[0].value["value"] = this.stages;
      this.$emit("addStagestoValue", this.stages);
    }
  },
  updated() {
    // if (this.components.initialized == undefined && !this.isComponentsInitialized) return;


    for (var component of this.components) {
      var isInitialized = !(this.components.initialized == undefined) && this.components.initialized;


      var isReady = true;

      if (!isInitialized && this.disabled) return;
      if (this.disabled) {
        isReady = isInitialized;
      }
      if (isReady && component.properties && component.properties.withAdditionalCalendar && !component.isCalendarRendered) {

        if (this.calendar) {
          this.calendar.destroy();
        }
        this.getCalendar(component);
        // component.isCalendarRendered = true;
      }
    }
  },
  watch: {
    components: {
      /* eslint-disable */
      handler(newVal, oldVal) {
        if (!this.isComponentsInitialized) {
          for (var i = 0; i < this.components.length; i++) {
            if (this.components[i].defaultValue) {
              this.components[i].value[this.components[i].key] =
                this.accessProperty(
                  this.currentUser,
                  this.components[i].defaultValue
                );
            }

          }
        }

        this.isComponentsInitialized = true;
      },
      deep: true, // Use this option if components is an object or array and you need to track nested changes
    },
  },
  methods: {
    handleChange(component) {


      component.value[component.key] = component.values;
      // Find the index of the component in the array
      const index = this.components.findIndex(obj => obj.id === component.id);  // Assuming components have an 'id' to identify them

      if (index !== -1) {
        // Directly replace the component at the found index
        this.components[index] = { ...component, updated: true };  // Modify or replace as needed


      } else {

      }
    },
    getCalendar(component) {




      // var e = true
      // while (e) {
      //   if (component.value[component.key] != null) {
      //     e = false;
      //   }
      // }


      if (!Array.isArray(component.value[component.key])) {
        component.value[component.key] = []
      }
      var length = component.value[component.key].length;
      for (var i = 0; i < component.value[component.key].length; i++) {


        component.value[component.key][i] = { title: 'Выбрано вами', start: component.value[component.key][i] }
      }
      // }


      const calendarEl = document.getElementById('full_calendar');
      if (!calendarEl) {
        return;
      }
      const calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, timeGridPlugin, interaction],
        locales: [kkLocale, ruLocale],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next',
          center: 'title',
          right: ''
        },
        // events: [
        //   { title: 'Meeting', start: new Date() }
        // ],
        events: component.value[component.key],
        // Ensure selectable is true so that dateClick is active
        selectable: true,
        dateClick: (event) => {
          if (this.disabled) return;
          this.dateClick(event, component);
        },
        eventClick: function (info) {
          if (this.disabled) return;
          // Handle event click

        },
        displayEventTime: false
      });
      calendar.render();
      this.calendar = calendar;


      for (var i = 0; i < component.value[component.key].length; i++) {


        component.value[component.key][i] = { title: 'Выбрано вами', start: component.value[component.key][i] }
        // calendar.addEvent({ title: 'Вы заняли', start: component.value[component.key][i] })
      }
    },
    dateClick(info, component) {

      if (component.value[component.key].includes(info.dateStr)) {
        this.removeEventsOnDate(info.dateStr);
        component.value[component.key] = component.value[component.key].filter(item => item !== info.dateStr);  // Filter out the object with id 2
        return;
      };
      component.value[component.key].push(info.dateStr)
      // Triggered when a date is clicked
      this.calendar.addEvent({ title: 'Вы заняли', start: info.date });


    },
    removeEventsOnDate(dateStr) {
      const targetDate = new Date(dateStr).toDateString();  // Convert the target date string to a Date object and normalize
      const events = this.calendar.getEvents();  // Get all events

      events.forEach(event => {
        const eventDate = event.start.toDateString();  // Convert the event's start date to a normalized string

        if (eventDate === targetDate) {
          event.remove();  // Remove the event if it matches the specified date
        }
      });

    },
    eventView(item) {


      if (item.event) {
        this.selectedEvent = item.event.extendedProps;
      } else {
        this.selectedEvent = item;
      }
      this.eventViewVisible = true;
    },
    closeDialog() {
      this.$emit("closeDialog");
    },
    sendToApprove(approval) {
      this.$emit("finishStep", approval);
    },
    accessProperty(data, key) {
      if (key == "fullName" && this.$i18n.locale == "en") {
        return `${data['firstnameEn']} ${data["lastnameEn"]} ${data['thirdnameEn']}`.trim()
      }
      if (key in this.ALIAS[this.$i18n.locale] && this.ALIAS[this.$i18n.locale][key]) {
        key = this.ALIAS[this.$i18n.locale][key];
      }
      // Check if the key contains a dot
      if (key.includes(".")) {
        // Split the string into parts around the dot
        const parts = key.split(".");
        // Access nested properties based on parts
        const a = parts.reduce((acc, part) => acc && acc[part], data);
        return a;
      } else {
        // Access directly if no dot is present
        return data[key];
      }
    },
    initAlias() {
      this.ALIAS = {
        "en": { "mainPosition.department.parent.name": "mainPosition.department.parent.nameEn", "mainPosition.department.cafedra.name": "mainPosition.department.cafedra.nameEn" },
        "kz": { "mainPosition.department.parent.name": "mainPosition.department.parent.nameKz", "mainPosition.department.cafedra.name": "mainPosition.department.cafedra.nameKz" },
        "ru": { "mainPosition.department.parent.name": "mainPosition.department.parent.name", "mainPosition.department.cafedra.name": "mainPosition.department.cafedra.name" }
      }
    },
    initStages() {
      //   if (true) {
      this.stages = [
        {
          stage: 1,
          users: null,
          titleRu: "Декан",
          titleKz: "Декан",
          titleEn: "Декан",
          certificate: {
            namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
            nameru: "Для внутреннего документооборота (ГОСТ)",
            nameen: "For internal document management (GOST)",
            value: "internal",
          },
        },
        {
          stage: 2,
          users: null,
          titleRu: "Офис регистратор",
          titleKz: "Кеңсе тіркеушісі",
          titleEn: "Office registrar",
          certificate: {
            namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
            nameru: "Для внутреннего документооборота (ГОСТ)",
            nameen: "For internal document management (GOST)",
            value: "internal",
          },
        },
      ];
      this.stages = [{
        titleRu: "Институт непрерывного образования",
        titleKz: "Үздіксіз білім беру институты",
        titleEn: "The Institute of Continuing Education",
        "stage": 1, "users": [{ "userID": 134205, "firstName": "Асем", "lastName": "Сериковна", "thirdName": "Ильясова", "firstnameEn": "Assem", "lastnameEn": "", "thirdnameEn": "Ilyassova", "gender": 2, "email": "ilyassova_as@enu.kz", "phoneNumber": "", "fullName": "Ильясова Асем Сериковна", "birthday": "1979-08-01T00:00:00Z", "mainPosition": { "id": 37292, "name": "начальник отдела", "namekz": "бөлім бастығы", "nameru": "начальник отдела", "nameen": "Head of the office", "department": { "id": 22166, "name": "Институт непрерывного образования", "nameKz": "Үздіксіз білім беру институты", "nameRu": "Институт непрерывного образования", "nameEn": "Institute of Continuing Education", "isFaculty": false, "organization": { "id": 0, "iin": "", "name": "", "nameru": "", "resident": 0, "bankaccount": null } }, "organization": { "id": 1, "iin": "010140003594", "name": "Л.Н.Гумилев атындағы Еуразия ұлттық университеті", "nameru": "Евразийский национальный университет имени Л.Н. Гумилева", "nameen": "Eurasian National University named after L.N. Gumilyov", "form": { "id": 27, "name": "Коммерциялық емес акционерлік қоғам", "namerus": "Некоммерческое акционерное общество", "nameen": null, "shortname": "КеАҚ", "shortnameru": "НАО", "shortnameen": "NJSC" }, "email": "enu@enu.kz", "phone": "8 (7172) 70-95-00, 70-94-57", "address": "Сәтпаев к., 2", "addressru": "ул. Сатпаева, 2", "postal": "Сәтпаев к, 2", "resident": 1, "bankaccount": "KZ948562203105904920", "bank": { "id": 6, "organization": null, "swift": "TEST", "corrswift": "TEST", "name": null, "namerus": null, "type": 0 } } }, "academicDegree": { "id": 1, "namekz": "ғылым кандидаты", "nameen": "Candidate of Science", "nameru": "кандидат наук" }, "platonusId": 9325, "IIN": "790801403830", "resident": 1 }], "certificate": { "namekz": "Ішкі құжат айналымы үшін (ГОСТ)", "nameru": "Для внутреннего документооборота (ГОСТ)", "nameen": "For internal document management (GOST)", "value": "internal" }
      }];
      //   } else {
      //     stages = [
      //       {
      //         stage: 1,
      //         users: selectedUsers,
      //         titleRu: "Институт непрерывного образования",
      //         titleKz: "Үздіксіз білім беру институты",
      //         titleEn: "Institute of Continuing Education",
      //         certificate: {
      //           namekz: "Ішкі құжат айналымы үшін (ГОСТ)",
      //           nameru: "Для внутреннего документооборота (ГОСТ)",
      //           nameen: "For internal document management (GOST)",
      //           value: "internal",
      //         },
      //       },
      //     ];
      //   }
    },
    checkBoxSelect(data, component, key) {
      if (component.value[key] == undefined) component.value[key] = [];
      if (data.checked && !component.value[key].includes(data)) {
        component.value[key].push(data);
      } else {
        component.value[key] = component.value[key].filter(
          (item) => item.subject_id !== data.subject_id
        );
      }

    },
    isExist(obj, key, value) {
      // Check if the key exists in the object
      if (key in obj) {
        // Check if the value associated with the key matches the given value
        return obj[key] === value;
      } else {
        // If the key doesn't exist in the object, return false
        return false;
      }
    },
    showTalbe(component) {
      component.properties.show_after_button =
        component.properties.show_after_button == "false" ? "true" : "false";
    },
    onPage(event, component) {
      camundaServiceInstance.initTableInf(component, event.page);
    },
  },
};
</script>
<style lang="scss" scoped>
.news_cards {
  .news_card {
    border: 1px solid #dee2e6;
    border-radius: 15px;

    .news_content {
      padding: 15px;
      position: absolute;
      bottom: 0;
      color: #fff;

      .date {
        color: #ccc;
      }
    }

    .news_title {
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      display: -webkit-box;
      display: -moz-box;
      overflow: hidden;
    }

    .img {
      position: relative;
      border-radius: 15px;
      height: 220px;
    }

    .img:before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 50%;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgb(41, 48, 66) 100%);
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }

    .news_tag {
      background: #007be5;
      color: #fff;
      padding: 2px 5px;
      bottom: 14px;
      left: 10px;
      width: fit-content;
      border-radius: 5px;
    }
  }

  img {
    border-radius: 15px;
    object-fit: cover;
  }
}

.skeletons {
  width: 80%;

  .skeleton {
    display: flex;
    margin: 15px 0;
    padding: 10px;

    .skeleton_img {
      width: 9rem !important;
      height: 6rem !important;
      border-radius: 5px !important;
    }

    .first_skeleton {
      width: 90% !important;
      height: 2rem !important;
      margin-bottom: 20px !important;
    }

    .second_skeleton {
      width: 25% !important;
    }

  }
}

.post {
  cursor: pointer;
  display: flex;
  margin: 15px 0;
  width: 100%;
  border-radius: 5px;
  padding: 10px;
  //box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%), 0 1px 1px 0 rgb(0 0 0 / 14%), 0 1px 3px 0 rgb(0 0 0 / 12%);

  .text {
    padding: 0 0 0 10px;
    display: flex;
    flex-direction: column;

    .date {
      color: #838080;
      margin-top: 10px;
    }
  }

  .img {
    width: 120px;
    height: 80px;

    img {
      width: 120px;
      height: 100%;
      border-radius: 5px;
      object-fit: cover;
      box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19);
    }
  }
}

.calendar_buttons button {
  border-radius: 10px;
  padding: 7px 20px;
}

:deep(.fc-button-group button) {
  border-radius: 10px;
}

.calendar_buttons .calendar_btn_left {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.calendar_buttons .calendar_btn_right {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.calendar_buttons button.active {
  background: #007be5;
  color: #fff;
  border: 1px solid #007be5;
}

:deep(.fc-button-primary) {
  background: #007be5;
  border: 1px solid #fff;
}

:deep(.fc-unthemed td.fc-today) {
  background: #e9f7ff;
}

:deep(.fc-day-grid-event) {
  cursor: pointer;
}

@media (max-width: 780px) {

  .skeletons,
  .post {
    width: 100%;
  }
}

@media (max-width: 550px) {

  .skeletons,
  .post {
    width: 100%;
  }

  .skeletons {
    .skeleton {
      .skeleton_img {
        width: 7rem !important;
        height: 5rem !important;
      }

      .first_skeleton {
        width: 100% !important;
      }

      .second_skeleton {
        width: 40% !important;
      }
    }
  }

  .post {
    .img {
      width: 100px;
      height: 70px;

      img {
        width: 100px;
      }
    }

    .text {
      strong {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }

  .card_bottom {
    padding: 0;
  }

  .card_title {
    font-size: 16px;
  }

  .news_cards {
    .col-6 {

      .img,
      img {
        height: 100px;
      }
    }
  }

  .news_content {
    font-size: 11px;
  }
}

@media only screen and (max-width: 1920px) and (min-width: 1535px) {
  .news_cards {
    .col-4 {

      .img,
      img {
        height: 280px;
      }
    }

    .col-3 {

      .img,
      img {
        height: 250px;
      }
    }
  }
}
</style>
