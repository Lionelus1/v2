<template>
  <div>
    <TitleBlock :title="t('showcase.title')" />
    <div class="col-12">
      <ToolbarMenu :data="menu2" @change="search" :search="true" />
    </div>
    <div class="card">
      <DataTable
          :value="nodes"
          :lazy="true"
          :loading="loading"
          :paginator="true"
          :rows="lazyParams.rows"
          :total-records="total"
          :responsiveLayout="'scroll'"
          :resizableColumns="true"
          showGridlines
          columnResizeMode="fit"
          @page="onPage"
          :data="menu"
      >
      <Column :header="$t('showcase.name')" style="min-width: 35rem">
          <template #body="{ data }">
            {{ data["title_" + locale] }}
            <Badge style="margin-left:5px" :value="$t('web.isHidden')" v-if="data.hiden"></Badge>
          </template>
        </Column>
        <Column field="status" :header="$t('showcase.status')">
          <template #body="{ data }">
    <span
        :class="{
        'customer-badge status-создан': ['создан', 'created', 'құрылды'].includes(data.state['name_' + locale]),
        'customer-badge status-опубликован': ['опуликовано', 'published', 'жарияланды'].includes(data.state['name_' + locale]),
      }"
    >
      {{ data.state["name_" + locale] }}
    </span>
          </template>
        </Column>

        <Column field="creator" :header="$t('showcase.author')">
          <template #body="{ data }">
            <span v-if="data.user">&nbsp;{{ data.user.fullName }}</span>
          </template>
        </Column>
        <Column :header="$t('showcase.publication')" >
          <template #body="{ data }">
            {{ new Date(data.state.create_date).toLocaleDateString( 'ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }
          ) }}
          </template>
        </Column>
        <Column headerStyle="width: 10rem" :header="$t('hikvision.actions')">
          <template #body="{ data }">
            <ActionButton :show-label="true" :items="initItems(data)" @toggle="toggle(node)"/>
          </template>
        </Column>

      </DataTable>
    </div>
    <Sidebar
        v-model:visible="isView.node"
        position="right"
        class="p-sidebar-lg"
        style="overflow-y: scroll"
    >
      <AddShowcase :modelValue="node" :readonly="readonly" />
    </Sidebar>
  </div>
</template>

<script setup>
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { inject, ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import AddShowcase from "./AddShowcase.vue";
import { ShowcaseService } from "@/service/showcase.service";
import { fileRoute, smartEnuApi} from "@/config/config";
import { useConfirm } from 'primevue/useconfirm';

const lazyParams = {
  page: 0,
  rows: 10,
  search_text: "",
};

const filter = ref({
  search_text: "",
});

const showcaseService = new ShowcaseService();
const node = ref(null);
const nodes = ref([]);
const toast = useToast();
const { t, locale } = useI18n();
const emitter = inject("emitter");

const initItems = (data) => [
  ...(data.state &&
  !['опуликовано', 'published', 'жарияланды'].includes(
      data.state.name_ru || data.state.name_en || data.state.name_kz
  )
      ? [
        {
          label: t("common.publish"),
          icon: "fa-solid fa-circle-check",
          command: () => updateStatus(data),
        },
      ]
      : []),
  {
    label: t("common.edit"),
    icon: "fa-solid fa-pen",
    command: () => update(data),
  },
  {
    label: t("common.delete"),
    icon: "fa-solid fa-trash",
    command: () => deleteValue(data),
  },
  {
    label: data.hiden ? t("common.unhide") : t("common.hide"),
    icon: data.hiden ? "fa-solid fa-eye" : "fa-solid fa-eye-slash",
    command: () => hideValue(data),
  },
];



const isView = ref({
  node: false,
});
const total = ref(0);
const loading = ref(false);

const updateStatus = (data) => {
  const requestData = {
    showcase_id: data.id,
    status: 'published'  
  };

  showcaseService.updateStatus(requestData)
      .then(response => {
        toast.add({ severity: "success", summary: t("common.success"), life: 3000 });
        getShowcase();
      })
      .catch(error => {
        toast.add({ severity: "error", summary: t("common.error"), life: 3000 });
      });
};

const confirm = useConfirm();

const deleteValue = (selectedNode) => {
  if (!selectedNode) return;
  const req = { id: selectedNode.id };
  confirm.require({
    message: t('common.doYouWantDelete'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button p-button-success',
    rejectClass: 'p-button p-button-danger',
    accept: async () => {
      try {
        loading.value = true;
        await showcaseService.deleteShowcase(req);
        loading.value = false;
        toast.add({ severity: "success", summary: t('common.success'), life: 3000 });
        getShowcase();
      } catch (error) {
        loading.value = false;
        toast.add({ severity: "error", summary: t('common.error'), life: 3000 });
      }
    },
    reject: () => {
      toast.add({ severity: "info", summary: t('common.canceled'), life: 3000 });
    },
  });
};
const hideValue = (selectedNode) => {
  if (!selectedNode) return;

  const newHiddenState = !selectedNode.hiden;
  const req = {
    id: selectedNode.id,
    hiden: newHiddenState,
  };

  loading.value = true;

  showcaseService.hideShowcase(req)
      .then(() => {
        loading.value = false;
        toast.add({
          severity: "success",
          summary: newHiddenState
              ? t("common.hiddenSuccess")
              : t("common.unhiddenSuccess"),
          life: 3000,
        });
        getShowcase();
      })
      .catch((error) => {
        toast.add({ severity: "error", summary: t("common.error"), life: 3000 });
        loading.value = false;
      })
};

const update = (selectedNode) => {
  if (selectedNode != null) {
    node.value = { ...selectedNode };
    if (node.value.file_path) {
      node.value.file_path = smartEnuApi + fileRoute + selectedNode.file_path;
    }

    isView.value.node = true;
  }
};

const search = (data) => {
  const searchText = data.target.value;
  lazyParams.search_text = searchText;
  getShowcase();
};

const createShowcase = () => {
  node.value = {};
  node.value.userID = props.userID;
  isView.value.node = true;
};



const props = defineProps({
  userID: {
    type: Number,
    default: null,
  },
  modelValue: {
    type: null,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  customType: {
    type: String,
    default: '',
  },
});

const toggle = (data) => {
  node.value = data;
};

const getShowcase = () => {
  const req = {
    page: lazyParams.page,
    rows: lazyParams.rows,
    search_text: lazyParams.search_text,
  };

  loading.value = true;

  showcaseService.getShowcase(req)
      .then((res) => {
        nodes.value = res.data.showcases;
        total.value = res.data.total;
        loading.value = false;
      })
      .catch((err) => {
        loading.value = false;
        toast.add({ severity: "error", summary: t("common.error"), life: 3000 });
      });
};

const menu2 = computed(() => [
  {
    label: t("common.add"),
    icon: "pi pi-fw pi-plus",
    command: () => createShowcase(),
  },
]);

const onPage = (event) => {
  lazyParams.page = event.page;
  lazyParams.rows = event.rows;
  getShowcase();
};

watch(
    () => filter.value.search_text,
    (SearchText) => {
      lazyParams.search_text = SearchText;
    }
);

onMounted(() => {
  getShowcase();

  emitter.on('node', (data) => {
    if (data === true) {
      node.value = null;
      isView.value.node = false;
      getShowcase();
    }
  });
});

</script>

<style scoped>
.customer-badge.status-создан {
  background: #b3e5fc;
  color: #0277bd;
}
.customer-badge.status-опубликован {
  background: #c8e6c9;
  color: #256029;     /* Темно-синий текст */
}
</style>