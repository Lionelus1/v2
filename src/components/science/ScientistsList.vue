<template>
    <div class="col-12">
      <TitleBlock :title="$t('science.scientists')" />
      <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em">
        <BlockUI  :blocked="loading" :fullScreen="true">
        </BlockUI>
      </ProgressBar>
      <hr>
      <div class="flex items-center justify-end mb-2">
        <a class="ml-auto" id="profile-link" href="#/cabinet">Мой профиль</a>
      </div>

      <div class="flex items-center justify-end">
        <Button
          class="align-items-center mr-1 ml-auto"
          :class="{'p-button-success': filter.applied, 'p-button-info': !filter.applied} "
          style="padding: 0.25rem 1rem;"
          @click="toggleFilter">
          <i class="fa-solid fa-filter" /> &nbsp;{{ $t("contracts.filter.button") }}
        </Button>

        
        <Button  @click="toggleGrid" icon="pi pi-th-large" class="p-button-rounded p-button-text mr-1" />
        <Tooltip target=".grid-button" :show="showGrid" :position="'bottom'">
        </Tooltip>

        <Button @click="toggleList" icon="pi pi-list" class="p-button-rounded p-button-text mr-1" />
        <Tooltip target=".list-button" :show="showList" :position="'bottom'">
        </Tooltip>

      </div>
      <!-- <div class="surface-card p-4 shadow-2 border-round"> -->
        <DataView v-if="showGrid" class="xl:ml-10 xl:mr-10" :loading="loading" :lazy="true" :value="list" :layout="layout" :paginator="true" 
        :rows="lazyParams.rows" @page="onPage($event)" :totalRecords="total" :first="first" scrollable scrollHeight="flex"
        selectionMode="single" :rowHover="true" stripedRows>      
            <template #grid="slotProps" v-if="showGrid">
                <div class="col-12 sm:col-6 md:col-4 lg:col-2 p-2">
                    <div @click="selectScientist(slotProps.data)" class="card shadow-1 m-0" v-ripple style="text-align: center;">
                        <img class="card_img round" v-if="slotProps.data.photo != null && slotProps.data.photo !=''"
                          :src="'data:image/jpeg;base64,' + slotProps.data.photo "/>
                      <img class="card_img round" v-else src="assets/layout/images/default-user.jpg"/>
                        <p style="margin-top: 2mm; margin-bottom: 2mm;">{{getFullName(slotProps.data)}}</p>
                    </div>
                </div>
            </template>
        </DataView>
      <!-- </div> -->

      <TabPanel v-if="showList">
        <DataTable :lazy="true" class="xl:ml-10 xl:mr-10" :loading="loading" :value="list" :layout="layout" :paginator="true" 
        :rows="lazyParams.rows" @page="onPage($event)" :totalRecords="total" :first="first" scrollable scrollHeight="flex"
        selectionMode="single" :rowHover="true" stripedRows>
          <div v-if="showList">
            <Column :header="$t('common.fullName')">
              <template #body="body">
                  <span @click="selectScientist(body.data)" class="blu-link">{{ getFullName(body.data) }}</span>
              </template>
            </Column>

          </div>
        </DataTable>
      </TabPanel>  

      <!-- Filter Form -->
      <OverlayPanel readonly ref="op">
          <div class="p-fluid">
            <div class="field">
              <label>{{ $t('common.fullName') }}</label>
              <FindUser :placeholder="$t('common.fullName')" id="filter.fullName" v-model="filter.user" :userType="2" :max="1"></FindUser>
              <small class="p-error" v-if="submitted && !(newUsers && newUsers.length > 0)">
                  {{$t('common.requiredField')}}
              </small>
            </div>
            <div class="field">
                <label for="filter.areaOfInterest">{{ $t('science.areaScientificInterests') }}</label>
                <br>
                <InputText :placeholder="$t('science.areaScientificInterests')" id="filter.searchText" v-model="filter.searchText"></InputText>
            </div>
            <div class="field">
              <Button :label="$t('common.clear')" @click="filter.applied = false;clear();
                clear()" class="p-button-outlined"/>
              <Button :label="$t('common.search')" @click="filter.applied = true;getScientists()" class="mt-2"/>
            </div>
          </div>
      </OverlayPanel>
    </div>
</template>
  
