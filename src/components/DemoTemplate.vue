<template>
  <TitleBlock :title="'Title'"/>
  <ToolbarMenu :data="menu" @search="search" :search="true"/>
  <div class="card">
    <div class="mb-3">
      <!--    <Button type="button" icon="fa-solid fa-filter" :label="$t('common.filter')"
                  @click="toggleFilter( $event)" aria:haspopup="true" aria-controls="overlay_panel"
                  class="p-button-outlined mr-2" />-->
      <OverlayPanel ref="filter">
        <div v-for="text in menu_radio_options" :key="text" class="flex align-items-center">
          <div class="field-radiobutton">
            <RadioButton :value="text.value"/>
            <label :for="text" class="ml-2">{{ text.text }}</label>
          </div>
        </div>
        <div class="p-fluid">
          <div class="field">
            <br/>
            <Button icon="pi pi-trash" class="p-button-outlined ml-1"
                    :label="$t('common.clear')"/>
          </div>
          <div class="field">
            <Button icon="pi pi-search" :label="$t('common.search')" class="ml-1"/>
          </div>
        </div>
      </OverlayPanel>
    </div>
    <DataTable :value="tableData" class="p-datatable-sm" responsiveLayout="scroll">
      <Column field="name" header="Name"></Column>
      <Column field="year" header="Year"></Column>
      <Column field="capacity" header="Capacity"></Column>
      <Column headerStyle="width: 40rem">
        <template #body="{data}">
          <div :class="{'test': data.id}"></div>
          <Button class="p-button-text p-1 mr-2">
            <i class="fa-solid fa-eye fa-xl"></i>
          </Button>
          <Button class="p-button-text p-button-warning p-1 mr-2">
            <i class="fa-solid fa-pencil fa-xl"></i>
          </Button>
          <Button class="p-button-text p-button-danger p-1 mr-6">
            <i class="fa-solid fa-trash-can fa-xl"></i>
          </Button>

          <Button class="p-button-outlined p-button-sm mr-2" icon="pi pi-eye"/>
          <Button class="p-button-outlined p-button-sm p-button-warning mr-2" icon="pi pi-pencil"/>
          <Button class="p-button-outlined p-button-sm text-red-500 mr-6" icon="pi pi-trash"/>

          <Button class="p-button-sm mr-2" icon="pi pi-eye"/>
          <Button class="p-button-warning p-button-sm mr-2" icon="pi pi-pencil"/>
          <Button class="p-button-danger p-button-sm mr-2" icon="pi pi-trash"/>
        </template>
      </Column>
      <Column headerStyle="width: 10rem">
        <template #body>
          <ActionButton :show-label="true" :items="buttons" @toggle="toggle(data)"/>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import TitleBlock from "@/components/TitleBlock.vue";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import ActionButton from "@/components/ActionButton.vue";

const {t, locale} = useI18n()
const menu = ref([
  {
    label: t("common.save"),
    icon: "pi pi-fw pi-save",
    disabled: false,
    command: () => {
      toolbarCommand()
    },
  },
  {
    label: t("common.send"),
    icon: "pi pi-fw pi-send",
    disabled: true,
    command: () => {
    },
  },
  {
    label: t("common.approvalList"),
    icon: "pi pi-fw  pi-check-circle",
    disabled: false,
    command: () => {
    },
  },
  {
    label: t("Мысал текст"),
    icon: "pi pi-fw  pi-check",
    disabled: false,
    command: null,
  },
  {
    label: "Тест тест",
    icon: "pi pi-fw  pi-cog",
    disabled: false,
    command: null,
  },
])
const tableData = [
  {
    name: "Audi",
    year: 2013,
    capacity: 1.6,
  },
  {
    name: "BMW",
    year: 2002,
    capacity: 3.5,
  },
  {
    name: "Mercedes Benz",
    year: 2021,
    capacity: 3.5,
  },
  {
    name: "Toyota",
    year: 2023,
    capacity: 2.5,
  }
]
const buttons = computed(() => {
      return [
        {
          label: t('common.edit'),
          icon: 'fa-solid fa-pen',
          command: () => {
          }
        },
        {
          label: t('common.delete'),
          icon: 'fa-solid fa-trash',
          visible: true,
          command: () => {
          }
        },
      ];
    }
)
const menu_radio_options = ref([
  {
    text: t('web.mainMenu'),
    value: 'is_main'
  },
  {
    text: t('web.headerMenu'),
    value: 'is_header'
  },
  {
    text: t('web.middleMenu'),
    value: 'is_middle'
  },
  {
    text: t('web.usefulMenu'),
    value: 'is_usefull_link'
  }
])
const actionsNode = ref(null)
const filter = ref()
const toggle = (node) => {
  actionsNode.value = node
}
const toggleFilter = (event) => {
  filter.value.toggle(event)
}
const toolbarCommand = () => {
  alert('good')
}
const search = (data) => {
  alert(data)
}
</script>

<style scoped>

</style>