<template>
      <div>
  <TitleBlock :title="t('telegram.question')"/>
  <div class="col-12">
        <Menubar :model="menu2" :key="active" style="height:36px;margin-top:-7px;margin-left:-14px;margin-right:-14px"></Menubar>
      </div>
  <TabPanel>
    <TreeTable ref="edutreetable" :scrollable="true" :scrollHeight="windowHeight + 'px'" class="p-treetable-sm"
                 @node-select="onNodeSelect" :value="nodes" :lazy="true" :loading="loading"
                 @nodeExpand="onExpand($event, true)" selectionMode="single" v-model:selectionKeys="selected">
        <Column field="title_" :header="$t('telegram.question')" :expander="true"  style="min-width: 35rem;">
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
        <Column headerStyle="width: 10rem" >
          <template #body="{node}">
          <div class="inline-flex">
          <Button class="p-button-text p-button-warning p-1 mr-2" @click="update(node)">
            <i class="fa-solid fa-pencil fa-xl"></i>
          </Button>

          <Button class="p-button-text p-button-danger p-1 mr-2"  @click="deleteValue(node)">
  <i class="fa-solid fa-trash-can fa-xl"></i>
</Button>

          </div>
        </template>
      </Column>

      </TreeTable>
  </TabPanel>
  </div>
          <Sidebar v-model:visible="isView.node" position="right" class="p-sidebar-lg" style="overflow-y: scroll">
            <AddQuestions :modelValue=node :readonly="readonly"/>
</Sidebar>
</template>


<script setup>
import Column from 'primevue/column';
import TreeTable from 'primevue/treetable';
import {ref, computed, onMounted} from 'vue';
import {useI18n} from "vue-i18n";
import {findRole} from "@/config/config";
import {useToast} from "primevue/usetoast";
import {createLogger, useStore} from "vuex";
import {useRouter} from "vue-router";
import AddQuestions from './AddQuetions.vue'
import {QuestionService} from "@/service/question.service";

const isView = ref({
    node: false
  })
      // courseDialog: false,
const lazyParams = {
        page: 0,
        rows: 10,
        searchText: null,
      }

const node = ref (null);
const nodes = ref([]);
const questionService = new QuestionService
const academicDegree = ref(null)
const toast = useToast()
const data = ref([]);
const loading = ref(false);
const {t, locale} = useI18n()
const deleteValue =(node)=> {
      const req = {
        id: node.id,
    }

    console.log(req)
    loading.value = true
    questionService.deleteQuestion(req).then(_ => {
        loading.value = false
        toast.add({severity: "success", summary: t('common.success'), life: 3000});
        getQuestions()
    }).catch(error => {
        toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        loading.value = false;
    })
  }


// const update = () => {
//   if (node.value != null) {
//     isView.value.node = true
//   }
// }

const update = (selectedNode) => {
  if (selectedNode != null) {
    node.value = selectedNode;
    isView.value.node = true;
  }
}
  
const menu2= ref([
        {
          label: t("common.add"),
          icon: "pi pi-fw pi-plus",
          command: () => {
            createQuestion()
          },
        },
    ])
 const createQuestion=() => {
      node.value = {}
      node.value.userID = props.userID
      isView.value.node = true
  }
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

  const getQuestions = () => {
    const req = {
      page: lazyParams.page,
      rows: lazyParams.rows
    }

    loading.value = true

    questionService.getQuestions(req).then(res => {
      nodes.value = res.data.questions
      total.value = res.data.total
      loading.value = false
    }).catch(err => {
      loading.value=false
      toast.add({severity: 'error', summary: t('common.error'), life: 3000})
    })

  }
  onMounted(() => {
    getQuestions()
  })

</script>

 