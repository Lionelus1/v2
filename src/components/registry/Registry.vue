<template>
  <div class="col-12">
    <div class="flex flex-row mb-3">
      <div class="arrow-icon" @click="$router.back()">
        <i class="fas fa-arrow-left"></i>
      </div>
      <h4 class="m-0">Registry</h4>
    </div>
    <ToolbarMenu :data="toolbarMenus" @filter="toggle('global-filter', $event)" :filter="true" :filtered="filtered"/>
    <div class="card">
      <DataTable :lazy="true" :rowsPerPageOptions="[10, 25, 50]" dataKey="id" :rowHover="true"
                 :loading="loading" responsiveLayout="scroll" :paginator="true" :value="data">
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column v-for="column in columns" :key="column.field" :field="column.field" :header="$t(column.header)">
          <template #body="{ data }">
            {{ data[column.field] }}
          </template>
        </Column>
      </DataTable>
    </div>
<!--    <Dialog :header="$t('registry.addNewRegistry')" v-model:visible="showAddPlanDialog" :style="{width: '450px'}" class="p-fluid"-->
<!--            @hide="closeBasic">-->
<!--      <div class="field">-->
<!--        <label>{{ $t('common.nameInRussian') }}</label>-->
<!--        <InputText v-model="formData.name_ru" v-on:keyup.enter="createPlan"/>-->
<!--      </div>-->
<!--      <div class="field">-->
<!--        <label>{{ $t('common.nameInQazaq') }}</label>-->
<!--        <InputText v-model="formData.name_kz" v-on:keyup.enter="createPlan"/>-->
<!--      </div>-->
<!--      <div class="field">-->
<!--        <label>{{ $t('common.nameInEnglish') }}</label>-->
<!--        <InputText v-model="formData.name_en" v-on:keyup.enter="createPlan"/>-->
<!--      </div>-->
<!--      <template #footer>-->
<!--        <Button :label="$t('common.cancel')" icon="fa-solid fa-times" class="p-button-rounded p-button-danger"-->
<!--                @click="close('newPublicationDialog')"/>-->
<!--        <Button :label="$t('common.createNew')" icon="pi pi-plus" class="p-button-rounded p-button-success mr-2"-->
<!--                :disabled="!formData"-->
<!--                @click="createRegistry"/>-->
<!--      </template>-->
<!--    </Dialog>-->
  </div>
</template>


<script>
import RegistryService from "../../service/registry_service";


export default {
  name: 'Registry',
  components: {},
  data() {
    return {
      registryService: new RegistryService(),
      filtered: false,
      loading: false,
      lazyParams: null,
      filter: {
        plan_type: null,
        filtered: false
      },
      data: [],
      columns: [
        { field: 'registry_name', header: 'mailing.title' },
        { field: 'dataSource', header: 'registry.dataSource' }

      ],
      showAddPlanDialog: false,
      formData: {
        name_ru: null,
        name_kz: null,
        name_en: null,
        description_ru: null,
        status: null,
      },
      fieldStatus: [
        { label: this.$t('registry.active'), value: "active" },
        { label: this.$t('registry.inactive'), value: "inactive" },
      ],
    }
  },
  methods: {
    openBasic() {
      this.$router.push({ name: 'RegistryAdd', "params": {} });
    },
    open(){
      this.$router.push({ name: 'RegistryAdd', params: {id: parseInt(this.$route.params.id)} });
      // this.showAddPlanDialog = true;
    },
    close(){
      this.showAddPlanDialog = false;
      this.formData.registry_name = null;
      this.formData.description = null;
      this.formData.status = null;
    },
    closeBasic() {
      this.showAddPlanDialog = false
      // this.getPlans()
    },
    toggle(ref, event, node) {
      if (node) {
        this.selectedEvent = node;
      }
      this.$refs[ref].toggle(event);
    },
    initFilter() {
      this.filter.filtered = true;
      if (this.userNameSearch?.length > 0) {
        this.filter.user_id = this.userNameSearch[0].userID
      }else{
        this.filter.user_id = null
      }
      localStorage.setItem("registryFilter", JSON.stringify(this.filter));
      this.lazyParams.first = 0
      this.lazyParams.page = 0
    },
    clearFilter() {
      localStorage.removeItem("registryFilter");
      this.filter.doc_status = null
      this.filter.plan_type = null
      this.filter.user_id = null
      this.selectedPlanType = null;
      this.filter.filtered = false;
      this.filter.searchText = null
      this.userNameSearch = null
      this.getPlans();
    },
    createRegistry(){
      this.registryService.createRegistry(this.formData).then(res => {
        // if (res.data) {
        //   this.$toast.add({
        //     severity: 'success',
        //     summary: t('common.success'),
        //     detail: t('workPlan.message.planCreated'),
        //     life: 3000
        //   });
        // } else {
        //   this.$toast.add({severity: "error", summary: "Create plan error", life: 3000});
        // }
        this.closeBasic()
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
    },
    getRegistry(){
      this.loading = true;
      let req = {
        id: parseInt(this.$route.params.id),
      }
      this.registryService.getRegistry(req).then(res => {
        this.loading = false;
        this.data = res.data.registries;
      })
    },
    getRegisterParameter() {
      let req = {
        register_id: parseInt(this.$route.params.id)
      };
      this.registryService.getRegistryParameters(req)
          .then(response => {
            response.data.register_parameter.forEach((item, index) => {
              if (index >= 6) {
                this.columns.push({
                  field: item.label_en,
                  header: item.label_ru,
                  registry_id: parseInt(item.id),
                });
              }
            });
          })
          .catch(error => {
            console.error('Ошибка при получении параметров:', error);
          });
    }


  },
  computed: {
    toolbarMenus() {
      return [
        {
          label: this.$t('common.add'),
          icon: "pi pi-plus",
          command: () => {
            this.open('newPublicationDialog')
          },
        },
        {
          label: this.$t('registry.import'),
          icon: "pi pi-file-import",
          command: () => {
            this.openBasic()
          },
        },
      ]
    },
  },
  created() {
    this.getRegisterParameter()
    this.getRegistry()
  }
}
</script>

<style scoped>

.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}


:deep(.p-datatable-footer),
:deep(.p-button-link),
:deep(.p-datatable-thead > tr > th) {
  padding-top: 0rem;
  padding-bottom: 0rem;
}

.field {
  display: flex;
  flex-direction: column;
}

.field input {
  width: 350px;
}

.field label {
  margin-bottom: 5px;
  /* Расстояние между меткой и полем ввода */
}

.arrow-icon {
  cursor: pointer;
  font-size: 1.25rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}

.lang {
  margin-left: 20px;
}

.buttonLanguag {
  margin-bottom: 20px;
}
</style>