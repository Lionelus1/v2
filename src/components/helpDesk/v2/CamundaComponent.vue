<template lang="">
  <div v-for="(component, index) of components" :key="index">
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
      <InputText
        :disabled="disabled"
        :invalid="component.incorrect"
        class="mt-2"
        v-model="component.value[component.key]"
      />
      <small v-if="component.incorrect" id="username-help" style="color: red">{{
        $t("helpDesk.application.enteredIncorrectly")
      }}</small>
    </div>
    <div v-if="component.type == 'datetime' && component.subtype == 'date'">
      <div class="p-fluid md:col-6">
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
      ALIAS: {}
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
<style lang=""></style>
