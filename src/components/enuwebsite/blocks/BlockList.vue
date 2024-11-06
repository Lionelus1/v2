<template>
  <div class="col-12">
    <TitleBlock :title="$t('web.blocks')"/>

    <BlockUI v-if="haveAccess" >
      <ToolbarMenu :data="toolbarMenus" @search="initSearch($event)" :search="true"/>

      <div class="card" v-if="isWebAdmin">
        <SelectSiteSlug @onSelect="onSlugSelect"/>
      </div>
      <div class="card">
        <TabView>
          <TabPanel :header="$t('web.properties')">
            <DataTable :lazy="true" :value="blockList" dataKey="id" :loading="loading" responsiveLayout="scroll"
                       :rows="10" :rowHover="true" :paginator="true" :totalRecords="total" @page="onPage" @sort="onSort">
              <template #empty>{{ $t("common.noData") }}</template>
              <template #loading>{{ $t("common.loading") }}</template>
              <Column :field="'title_' + $i18n.locale" :header="$t('common.nameIn')" sortable>
                <template #body="{ data }">
                  <a href="javascript:void(0)" @click="navigateToView(data)">
                    {{ data['title_' + $i18n.locale] }}
                    <!--              {{ $i18n.locale === "kz" ? data.title_kz : $i18n.locale === "ru" ? data.title_ru : data.title_en }}-->
                  </a>
                </template>
              </Column>
              <Column :header="$t('web.blockType')" sortable>
                <template #body="{ data }">
                  {{ data.is_list ? $t('web.list') : !data.is_plugin ? $t('web.content') : $t('web.plugin') }}
                </template>
              </Column>
              <Column :header="$t('web.note')">
                <template #body="{ data }">
                  {{ data.note }}
                </template>
              </Column>
              <Column :header="$t('faq.createDate')" sortable>
                <template #body="{ data }">
                  {{ formatDate(data.create_date) }}
                </template>
              </Column>
              <Column class="text-right">
                <template #body="{ data }">
                  <ActionButton :show-label="true" :items="initItems" @toggle="toggle(data)"/>
                </template>
              </Column>
            </DataTable>
          </TabPanel>
          <TabPanel :header="$t('web.history')" @click="getTableLogs()">
            <WebLogs :TN="TN" :key="TN"/>
          </TabPanel>
        </TabView>

      </div>
    </BlockUI>
    <div v-else class="card">
      <Access textMode="short" :showLogo="false" returnMode="back"></Access>
    </div>
  </div>

  <Dialog v-model:visible="isCreateModal" :style="{ width: '1000px' }" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
          :header="formData && formData.title_kz ? $t('web.editBlock') : $t('web.addBlock')" :modal="true" class="p-fluid"
          @hide="hideDialog">
    <div class="field">
      <label>{{ $t('common.nameInQazaq') }}</label>
      <InputText type="text" v-model="formData.title_kz"/>
      <small class="p-error" v-if="!formData.title_kz && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('common.nameInRussian') }}</label>
      <InputText type="text" v-model="formData.title_ru"/>
      <small class="p-error" v-if="!formData.title_ru && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('common.nameInEnglish') }}</label>
      <InputText type="text" v-model="formData.title_en"/>
      <small class="p-error" v-if="!formData.title_en && submitted">{{ $t("common.requiredField") }}</small>
    </div>
    <div class="field">
      <label>{{ $t('web.note') }}</label>
      <Textarea :placeholder="$t('web.note')" rows="3" class="pt-1" type="text" v-model="formData.note"
                maxlength="100"></Textarea>
    </div>
    <div class="grid">
      <div class="col-4">
        <div class="field">
          <div class="field">
            <label>{{ $t('common.type') }}</label>
            <div class="field-radiobutton">
              <RadioButton inputId="blockType1" name="blockType" :value="true" v-model="formData.is_list"/>
              <label for="blockType1">{{ $t('web.list') }}</label>
            </div>
            <div class="field-radiobutton">
              <RadioButton inputId="blockType2" name="blockType" :value="false"
                           @change="formData.is_grid = false" v-model="formData.is_list"/>
              <label for="blockType2">{{ $t('web.content') }}</label>
            </div>
          </div>

          <div class="field" v-if="formData.is_list">
            <label>{{ $t('web.listType') }}</label>
            <Dropdown v-model="selectedBlockListType" :options="listTypes" :optionLabel="'name_' + $i18n.locale"
                      :placeholder="$t('common.select')" class="w-full md:w-14rem" @change="onBlockListTypeSelect"/>
          </div>
          <div v-if="selectedBlockListType && formData.is_list">
            <div class="field">
              <label>{{ $t('web.view') }}</label>
              <Dropdown v-model="selectedBlockListViewType" :options="listViewTypes"
                        :optionLabel="'name_' + $i18n.locale" :placeholder="$t('common.select')"
                        class="w-full md:w-14rem" @change="onBlockListViewTypeSelect"/>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12" v-if="isGuideVisible">
        <div v-if="formData.is_list">
          <div v-if="selectedBlockListType" id="listHelp">
            <div v-if="selectedBlockListType.code == 'LIST'">
              <div v-if="selectedBlockListViewType" style="margin-left: -6px;">
                <div v-if="selectedBlockListViewType.code == 'GRID'">
                  <label>
                    <h5><strong>{{ $t('web.gridListExe') }}</strong></h5>
                  </label>
                  <hr/>
                  <br/>
                </div>
              </div>
              <div v-if="selectedBlockListViewType">
                <div v-if="selectedBlockListViewType.code == 'GRID'" class="grid">
                  <div class="flex flex-wrap p-2 align-items-center gap-3">
                    <img class="w-4rem shadow-2 flex-shrink-0 border-round"
                         src="https://primefaces.org/cdn/primevue/images/product/blue-band.jpg"/>
                    <div class="flex-1 flex flex-column gap-2">
                      <span class="font-bold">{{ $t('web.exampleTitle') }}-{{ 1 }}</span>
                      <div class="flex align-items-center gap-2">
                        <span>{{ $t('web.exampleContent') }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-wrap p-2 align-items-center gap-3">
                    <img class="w-4rem shadow-2 flex-shrink-0 border-round"
                         src="https://primefaces.org/cdn/primevue/images/product/blue-band.jpg"/>
                    <div class="flex-1 flex flex-column gap-2">
                      <span class="font-bold">{{ $t('web.exampleTitle') }}-{{ 2 }}</span>
                      <div class="flex align-items-center gap-2">

                        <span>{{ $t('web.exampleContent') }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-wrap p-2 align-items-center gap-3">
                    <img class="w-4rem shadow-2 flex-shrink-0 border-round"
                         src="https://primefaces.org/cdn/primevue/images/product/blue-band.jpg"/>
                    <div class="flex-1 flex flex-column gap-2">
                      <span class="font-bold">{{ $t('web.exampleTitle') }}-{{ 3 }}</span>
                      <div class="flex align-items-center gap-2">

                        <span>{{ $t('web.exampleContent') }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-wrap p-2 align-items-center gap-3">
                    <img class="w-4rem shadow-2 flex-shrink-0 border-round"
                         src="https://primefaces.org/cdn/primevue/images/product/blue-band.jpg"/>
                    <div class="flex-1 flex flex-column gap-2">
                      <span class="font-bold">{{ $t('web.exampleTitle') }}-{{ 4 }}</span>
                      <div class="flex align-items-center gap-2">

                        <span>{{ $t('web.exampleContent') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="selectedBlockListViewType">

                <div v-if="selectedBlockListViewType.code !== 'GRID'" class="list">
                  <label>
                    <h5><strong>{{ $t('web.simpleListExe') }}</strong></h5>
                    <hr/>
                  </label>
                  <div class="flex flex-wrap p-2 align-items-center gap-3">
                    <img class="w-4rem shadow-2 flex-shrink-0 border-round"
                         src="https://primefaces.org/cdn/primevue/images/product/blue-band.jpg"/>
                    <div class="flex-1 flex flex-column gap-2">
                      <span class="font-bold">{{ $t('web.exampleTitle') }}-{{ 1 }}</span>
                      <div class="flex align-items-center gap-2">
                        <span>{{ $t('web.exampleContent') }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-wrap p-2 align-items-center gap-3">
                    <img class="w-4rem shadow-2 flex-shrink-0 border-round"
                         src="https://primefaces.org/cdn/primevue/images/product/blue-band.jpg"/>
                    <div class="flex-1 flex flex-column gap-2">
                      <span class="font-bold">{{ $t('web.exampleTitle') }}-{{ 2 }}</span>
                      <div class="flex align-items-center gap-2">

                        <span>{{ $t('web.exampleContent') }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-wrap p-2 align-items-center gap-3">
                    <img class="w-4rem shadow-2 flex-shrink-0 border-round"
                         src="https://primefaces.org/cdn/primevue/images/product/blue-band.jpg"/>
                    <div class="flex-1 flex flex-column gap-2">
                      <span class="font-bold">{{ $t('web.exampleTitle') }}-{{ 3 }}</span>
                      <div class="flex align-items-center gap-2">

                        <span>{{ $t('web.exampleContent') }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-wrap p-2 align-items-center gap-3">
                    <img class="w-4rem shadow-2 flex-shrink-0 border-round"
                         src="https://primefaces.org/cdn/primevue/images/product/blue-band.jpg"/>
                    <div class="flex-1 flex flex-column gap-2">
                      <span class="font-bold">{{ $t('web.exampleTitle') }}-{{ 4 }}</span>
                      <div class="flex align-items-center gap-2">

                        <span>{{ $t('web.exampleContent') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedBlockListType.code == 'ACCORDION'">
              <div v-if="selectedBlockListViewType">
                <div v-if="selectedBlockListViewType.code == 'GRID'">
                  <label>
                    <h5><strong>{{ $t('web.gridAccordionListExample') }}</strong></h5>
                    <hr/>
                  </label>
                </div>
              </div>
              <div v-if="selectedBlockListViewType">
                <div v-if="selectedBlockListViewType.code == 'GRID'" class="grid">
                  <div class="col">
                    <Accordion :multiple="true">
                      <AccordionTab :header="$t('web.exampleTitle')">
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </AccordionTab>
                    </Accordion>
                  </div>
                  <div class="col">
                    <Accordion :multiple="true">
                      <AccordionTab :header="$t('web.exampleTitle')">
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </AccordionTab>
                    </Accordion>
                  </div>
                  <div class="col">
                    <Accordion :multiple="true">
                      <AccordionTab :header="$t('web.exampleTitle')">
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </AccordionTab>
                    </Accordion>
                  </div>
                  <div class="col">
                    <Accordion :multiple="true">
                      <AccordionTab :header="$t('web.exampleTitle')">
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </AccordionTab>
                    </Accordion>
                  </div>
                </div>
              </div>
              <div v-if="selectedBlockListViewType">
                <div v-if="selectedBlockListViewType.code !== 'GRID'" class="list">
                  <label>
                    <h5><strong>{{ $t('web.accordionListExample') }}</strong></h5>
                    <hr/>
                  </label>
                  <div class="col">
                    <Accordion>
                      <AccordionTab :header="$t('web.exampleTitle')">
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </AccordionTab>
                    </Accordion>
                  </div>
                  <div class="col">
                    <Accordion :multiple="true">
                      <AccordionTab :header="$t('web.exampleTitle')">
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </AccordionTab>
                    </Accordion>
                  </div>
                  <div class="col">
                    <Accordion :multiple="true">
                      <AccordionTab :header="$t('web.exampleTitle')">
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </AccordionTab>
                    </Accordion>
                  </div>
                  <div class="col">
                    <Accordion :multiple="true">
                      <AccordionTab :header="$t('web.exampleTitle')">
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </AccordionTab>
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedBlockListType.code == 'CARD'">
              <div v-if="selectedBlockListViewType">
                <div v-if="selectedBlockListViewType.code == 'GRID'">
                  <label>
                    <h5><strong>{{ $t('web.gridCardListExample') }}</strong></h5>
                    <hr/>
                  </label>
                </div>
              </div>
              <div v-if="selectedBlockListViewType">
                <div v-if="selectedBlockListViewType.code == 'GRID'" class="grid">

                  <div class="col">
                    <Card>
                      <template #header>
                        <img alt="user header" height="50"
                             src="https://primefaces.org/cdn/primevue/images/usercard.png"/>
                      </template>
                      <template #title> {{ $t('web.exampleTitle') }}</template>
                      <template #content>
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </template>
                    </Card>
                  </div>
                  <div class="col">
                    <Card>
                      <template #header>
                        <img alt="user header" height="50"
                             src="https://primefaces.org/cdn/primevue/images/usercard.png"/>
                      </template>
                      <template #title> {{ $t('web.exampleTitle') }}</template>
                      <template #content>
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </template>
                    </Card>
                  </div>
                  <div class="col">
                    <Card>
                      <template #header>
                        <img alt="user header" height="50"
                             src="https://primefaces.org/cdn/primevue/images/usercard.png"/>
                      </template>
                      <template #title> {{ $t('web.exampleTitle') }}</template>
                      <template #content>
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </template>
                    </Card>
                  </div>
                  <div class="col">
                    <Card>
                      <template #header>
                        <img alt="user header" height="50"
                             src="https://primefaces.org/cdn/primevue/images/usercard.png"/>
                      </template>
                      <template #title> {{ $t('web.exampleTitle') }}</template>
                      <template #content>
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </template>
                    </Card>
                  </div>
                </div>

              </div>
              <div v-if="selectedBlockListViewType">
                <div v-if="selectedBlockListViewType.code !== 'GRID'" class="list">
                  <label>
                    <h5><strong>{{ $t('web.cardListExample') }}</strong></h5>
                    <hr/>
                  </label>
                  <div class="col">
                    <Card>
                      <template #header>
                        <img alt="user header" height="50"
                             src="https://primefaces.org/cdn/primevue/images/usercard.png"/>
                      </template>
                      <template #title> {{ $t('web.exampleTitle') }}</template>
                      <template #content>
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </template>
                    </Card>
                  </div>
                  <div class="col">
                    <Card>
                      <template #header>
                        <img alt="user header" height="50"
                             src="https://primefaces.org/cdn/primevue/images/usercard.png"/>
                      </template>
                      <template #title> {{ $t('web.exampleTitle') }}</template>
                      <template #content>
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </template>
                    </Card>
                  </div>
                  <div class="col">
                    <Card>
                      <template #header>
                        <img alt="user header" height="50"
                             src="https://primefaces.org/cdn/primevue/images/usercard.png"/>
                      </template>
                      <template #title> {{ $t('web.exampleTitle') }}</template>
                      <template #content>
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </template>
                    </Card>
                  </div>
                  <div class="col">
                    <Card>
                      <template #header>
                        <img alt="user header" height="50"
                             src="https://primefaces.org/cdn/primevue/images/usercard.png"/>
                      </template>
                      <template #title> {{ $t('web.exampleTitle') }}</template>
                      <template #content>
                        <p>
                          {{ $t('web.exampleContent') }}
                        </p>
                      </template>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <template #footer>
      <div class="field" style="float:left;" v-if="formData.is_list">
        <div class="flex align-items-center">
          <Checkbox v-model="isGuideVisible" :binary="true"/>&nbsp;<a href="javascript:void(0)"
                                                                      @click="showHideUserGuide">{{ $t('web.webHelp') }}</a>
        </div>

      </div>
      <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button p-component p-button-danger mr-2"
              @click="hideDialog"/>
      <Button v-if="selectedBlock" :label="$t('common.save')" icon="pi pi-check"
              class="p-button p-component p-button-success" @click="save"/>
      <Button v-if="!selectedBlock" :label="$t('common.add')" icon="pi pi-check"
              class="p-button p-component p-button-success" @click="addBlock"/>
    </template>
  </Dialog>
</template>

<script setup>
import {onMounted, computed, ref, reactive, toRefs} from "vue";
import {EnuWebService} from "@/service/enu.web.service";
import {formatDate} from "@/helpers/HelperUtil";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {useConfirm} from "primevue/useconfirm";
import WebLogs from "@/components/enuwebsite/EnuSiteLogs.vue";
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import SelectSiteSlug from "@/components/enuwebsite/SelectSiteSlug.vue";
import TitleBlock from "@/components/TitleBlock.vue";
import {findRole} from "@/config/config";
import {useStore} from "vuex";
import ActionButton from "@/components/ActionButton.vue";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import Access from "@/pages/Access.vue";

const store = useStore()
const i18n = useI18n()
const toast = useToast()
const confirm = useConfirm()
const enuService = new EnuWebService()

const haveAccess = ref(true)
const loading = ref(false)
const TN = ref(null)
let selectedBlock = ref()
let isCreateModal = ref(false)
let submitted = ref(false)
const blockList = ref([])
const router = useRouter()
let formData = ref({})
const options = ref([true, false]);
const total = ref(0)
const lazyParams = ref({
  page: 0,
  rows: 10,
  searchText: "",
  sortField: null,
  sortOrder: 0,
  slug: localStorage.getItem('selectedSlug') ? JSON.parse(localStorage.getItem('selectedSlug')).slug : null
})
const selectedBlockListType = ref();
const listTypes = ref([]);
const selectedBlockListViewType = ref();
const listViewTypes = ref([]);
const accTabs = ref([
  {title: 'Title 1', content: 'Content 1'},

]);
const isGuideVisible = ref(false);
const actionsNode = ref(null)

const toolbarMenus = computed(() => {
  return [
    {
      label: i18n.t('web.addBlock'),
      icon: "pi pi-plus",
      visible: findRole(null, 'enu_web_admin') ||
          findRole(null, 'enu_web_fac_admin') || findRole(null, 'main_administrator'),
      command: () => {
        openDialog()
      },
    },
  ]
})
const initActionButtons = computed(() => {
  return [
    {
      label: i18n.t('common.show'),
      icon: 'fa-solid fa-eye',
      command: () => {
      }
    },
    {
      label: i18n.t('common.delete'),
      icon: 'fa-solid fa-trash',
      command: () => {
      }
    },
  ];
})
const showHideUserGuide = () => {
  isGuideVisible.value = !isGuideVisible.value;
};

const navigateToView = (data) => {
  if (!data.is_plugin) router.push({name: 'BlockView', params: {id: data.block_id}})

  if (data.block_plugin) {
    const compName = enuService.navigateToPlugin(data.block_plugin.component_name)
    router.push({name: compName});
  }
};

const getBlockList = () => {
  loading.value = true;
  enuService.getBlockList(lazyParams.value).then(res => {
    if (res.data) {
      blockList.value = res.data.blocks
      total.value = res.data.total;
      TN.value = res.data.tn_res
    }
    loading.value = false
  }).catch(error => {
    if (error?.response?.status === 403) {
      haveAccess.value = false
    } else {
      loading.value = false
    }
  });
}

const getBlockListTypes = () => {
  loading.value = true;
  enuService.getBlockListTypes().then(res => {
    if (res.data) {
      listTypes.value = res.data;
    }
    loading.value = false
  }).catch(error => {
    if (error?.response?.status === 403) {
      haveAccess.value = false
    } else {
      loading.value = false
      toast.add({severity: "error", summary: error, life: 3000});
    }
  });
}

const getBlockListViewTypes = () => {
  loading.value = true;
  enuService.getBlockListViewTypes().then(res => {
    if (res.data) {
      listViewTypes.value = res.data;
    }
    loading.value = false
  }).catch(error => {
    if (error?.response?.status === 403) {
      haveAccess.value = false
    } else {
      loading.value = false
    }
  });
}

const addBlock = () => {
  submitted.value = true;
  if (lazyParams.value.slug && findRole(store.state.loginedUser, 'enu_web_admin')) {
    formData.value.slug = lazyParams.value.slug
  }
  enuService.addBlock(formData.value).then(res => {
    if (res.data && res.data.is_success) {
      toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
    }
    submitted.value = false;
    isCreateModal.value = false;
    formData.value = {}
    getBlockList()
  }).catch(_ => {
    submitted.value = false;
    isCreateModal.value = false;
    formData.value = {}
  });
}
const isWebAdmin = computed(() => findRole(null, "enu_web_admin"))
const initItems = computed(() => {
      return [
        {
          label: i18n.t('common.edit'),
          icon: 'fa-solid fa-pen',
          command: () => {
            openEdit(actionsNode.value)
          }
        },
        {
          label: i18n.t('common.delete'),
          icon: 'fa-solid fa-trash',
          command: () => {
            deleteConfirm(actionsNode.value)
          }
        },

      ];
    }
)
const toggle = (node) => {
  actionsNode.value = node
}
const save = () => {
  submitted.value = true;
  enuService.editBlock(formData.value).then(res => {
    if (res.data && res.data.is_success) {
      toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
    }
    submitted.value = false;
    isCreateModal.value = false;
    formData.value = {}
    selectedBlock.value = null
    getBlockList()
  }).catch(_ => {
    submitted.value = false;
    isCreateModal.value = false;
    formData.value = {}
    selectedBlock.value = null
  });
}

const openEdit = (data) => {
  formData.value = data
  selectedBlock.value = data;
  isCreateModal.value = true;
}

const openDialog = () => {
  isCreateModal.value = true;
  formData.value = {};
}

const hideDialog = () => {
  isCreateModal.value = false;
  selectedBlockListType.value = null;
  selectedBlockListViewType.value = null;
}

const deleteConfirm = (data) => {
  confirm.require({
    message: i18n.t('common.doYouWantDelete'),
    header: i18n.t('common.delete'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-rounded p-button-success',
    rejectClass: 'p-button-rounded p-button-danger',
    accept: () => {
      remove(data.block_id)
    },
  });
}

const remove = (id) => {
  enuService.deleteBlock(id).then(res => {
    if (res.data && res.data.is_success) {
      toast.add({severity: "success", summary: i18n.t('common.success'), life: 3000});
    } else {
      toast.add({severity: "warn", summary: i18n.t('common.message.title.saveError'), life: 3000});
    }
    getBlockList();
  }).catch(_ => {
  });
}

const onPage = (event) => {
  lazyParams.value.page = event.page
  lazyParams.value.rows = event.rows
  getBlockList();
}

const onSort = (event) => {
  lazyParams.value.sortField = event.sortField;
  lazyParams.value.sortOrder = event.sortOrder;
  getBlockList();
}

const onBlockListTypeSelect = (event) => {
  formData.value.list_type_id = event.value.id
}

const onBlockListViewTypeSelect = (event) => {
  formData.value.list_type_view_id = event.value.id
}

const onSlugSelect = (event) => {
  lazyParams.value.slug = event.slug
  getBlockList()
}

const initSearch = (searchText) => {
  lazyParams.value.searchText = searchText
  getBlockList()
}


onMounted(() => {
  getBlockList();
  getBlockListTypes();
  getBlockListViewTypes();
});
</script>

<style lang="scss" scoped>
.field-radiobutton {
  align-items: center;
  display: flex;
  margin-bottom: 1rem;

  label {
    line-height: 1;
    margin-left: 0.5rem;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 10px;
}
</style>
