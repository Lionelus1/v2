<template>
  <div>
    <TitleBlock :title="t('telegram.question')"/>
    <div class="col-12">
      <ToolbarMenu :data="menu2" @change="search" :search="true"/>
          </div>
    <div class="card">
      <TreeTable class="p-treetable-sm" :value="nodes" :lazy="true" :loading="loading" @nodeExpand="onExpand"
                 scrollHeight="flex" responsiveLayout="scroll" :resizableColumns="true" show-gridlines columnResizeMode="fit"
                 :paginator="true" :rows="lazyParams.rows" :total-records="total" @page="onPage($event)">
        <Column field="title_" :header="$t('telegram.question')" expander style="min-width: 35rem;">
          <template #body="{node}">
            {{ node["title_" + locale] }}
          </template>
        </Column>
        <Column field="anwers_" :header="$t('telegram.anwers')" style="min-width: 35rem;">
          <template #body="{node}">
            {{ node["anwers_" + locale] }}
          </template>
        </Column>
        <Column field="creator" :header="$t('telegram.author')">
          <template #body="{node}">
            <span v-if="node.user">&nbsp;{{ node.user.fullName }}</span>
          </template>
        </Column>
        <Column>
          <template #body="{node}">
            <div class="inline-flex">
              <Button @click="question=node;downloadFile(node?.doc.filePath)" v-if="node?.doc" :disabled="!node?.doc" class="p-button-text p-button-info p-1">
                <i class="fa-solid fa-file-arrow-down fa-xl" />
              </Button>
            </div>
          </template>
        </Column>
        <Column headerStyle="width: 10rem">
          <template #body="{node}">
            <ActionButton :show-label="true" :items="getItemsForNode(node)" @toggle="toggle(node)"/>
          </template>
        </Column>
      </TreeTable>
    </div>
    <Sidebar v-model:visible="isView.node" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
      <AddQuestions :modelValue="node" :readonly="readonly"/>
    </Sidebar>
  </div>
</template>

<script setup>
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import Column from 'primevue/column';
import TreeTable from 'primevue/treetable';
import { inject, ref, computed, onMounted, watch } from 'vue';
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import AddQuestions from './AddQuetions.vue';
import { QuestionService } from "@/service/question.service";
import { downloadFile } from "@/config/config";

const lazyParams = {
  page: 0,
  rows: 10,
  search_text: '',
  parent_id: null,
};

const filter = ref({
  search_text: '',
});

const questionService = new QuestionService();
const node = ref(null);
const question = ref(null);
const emitter = inject("emitter");
const nodes = ref([]);
const toast = useToast();
const { t, locale } = useI18n();
const userRoles = ref(['telegram']);

const initItems = computed(() => [
  {
    label: t('common.add'),
    icon: 'fa-solid fa-plus',
    command: () => createQuestion(node.value, node.value.id),
    roles: ['telegram'],
  },
  {
    label: t('common.edit'),
    icon: 'fa-solid fa-pen',
    command: () => update(node.value),
    roles: ['telegram'],
  },
  {
    label: t('common.delete'),
    icon: 'fa-solid fa-trash',
    command: () => deleteValue(node.value),
    roles: ['telegram'],
  },
]);

const isView = ref({
  node: false,
});
const total = ref(0);
const loading = ref(false);

const deleteValue = (node) => {
  if (!node) {
    return;
  }
  const req = {
    id: node.id,
  };

  loading.value = true;

  questionService.deleteQuestion(req)
      .then(() => {
        loading.value = false;
        toast.add({ severity: "success", summary: t('common.success'), life: 3000 });
        emitter.emit('node', true);
        getQuestions();
      })
      .catch(error => {
        toast.add({ severity: 'error', summary: t('common.error'), life: 3000 });
        loading.value = false;
      });
};

const update = (selectedNode) => {
  if (selectedNode != null) {
    node.value = selectedNode;
    isView.value.node = true;
  }
};

const search = (data) => {
  const searchText = data.target.value;
  lazyParams.search_text = searchText;
  lazyParams.parent_id = null;
  getQuestions();
};

const createQuestion = (parentNode = null) => {
  node.value = {};
  node.value.userID = props.userID;
  node.value.parent_id = parentNode ? parentNode.id : null;
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

const getQuestions = (node = null) => {
  const req = {
    page: lazyParams.page,
    rows: lazyParams.rows,
    parent_id: lazyParams.parent_id,
    search_text: lazyParams.search_text,
  };

  loading.value = true;

  questionService.getQuestions(req).then(res => {
    if (node == null) {
      nodes.value = res.data.questions;
      total.value = res.data.total;
    } else {
      node.value.children = res.data.questions;
    }
    loading.value = false;
  }).catch(err => {
        loading.value = false;
        toast.add({ severity: 'error', summary: t('common.error'), life: 3000 });
      });
};

const menu2 = computed(() => [
  {
    label: t("common.add"),
    icon: "pi pi-fw pi-plus",
    command: () => createQuestion(),
  },
]);


const onExpand = (data) => {
  lazyParams.parent_id = Number(data.id);
  lazyParams.is_child = true;
  node.value = data;
  getQuestions(node);
};

const onPage = (event) => {
  lazyParams.page = event.page;
  lazyParams.rows = event.rows;
  lazyParams.parent_id = null;
  getQuestions();
};

watch(() => filter.value.search_text, (SearchText) => {
  lazyParams.search_text = SearchText;
});

onMounted(() => {
  getQuestions();

  emitter.on('node', (data) => {
    if (data === true) {
      node.value = null;
      lazyParams.parent_id = null;
      isView.value.node = false;
      getQuestions();
    }
  });
});
const hasTelegramRole = computed(() => {
  return userRoles.value.includes('telegram');
});
const getItemsForNode = () => {
  return hasTelegramRole.value ? initItems.value : [];
};
</script>
