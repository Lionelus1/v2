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
import camundaServiceInstance from "../../service/helpdesk.service";
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
    console.log("this.currentUser:", this.currentUser);
    if (
      this.components[0] &&
      this.components[0].properties &&
      "vue_component" in this.components[0].properties
    ) {
      this.initStages();
      // this.components[0].value["value"] = this.stages;
      this.$emit("addStagestoValue", this.stages);

      console.log("INIT STAGES");
    }
  },
  watch: {
    components: {
      /* eslint-disable */
      handler(newVal, oldVal) {
        if (!this.isComponentsInitialized) {
          console.log("components changed:", newVal);
          for (var i = 0; i < this.components.length; i++) {
            console.log("*********************");
            console.log(this.components[i].value[this.components[i].key]);
            console.log(this.components[i].defaultValue);
            if (this.components[i].defaultValue) {
              this.components[i].value[this.components[i].key] =
                this.accessProperty(
                  this.currentUser,
                  this.components[i].defaultValue
                );
            }

            console.log("*********************");
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
      console.log("key:", key);
      console.log("component:", component);
      if (component.value[key] == undefined) component.value[key] = [];
      if (data.checked && !component.value[key].includes(data)) {
        component.value[key].push(data);
      } else {
        component.value[key] = component.value[key].filter(
          (item) => item.subject_id !== data.subject_id
        );
      }

      console.log("data:", data);
      console.log("componentkey:", component.value[key]);
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
