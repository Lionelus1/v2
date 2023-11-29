<template>
    <div class="col-12">
      <TitleBlock :title="$t('science.scientists')" />
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
        <DataView v-if="showGrid" class="xl:ml-10 xl:mr-10" :lazy="true" :value="list" :layout="layout" :paginator="true" :rows="12" @page="onPage($event)" :totalRecords="total">      
            <template #grid="slotProps" v-if="showGrid">
                <div class="col-12 sm:col-6 md:col-4 lg:col-3 p-2">
                    <div @click="selectScientist(slotProps.data)" class="shadow-4 border-round p-4 item course p-ripple" v-ripple style="text-align: center;">
                        <Image class="mb-2" width="240" height="165" :src="slotProps.data.photo ? slotProps.data.photo : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" style="margin-bottom: 2mm;"/>
                        <p style="margin-top: 2mm; margin-bottom: 2mm;">{{slotProps.data.fullName}}</p>
                    </div>
                </div>
            </template>
        </DataView>
      <!-- </div> -->

      <TabPanel v-if="showList">
        <DataTable :lazy="true" :value="list" :layout="layout" :paginator="true" :rows="12" @page="onPage($event)" :totalRecords="total">
          <div v-if="showList">
            <Column :header="$t('common.fullName')">
              <template #body="body">
                <router-link :to="'/science/scientists/' + body.data.userID">
                  {{ body.data['fullName'] }}
                </router-link>
              </template>
            </Column>
          </div>
        </DataTable>
      </TabPanel>  

      <!-- Filter Form -->
      <OverlayPanel ref="op">
          <div class="p-fluid">
            <div class="field">
              <label>{{ $t('common.fullName') }}</label>
              <FindUser :placeholder="$t('common.fullName')" id="filter.fullName" v-model="filter.fullName" :userType="2" :max="1"></FindUser>
              <small class="p-error" v-if="submitted && !(newUsers && newUsers.length > 0)">
                  {{$t('common.requiredField')}}
              </small>
            </div>
            <div class="field">
                <label for="filter.areaOfInterest">{{ $t('science.areaScientificInterests') }}</label>
                <Dropdown v-model="requestAreaOfInterest.id" :options="areaOfInterests" class="mt-2" :optionLabel="itemLabel" optionValue="id" :placeholder="$t('common.select')"
                @filter="handleFilter" :filter="true" :showClear="true" dataKey="id" :emptyFilterMessage="$t('roleControl.noResult')"  />
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
    import {useRouter} from "vue-router";
    import {useConfirm} from "primevue/useconfirm";
    import {ScienceService} from "@/service/science.service";
    import OverlayPanel from 'primevue/overlaypanel';
    import Image from 'primevue/image';
    import TitleBlock from "@/components/TitleBlock"
    import MyCabinet from "@/components/humanResources/candidate/MyCabinet";

    const {t, locale} = useI18n()
    const toast = useToast()
    const router = useRouter()
    const confirm = useConfirm()
    
    const lazyParams = ref({
        page: 0,
        rows: 12
    })
    const list = ref([])
    const loading = ref(false)
    const scienceService = new ScienceService()

    const filter= ref({
        visible: false,
        applied: false,
        fullName: null,
        areaOfInterest: null,

    })
    const layout = ref('grid')
    const scientist= ref(null)
    const newUsers= ref(null)
    const total = ref(0)
    const op = ref();
    const showGrid = ref(false)
    const showList= ref(false)
    const areaOfInterests = ref([])

    const requestAreaOfInterest = ref({
        page: 0,
        rows: 10,
        searchText: null,
        id: null
    })

    const getScientists = () => {
        loading.value = true;
        const req = { 
            page: lazyParams.value.page,
            rows: lazyParams.value.rows,
            user: filter.value.fullName,
            science_id: filter.value.areaOfInterest
        }

        scienceService.getScientists(req).then(res => {
            list.value = res.data.scientists
            total.value = res.data.total
            loading.value = false
        }).catch(error => {
            toast.add({severity: 'error', summary: t('common.error'), life: 3000})
            loading.value = false;
        })
    }

    const getScienceInterests = () => {
      loading.value = true;
      scienceService.getScienceInterests(requestAreaOfInterest.value).then(res => {
        areaOfInterests.value = res.data.interests
        loading.value = false
      }).catch(error => {
        toast.add({severity: 'error', summary: t('common.error'), life: 3000})
        loading.value = false;
      })
    }

    const toggleFilter=(event) => {
      getScienceInterests()
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

    const handleFilter = (event) => {
      if (event.value && event.value.length > 2) {
        requestAreaOfInterest.value.searchText = event.value
        getScienceInterests()
      } else if (requestAreaOfInterest.value.searchText.length > 3) {
        requestAreaOfInterest.value.searchText = null
        getScienceInterests()
      }
    }

    const itemLabel=(item)=> {
      return item['name_'+locale.value]
    }

    onMounted(() => {
        showGrid.value = true
        getScientists()
    })

    

</script>

<style scoped>
.tooltip {
  font-size: 12px;
  margin-left: 5px;
}
</style>