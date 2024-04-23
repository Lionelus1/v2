<template>
  <TitleBlock :title="'Title'"/>
  <!-- filtered - іздеу батырмасын басқан кезде иконка түсі өзгереді-->
  <ToolbarMenu :data="menu" @search="search" :search="true" @filter="toggleFilter($event)" :filter="true" :filtered="filtered"/>
  <ToolbarMenu :data="menu2"/>
  <ToolbarMenu :data="menuColor"/>
  <div class="card">
    <div class="mb-3">
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
                    :label="$t('common.clear')" @click="filterClick(false)"/>
          </div>
          <div class="field">
            <Button icon="pi pi-search" :label="$t('common.search')" class="ml-1" @click="filterClick(true)"/>
          </div>
        </div>
      </OverlayPanel>
    </div>
    <DataTable :value="tableData" class="p-datatable-sm" responsiveLayout="scroll" :lazy="true">
      <Column field="name" header="Name"></Column>
      <Column field="year" header="Year"></Column>
      <Column field="capacity" header="Capacity"></Column>
      <Column field="status" header="Status">
        <template #body="{data}">
          <span :class="'customer-badge status-' + data.status[0].id">
            {{data.status[0].name}}
          </span>
        </template>
      </Column>
      <Column headerStyle="width: 10rem">
        <template #body="">
          <div class="inline-flex">
          <Button class="p-button-text p-1 mr-2"  @click="toolbarCommand()">
            <i class="fa-solid fa-eye fa-xl"></i>
          </Button>
          <Button class="p-button-text p-button-warning p-1 mr-2" @click="toolbarCommand()">
            <i class="fa-solid fa-pencil fa-xl"></i>
          </Button>
          <Button class="p-button-text p-button-danger p-1 mr-2"  @click="toolbarCommand()">
            <i class="fa-solid fa-trash-can fa-xl"></i>
          </Button>
          </div>
          <!--          <Button class="p-button-outlined p-button-sm mr-2" icon="pi pi-eye"/>
                    <Button class="p-button-outlined p-button-sm p-button-warning mr-2" icon="pi pi-pencil"/>
                    <Button class="p-button-outlined p-button-sm text-red-500 mr-6" icon="pi pi-trash"/>

                    <Button class="p-button-sm mr-2" icon="pi pi-eye"/>
                    <Button class="p-button-warning p-button-sm mr-2" icon="pi pi-pencil"/>
                    <Button class="p-button-danger p-button-sm mr-2" icon="pi pi-trash"/>-->
        </template>
      </Column>
      <Column headerStyle="width: 10rem">
        <template #body>
          <ActionButton :show-label="true" :items="buttons" @toggle="toggle(data)"/>
        </template>
      </Column>
    </DataTable>
  </div>
  <Share data="http://enu.kz" :disabled="true" :param="true" :label="$t('ncasigner.copy')" @copy="onCopy()" @error="onFail()"/>
  <Dialog v-model:visible="isDialog" :style="{ width: '1000px' }" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
          header=" " :modal="true" class="p-fluid" @hide="hideDialog">
    <div>Content</div>
    <template #footer>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger mr-2"
              @click="hideDialog"/>
      <Button :label="$t('common.save')" icon="pi pi-check"
              class="p-button p-component p-button-success"/>
    </template>
  </Dialog>
</template>

<script setup>
import TitleBlock from "@/components/TitleBlock.vue";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import ActionButton from "@/components/ActionButton.vue";
import Share from "@/components/Share.vue";
import {useToast} from "primevue/usetoast";

const {t, locale} = useI18n()
const filtered = ref(false)
const menu = computed(() => {
  return [
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
    items: [
      {
        label: t("common.toapprove"),
        icon: "fa-regular fa-handshake",
        command: () => {
          alert('dddd')
        }
      },
      {
        label: t("contracts.menu.tocontragent"),
        icon: "fa-solid fa-square-envelope",
        command: () => {
        }
      },
    ],
  },
  {
    label: t("Мысал текст"),
    icon: "pi pi-fw  pi-check",
    disabled: false,
    command: () => {},
    items: [
      {
        label: "123",
        icon: "fa-regular fa-handshake",
        command: () => {
          alert('dddd')
        }
      },
      {
        label: "34234",
        icon: "fa-solid fa-square-envelope",
        command: () => {
        }
      },
    ],
  },
  {
    label: "Тест тест",
    icon: "pi pi-fw  pi-cog",
    disabled: false,
    command: null,
  },
]})
const menu2 = computed(() => {
  return [
    {
      label: t('common.add'),
      icon: "pi pi-plus",
      command: () => {
      },
    },
    {
      label: 'Modal',
      icon: "fa-solid fa-image",
      disabled: false,
      command: () => {
        openDialog()
      },
    },
    {
      label: 'Батырма',
      icon: "pi pi-fw pi-send",
      visible: false,
      command: () => {
      },
    },
    {
      label: 'Екінші батырма',
      icon: "pi pi-fw pi-user",
      command: () => {
      },
    },
    {
      label: t("common.approvalList"),
      icon: "pi pi-fw  pi-check-circle",
      right: true,
    }
  ]
})
const menuColor = computed(() => {
  return [
    {
      label: t('common.add'),
      icon: "pi pi-plus",
      color: "blue",
      command: () => {
      },
    },
    {
      label: t('common.cancel'),
      icon: "fa-solid fa-times",
      disabled: false,
      color: "red",
      command: () => {
        openDialog()
      },
    },
    {
      label: 'Батырма',
      icon: "pi pi-fw pi-send",
      color: "purple",
      command: () => {
      },
    },
    {
      label: 'Екінші батырма',
      icon: "pi pi-fw pi-user",
      color: "green",
      command: () => {
      },
    },
    {
      label: 'Үшінші батырма',
      icon: "pi pi-fw  pi-check-circle",
      color: "yellow",
    }
  ]
})
const tableData = [
  {
    name: "Audi",
    year: 2013,
    capacity: 1.6,
    status: [
      {
        id: 1,
        name: 'ҚҰРЫЛДЫ',
      }
    ],
  },
  {
    name: "BMW",
    year: 2002,
    capacity: 3.5,
    status: [
      {
        id: 2,
        name: 'КЕЛІСУДЕ',
      }
    ],
  },
  {
    name: "Mercedes Benz",
    year: 2021,
    capacity: 3.5,
    status: [
      {
        id: 3,
        name: 'КЕЛІСІЛДІ',
      }
    ],
  },
  {
    name: "Toyota",
    year: 2023,
    capacity: 2.5,
    status: [
      {
        id: 4,
        name: 'ҚАБЫЛДАНБАДЫ',
      }
    ],
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
const isDialog = ref(false)
const toast = useToast()
const toggle = (node) => {
  actionsNode.value = node
}
const toggleFilter = (event) => {
  filter.value.toggle(event)
}
const filterClick = (event) => {
  filtered.value = event
}
const toolbarCommand = () => {
  alert('good')
}
const search = (data) => {
  alert(data)
}
const openDialog = () => {
  isDialog.value = true;
}

const hideDialog = () => {
  isDialog.value = false;
}
const onCopy = () => {
  toast.add({severity: 'success', summary: t('ncasigner.successCopy'), life: 3000});
}
const onFail = () => {
  toast.add({severity: 'warn', summary: t('ncasigner.failCopy'), life: 3000});
}
</script>

<style scoped>

</style>