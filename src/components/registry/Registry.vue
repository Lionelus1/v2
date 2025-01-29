<template>
  <div class="col-12">
    <div class="flex flex-row mb-3">
      <div class="arrow-icon" @click="$router.back()">
        <i class="fas fa-arrow-left"></i>
      </div>
      <h4 class="m-0">{{ $i18n.locale === 'kz' ? registry.name_kz : $i18n.locale === 'ru' ? registry.name_ru : registry.name_en}}</h4>
    </div>
    <ToolbarMenu :data="toolbarMenus" @filter="toggle('global-filter', $event)" @search="search" :filter="true" :filtered="filtered" :search="true"/>
    <div class="card">
      <input type="file" ref="fileInput" @change="onFileChange" style="display: none;" />
      <DataTable
          :lazy="true" :rowsPerPageOptions="[10, 25, 50]" dataKey="id" :rowHover="true"
          class="flex-grow-1"
          :loading="loading"
          :value="applications"
          :paginatorTemplate="paginatorTemplate"
          :currentPageReportTemplate="currentPageReportTemplate"
          @page="onPageChange"
          :paginator="true"
          :first="lazyParams.first || 0"
          :rows="lazyParams.rows"
          stripedRows
          :totalRecords="total"
          v-model:selection="selectedApplication"
          selectionMode="single">
        <Column
            v-for="column in columns"
            :key="column.id"
            :header="$i18n.locale === 'kz' ? column.label_kz : $i18n.locale === 'ru' ? column.label_ru : column.label_en">

          <template #body="slotProps">
            <div v-if="column.id">
              {{ getValue(slotProps, column.id) }}
            </div>
            <div v-else>
              <div class="button-container">
                <Button
                    icon="pi pi-question-circle"
                    class="p-button p-button-info"
                    @click="openEditForm(slotProps)"/>
                <Button
                    icon="pi pi-qrcode"
                    class="p-button"
                    @click="openDocGeneration(slotProps)"/>
              </div>
            </div>
          </template>

        </Column>
      </DataTable>
      <!-- QR CODE ҚАРАУ -->
      <Sidebar v-model:visible="qrVisible"
               position="right"
               class="p-sidebar-lg">
        <QrGenerator :data="qrUrl" :showBackButton="false"/>
      </Sidebar>
    </div>
    <OverlayPanel ref="global-filter">
      <div class="p-fluid">
        <div class="field">
          <label>{{ $t('contracts.filter.createdFrom') }}</label>
          <PrimeCalendar v-model="filter.createdFrom" dateFormat="dd.mm.yy" showIcon :showButtonBar="true"></PrimeCalendar>
        </div>
        <div class="field">
          <Button icon="pi pi-search" :label="$t('common.search')" class="button-blue p-button-sm" @click="initFilter"/>
          <Button icon="pi pi-trash" class="p-button-outlined p-button-sm mt-1" @click="clearFilter"
                  :label="$t('common.clear')"/>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>


<script>
import RegistryService from "../../service/registry_service";
import {smartEnuApi, findRole, fileRoute} from "@/config/config";
import {registry} from "chart.js";
import QrGenerator from "@/components/QrGenerator.vue";
import * as XLSX from 'xlsx';
import ToolbarMenu from "../ToolbarMenu.vue";


