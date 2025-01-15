<template>
  <div class="col-12">
    <div class="flex flex-row mb-3">
      <div class="arrow-icon" @click="$router.back()">
        <i class="fas fa-arrow-left"></i>
      </div>
      <h4 class="m-0">{{$t('registry.registry')}}</h4>
    </div>
    <ToolbarMenu :data="toolbarMenus" @filter="toggle('global-filter', $event)"/>
    <div class="card">
      <input type="file" ref="fileInput" @change="onFileChange" style="display: none;" />
      <DataTable  :loading="loading" :value="applications"  @page="onPageChange" :paginator="true"  :page="0" :rows="10"  :totalRecords="totalRecords" v-model:selection="selectedApplication" selectionMode="single">
        <Column
            v-for="column in columns"
            :key="column.id"
            :header="$i18n.locale === 'kz' ? column.label_kz : $i18n.locale === 'ru' ? column.label_ru : column.label_en">

          <template #body="slotProps">
            <div v-if="column.id">
              {{ getValue(slotProps, column.id) }}
            </div>
            <div v-else>
              <Button
                  icon="pi pi-qrcode"
                  class="p-button"
                  @click="openDocGeneration(slotProps)"/>
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
  </div>
</template>


<script>
import RegistryService from "../../service/registry_service";
import {smartEnuApi, findRole, fileRoute} from "@/config/config";
import {registry} from "chart.js";
import QrGenerator from "@/components/QrGenerator.vue";
import * as XLSX from 'xlsx';


export default {
  name: 'Registry',
  components: {QrGenerator},
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
      totalRecords:0,
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
        page: 0,
        rows: 10,
      }
      this.registryService.getRegistry(req).then(res => {
        this.loading = false;
        this.data = res.data.registries;
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
        page: this.page,
        rows: this.rows,
        registry_id: parseInt(this.$route.params.id),
      };
      this.registryService.getApplication(req).then((res) => {
        this.applications = res.data.applications
        this.totalRecords = res.data.total
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

    onPageChange: (event) => {
      this.page = event.page
      this.getRegisterParamterApplaction()
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
      const formattedRows = []; // Создаем массив для всех строк
      data.forEach(row => {
        const formattedRow = {
          label_kz: `Объект: ${row["Название объекта"]}`,
          value_kz: row["Описание"] || "Описание отсутствует",
          label_ru: `Тип: ${row["Тип объекта"]}`,
          value_ru: row["Местоположение"],
          label_en: `Capacity: ${row["Вместимость"]}`,
          value_en: row["Площадь"],
        };
        formattedRows.push(formattedRow);
      });
      const req = {
        status: 0,
        registry: {
          id: parseInt(this.$route.params.id),
        },
        parameters: formattedRows.map(field => ({
          parameter: {
            id: this.columns[0].id,
            label_kz: field.label_kz,
            label_ru: field.label_ru,
            label_en: field.label_en,
            type: 1,
            registry_id: parseInt(this.$route.params.id),
          },
          value_en: field.value_en,
          value_kz:  field.value_kz,
          value_ru: field.value_ru,
        })),
      };
      this.registryService.createApplication(req).then((res) => {

      })
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
          label: this.$t('workPlan.modifiedPerson'),
          icon: "pi pi-pencil",
          disabled: this.selectedApplication === null,
          command: () => {
            this.update()
          },
        },
        {
          label: this.$t('common.delete'),
          icon: "pi pi-trash",
          disabled: this.selectedApplication === null,
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
</style>