<script setup>
    import {computed, onMounted, ref} from "vue";
    import {useI18n} from "vue-i18n";
    import {useToast} from "primevue/usetoast";
    import {useRouter, useRoute} from "vue-router";
    import {useConfirm} from "primevue/useconfirm";
    import {ScienceService} from "@/service/science.service";
    import OverlayPanel from 'primevue/overlaypanel';
    import Image from 'primevue/image';
    import TitleBlock from "@/components/TitleBlock"

    const {t, locale} = useI18n()
    const toast = useToast()
    const router = useRouter()
    const route = useRoute()
    const confirm = useConfirm()
    
    const lazyParams = ref({
        page: 0,
        rows: 12
    })
    const list = ref([])
    const loading = ref(false)
    const scienceService = new ScienceService()
    const emit = defineEmits(['toggle'])

    const filter= ref({
        visible: false,
        applied: false,
        user: null,
        searchText: '',

    })
    const layout = ref('grid')
    const scientist= ref(null)
    const newUsers= ref(null)
    const total = ref(0)
    const op = ref();
    const showGrid = ref(false)
    const showList= ref(false)
    const areaOfInterests = ref([])
    const first =  ref(0)

    const requestAreaOfInterest = ref({
        page: 0,
        rows: 10,
        searchText: null,
        id: null
    })

    const getScientists = () => {
      loading.value = true;
      const userID = ref(null)
      const searchText = ref(null)
      if (filter.value.user != null && filter.value.user.length > 0) {
          userID.value = filter.value.user[0].userID
      }

      if (filter.value.searchText != '') {
        searchText.value = filter.value.searchText
      }

        const req = { 
            page: lazyParams.value.page,
            rows: lazyParams.value.rows,
            filter: {
              userID: userID.value,
              interests: searchText.value
            }
        }

        scienceService.getScientists(req).then(res => {
            list.value = res.data.scientists
            total.value = res.data.total
            loading.value = false
        }).catch(error => {
            loading.value = false;
            toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        }).finally(() => {
          const query = {
            first: first.value,
            page: lazyParams.value.page,
            rows: lazyParams.value.rows,
            isShowGrid: showGrid.value
          };


          router.push({
            query: query
          });
        })
    }


    const toggleFilter=(event) => {
      op.value.toggle(event);
    }

    const clear =()=> {
      filter.value = {
        fullName: null,
        areaOfInterest: null,
        applied: false
      }
    }

    const selectScientist = (scientist) => {
      router.push('/science/scientists/'+ scientist.userID)
    }

    const onPage = (event)=> {
      lazyParams.value.page = event.page
      lazyParams.value.rows = event.rows
      first.value = event.first
      getScientists();
    }

    const toggleGrid = ()=> {
      showGrid.value = true
      showList.value = false
      getScientists()
    }


    const  toggleList=()=> {
      showGrid.value = false;
      showList.value = true;
      getScientists()
    }


    const getFullName = (data) => {
      let fullName = "";

      if (data.firstName) {
        fullName += data.firstName + " ";
      }

      if (data.lastName) {
        fullName += data.lastName + " ";
      }

      if (data.thirdName) {
        fullName += data.thirdName;
      }

      return fullName.trim();
    }



    onMounted(() => {
      
      const currentPage = route.query
        if (route.query) {
          first.value = currentPage.first ? parseInt(currentPage.first) : first.value;          
          lazyParams.value.page = currentPage.page ? parseInt(currentPage.page) : lazyParams.value.page;        
          lazyParams.value.rows = currentPage.rows ? parseInt(currentPage.rows) : lazyParams.value.rows;
          if (currentPage.isShowGrid === 'false') {
            showGrid.value = false;
            showList.value = true;
          } else {
            showGrid.value = true;
            showList.value = false;
          }


      }

      applyFilters();
    })

    const applyFilters = () => {
      const query = {
        first: first.value,
        page: lazyParams.value.page,
        rows: lazyParams.value.rows,
        isShowGrid: showGrid.value.toString(),
      };

      router.push({
        query: query,
      });

      getScientists();
    };
    

</script>

<style scoped>
.tooltip {
  font-size: 12px;
  margin-left: 5px;
}
.loading-indicator {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .card_img{
    width: 150px;
    max-height: 150px;
    height: auto;
  }
  :deep(.p-dataview .p-dataview-content){
    background: transparent;
  }

  .blue-link {
      color: rgb(0, 13, 255);
      text-decoration: underline;
      cursor: pointer;
    }
</style>