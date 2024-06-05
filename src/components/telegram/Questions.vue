<template>
      <div>
  <TitleBlock :title="t('telegram.question')"/>
  <div class="col-12">
        <ToolbarMenu :data="menu2" @search="search" :search="true" @filter="toggleFilter($event)" :filter="true" :filtered="filtered"/>

      </div>
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
    <div class="card">
                 <TreeTable class="p-treetable-sm" :value="nodes" :lazy="true" :loading="loading" @nodeExpand="onExpand"
                     scrollHeight="flex" responsiveLayout="scroll" :resizableColumns="true" show-gridlines columnResizeMode="fit"
                     :paginator="true" :rows="lazyParams.rows" :total-records="total" @page="onPage($event)">
                 <Column field="title_" :header="$t('telegram.question')" expander style="min-width: 35rem;">
          <template #body="{node}">
              {{
                node["title_" + locale]
              }}
          </template>
        </Column>
        <Column field="anwers_" :header="$t('telegram.anwers')" style="min-width: 35rem;">
          <template #body="{node}">
              {{
                node["anwers_" + locale]
              }}
          </template>
        </Column>
        <Column field="creator" :header="$t('telegram.author')">
          <template #body="{node}">
            <span v-if="node.creator">&nbsp;{{ node.creator.fullName }}</span>
          </template>
        </Column>
        <Column field="state" :header="$t('common.state')">
          <template #body="slotProps">
            <span
                :class="'customer-badge status-' + slotProps.node.stateen">{{
                slotProps.node.stateen ? $t('common.states.'+slotProps.node.stateen) : ''
              }}</span>
          </template>
        </Column>
      <Column headerStyle="width: 10rem">
        <template #body="{node}">
          <ActionButton :show-label="true" :items="initItems" @toggle="toggle(node)"/>
        </template>
      </Column>
      </TreeTable>
    </div>
  </div>
          <Sidebar v-model:visible="isView.node" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
            <AddQuestions :modelValue=node :readonly="readonly"/>
</Sidebar>
</template>


<script setup>
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import Column from 'primevue/column';
import TreeTable from 'primevue/treetable';
import {inject,ref, computed, onMounted} from 'vue';
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import AddQuestions from './AddQuetions.vue'
import {QuestionService} from "@/service/question.service";


  const lazyParams = {
        page: 0,
        rows: 10,
        searchText: null,
        parent_id: null,
      }
const filtered = ref(false)
const filter = ref()
const node = ref (null);
const emitter = inject("emitter");
const nodes = ref([]);
const questionService = new QuestionService
const toast = useToast()
const data = ref([]);
const loading = ref(false);
const {t, locale} = useI18n()
const initItems = computed(() => {
  return [
  {
      label: t('common.add'),
      icon: 'fa-solid fa-plus',
      command: () => {
        createQuestion(node.value, node.value.id)
            }
    },
    {
      label: t('common.edit'),
      icon: 'fa-solid fa-pen',
      command: () => {
        update(node.value)
            }
    },
    {
      label: t('common.delete'),
      icon: 'fa-solid fa-trash',
      command: () => {
        deleteValue(node.value);  
            }
    },

  ];
})

const isView = ref({
    node: false
  })

const total = ref(0)
const toggleFilter = (event) => {
  filter.value.toggle(event)
}
const filterClick = (event) => {
  filtered.value = event
}
const deleteValue =(node)=> {
  if (!node) {
    console.error('Node is undefined');
    return;
  }
      const req = {
        id: node.id,
    }
    loading.value = true
    questionService.deleteQuestion(req).then(_ => {
        loading.value = false
        toast.add({severity: "success", summary: t('common.success'), life: 3000});
        emitter.emit('node', true);
        getQuestions()
    }).catch(error => {
        toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        loading.value = false;
    })
  }

const update = (selectedNode) => {
  if (selectedNode != null) {
    node.value = selectedNode;
    isView.value.node = true;
  }
}



const createQuestion = (parentNode = null) => {
  node.value = {};
  node.value.userID = props.userID;
  node.value. parent_id = parentNode ? parentNode.id : null;
  isView.value.node = true;
}; 

  const props = defineProps({
    userID: {
      type: Number,
      default: null,
    },
    modelValue: {
      type: null,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    customType: {
      type: String,
      default: ''
    }
  });
  
  const toggle = (data) => {
    node.value = data
}


  const getQuestions = (node) => {
    const req = {
      page: lazyParams.page,
      rows: lazyParams.rows,
      parent_id: lazyParams.parent_id
    }

    loading.value = true

    questionService.getQuestions(req).then(res => {
      if (node == null) {
        nodes.value = res.data.questions
        total.value = res.data.total
      } else {
        console.log('res.data.questions', res.data.questions)
        console.log('res.data.questions', res.data.questions)
        node.value.children = res.data.questions
      }
      loading.value = false

    }).catch(err => {
      loading.value=false
      toast.add({severity: 'error', summary: t('common.error'), life: 3000})
    })

  }
  const menu2= computed(() => {
  return [
 {
    label: t("common.add"),
    icon: "pi pi-fw pi-plus",
    //disabled: () => props.readonly,
    command: () => {
    createQuestion()
          },
        },
      ]
    })


const onExpand = (data) => {
  console.log(data.id)
  lazyParams.parent_id = Number(data.id)
  lazyParams.is_child = true
  node.value = data
  getQuestions(node)
}

const onPage = (event) => {
    lazyParams.page = event.page + 1;
    lazyParams.rows = event.rows
    getQuestions(null);
  }

  onMounted(() => {
    getQuestions()

    emitter.on('node', (data) => {
          if (data === true) {
            isView.value.node = false
            getQuestions()
          }
      });
  })

</script>