export default {
  name: 'Registry',
  components: {ToolbarMenu, QrGenerator},
  data() {
    return {
      registryService: new RegistryService(),
      filtered: false,
      loading: false,
      lazyParams: {
        page: 0,
        rows: 10,
        first: 0
      },
      user: JSON.parse(window.localStorage.getItem('loginedUser')),
      filter: {
        plan_type: null,
        filtered: false,
        search: null,
      },
      paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown",
      currentPageReportTemplate: this.$t('common.showingRecordsCount', {
        first: '{first}',
        last: '{last}',
        totalRecords: '{totalRecords}',
      }),
      roleId: null,
      registry: [],
      columns: [],
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
      applications: [],
      total:0,
      page: 0,
      rows: 10,
      selectedApplication: null,
      qrVisible: false,
      qrUrl: null,
    }
  },
  methods: {
    open(){
      this.$router.push({ name: 'RegistryAdd', params: {id: parseInt(this.$route.params.id)} });
    },
    update() {
      this.$router.push({ name: 'RegistryAdd', params: {id: parseInt(this.$route.params.id)}, query: {selectedApplicationId: this.selectedApplication.id} });
    },
    delete() {
      const req = {
        id: parseInt(this.selectedApplication.id),
      }
      this.registryService.deleteApplication(req).then(response => {
        this.selectedApplication = null
        this.getRegisterParamterApplaction()
      })
    },
    openDocGeneration(slotProps) {
        this.qrUrl = smartEnuApi + "/registry/Registry/" + parseInt(this.$route.params.id) + "/" + slotProps.data.id;

        this.qrVisible = true;
    },
    openEditForm(slotProps) {
      this.$router.push({ name: 'RegistryPage', params: { id1: this.$route.params.id, id2: slotProps.data.id }})
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
    search(data) {
      this.filter.search = data;
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
        page: 0,
        rows: 10,
      }
      this.registryService.getRegistry(req).then(res => {
        this.loading = false;
        this.registry = res.data.registries[0];
      })
    },
    getUserRole(){
      const req = {
        registry_id: parseInt(this.$route.params.id),
      }
      this.registryService.getUserRole(req).then(res => {
        this.roleId = res.data
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      })
    },
    getRegisterParameter() {
      this.loading = true;
      let req = {
        register_id: parseInt(this.$route.params.id)
      };
      this.registryService.getRegistryParameters(req)
          .then(response => {
            this.loading = false;
            response.data.register_parameter.forEach((item, index) => {
              this.columns.push({
                field: item.label_en,
                label_kz: item.label_kz,
                label_ru: item.label_ru,
                label_en: item.label_en,
                value_kz: item.value_kz,
                value_en: item.value_en,
                value_ru: item.value_ru,
                id: parseInt(item.id),
              });
            });
            this.columns.push({
              field: "QR",
              label_kz: null,
              label_ru: null,
              label_en: null,
              value_kz: null,
              value_en: null,
              value_ru: null,
            });
          })
          .catch(error => {
            this.loading = false;
            console.error('Ошибка при получении параметров:', error);
          });
    },

    getRegisterParamterApplaction() {
    this.loading = true;

      const req = {
        page: this.lazyParams.page,
        rows: this.lazyParams.rows,
        registry_id: parseInt(this.$route.params.id),
      };
      this.registryService.getApplication(req).then((res) => {
        this.applications = res.data.applications
        this.total = res.data.total
      this.loading = false;
      });
    },
    getValue (slotProps, id) {
      if (slotProps && slotProps.data && slotProps.data.parameters) {
        const param = slotProps.data.parameters.find((p) => p.parameter.id === id);
        if (param) {
          switch (this.$i18n.locale) {
            case 'kz':
              return param.value_kz || '';
            case 'ru':
              return param.value_ru || '';
            case 'en':
            default:
              return param.value_en || '';
          }
        }
      }
      return '';
    },

    onPageChange(event){
      this.lazyParams.first = event?.first
      this.lazyParams.page = event?.page
      this.lazyParams.rows = event?.rows
      this.getRegisterParamterApplaction()
      // this.getRegisterParameter()
    },
    getQR: (uuid) => {
      this.qrUrl = smartEnuApi + "/document?qrcode=" + uuid;

      this.qrVisible = true;
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.readExcel(file);
      }
    },
    readExcel(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        this.processExcelData(jsonData);
      };
      reader.readAsBinaryString(file);
    },
    processExcelData(data) {
      const req = {
        data: data,
        registry_id: parseInt(this.$route.params.id),
      }

      this.registryService.importRegistry(req).then((res) => {
          this.$toast.add({severity: "success", summary: res.message});
          }).catch(error => {
            this.$toast.add({severity: "error", summary: error, life: 3000});
      })
    },
    registryExportData() {
      const formattedData = this.applications.map((application) => {
        return application.parameters.reduce((row, param) => {
          const columnName = param.parameter.label_ru || `Column_${param.id}`;
          row[columnName] = param.value_ru || '';
          return row;
        }, {});
      });


      const worksheet = XLSX.utils.json_to_sheet(formattedData);


      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');


      const excelFileName = 'document.xlsx';
      XLSX.writeFile(workbook, excelFileName);
    },
    registryInformation() {
      this.$router.push({ name: 'Registry', params: { id: res.data } })
    }
  },
  computed: {
    toolbarMenus() {
      return [
        {
          label: this.$t('common.add'),
          icon: "pi pi-plus",
          command: () => {
            this.open()
          },
        },
        {
          label: this.$t('registry.import'),
          icon: "pi pi-file-import",
          // disabled: true,
          command: () => {
            this.triggerFileInput()
          },
        },
        {
          label: this.$t('common.export'),
          icon: "pi pi-cloud-upload",
          disabled: !(this.roleId === 1 || this.roleId === 2 || this.roleId === 3) || this.registry.data_source_id !== this.user.userID ,
          command: () => {
            this.registryExportData()
          },
        },
        {
          label: this.$t('workPlan.modifiedPerson'),
          icon: "pi pi-pencil",
          disabled: (this.selectedApplication === null || !(this.roleId === 1 || this.roleId === 2 || this.roleId === 3) || this.registry.data_source_id !== this.user.userID),
          command: () => {
            this.update()
          },
        },
        {
          label: this.$t('common.delete'),
          icon: "pi pi-trash",
          disabled: (this.selectedApplication === null || !(this.roleId === 1 || this.roleId === 2 || this.roleId === 3) || this.registry.data_source_id !== this.user.userID),
          command: () => {
            this.delete()
          },
        },
        {
          label: this.$t('registry.basicInformation'),
          icon: "pi pi-info-circle",
          disabled: this.selectedApplication === null,
          command: () => {
            this.$router.push({ name: 'RegistryTicket', params: { id1: parseInt(this.$route.params.id), id2: this.selectedApplication.id} });
          },
        },
      ]
    },
  },
  created() {
    this.getRegisterParameter()
    this.getRegistry()
    this.getRegisterParamterApplaction()
    this.getUserRole()
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

.button-container {
  display: flex;
  gap: 10px; /* Расстояние между кнопками */
  align-items: center; /* Выравнивание кнопок по центру */
}
</style>