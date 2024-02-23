<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5"/>
  <div class="flex flex-row mb-3">
    <div v-if="!uuid"  class="arrow-icon" @click="$router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h4 class="m-0">{{ $t("helpDesk.application.applicationName") }}</h4>
  </div>
  <BlockUI v-if="haveAccess" :blocked="loading" class="card">
    <Menubar :model="menu" class="m-0 pt-0 pb-0"></Menubar>
      <div class="">
        <div class="p-fluid md:col-6 mt-4">
        <label >{{ $t('helpDesk.application.categoryApplication') }}</label>
        <InputText type="text" v-model="selectedDirection['name_' + $i18n.locale] " disabled />
        </div>

        <div v-if="selectedDirection && selectedDirection.id === 2">
        <div class="p-fluid md:col-6">
        <label>{{ $t('helpDesk.application.choseAudience') }}</label>
        <Dropdown  v-model="choseAudience"  optionLabel="name" optionValue="id" :placeholder="$t('common.select')"/>
        </div>
        <div class="p-fluid md:col-6">
            <div style="overflow-x: auto;">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="date in dates" :key="date">{{ date }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="timeSlot in times" :key="timeSlot.time">
                    <td>{{ timeSlot.time }}</td>
                    <td v-for="date in dates" :key="date"
                        :class="{ selected: isSelected(timeSlot.time, date), booked: times.find(slot => slot.time === timeSlot.time)[date] }"
                        @click="cellClicked(timeSlot.time, date)"
                        :data-time="timeSlot.time"
                        :data-date="date">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      </div>
      <div v-if="selectedDirection && selectedDirection.id === 3">
        <div class="p-fluid md:col-6">
        <label>{{ $t('helpDesk.application.selectSpecialist') }}</label>
        <Dropdown v-model="specialization"   optionLabel="name" optionValue="id" :placeholder="$t('common.select')"/>
        </div>
          <div class="p-fluid md:col-6">
            <div style="overflow-x: auto;">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="date in dates" :key="date">{{ date }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="timeSlot in times" :key="timeSlot.time">
                    <td>{{ timeSlot.time }}</td>
                    <td v-for="date in dates" :key="date"
                        :class="{ selected: isSelected(timeSlot.time, date), booked: times.find(slot => slot.time === timeSlot.time)[date] }"
                        @click="cellClicked(timeSlot.time, date)"
                        :data-time="timeSlot.time"
                        :data-date="date">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      </div>
      <div class="p-fluid md:col-6">
        <label>{{ $t('helpDesk.application.description') }}</label>
        <Textarea class="mt-2" v-model="request.description_ru" autoResize rows="5" cols="30" />
      </div>
      <div class="p-fluid md:col-6">
        <label>{{ $t('helpDesk.application.contactNumber')}}</label>
        <InputText class="mt-2" v-model="contactNumber"/>
      </div>
      </div>
      <template #footer>
        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                @click="closeBasic"/>
        <Button :label="$t('common.createNew')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
                :disabled="isDisabled && lang" @click="createHelpDesk"/>
      </template>
    <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="visibility.sendToApproveDialog"
          :style="{width: '50vw'}">
    </Dialog>
  </BlockUI>
  
</template>
<script>
import DocEnum from "@/enum/docstates/index";
import { getHeader, smartEnuApi } from "@/config/config";
import axios from "axios";
export default {
  name: 'Request',
  components: {},
  data() {
    return {
      choseAudience:null,
      specialization: null,
      contactNumber:null,
      category: null,
      directions:null,
      selectedCell:null,
      selectedDateTime:null,
      selectedDirection: {
        name_ru: null,
        name_kz: null,
        name_en: null,
      },
      haveAccess: true,
      selectResponse: null,
      DocEnum:DocEnum,
      visibility: {
        documentInfoSidebar: false,
        revisionDialog: false,
        sendToApproveDialog: false,
      },
      request:{
            id: null,
            sender_Id:null,
            name_kz: "",
            name_ru: "",
            name_en: "",
            description_kz: this.description,
            description_ru: this.description,
            description_en: this.description,
            doc_id:null,
            category: null,
            uuid: this.uuid ? this.uuid : this.$route.params.uuid,
            is_saved: 1,
            local: null
          },
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: () => !this.isSaveItemsRequest,
          command: () => { this.saveDocument() }
        },
        {
          label: this.$t("common.send"),
          icon: "pi pi-send",
          disabled: () => !this.isSendItemsRequest,
          items: [
            {
              label: this.$t("common.tosign"),
              icon: "pi pi-user-edit",
              visible: () => '',
              command: () => { this.open('sendToApproveDialog') }
            },
            // {
            //   label: this.$t("common.revision"),
            //   icon: "fa-regular fa-circle-xmark",
            //   visible: () => '',
            //   command: () => { this.open('revisionDialog') }
            // },
          ]
        },
      ],
      dates: ['2024-02-14', '2024-02-15', '2024-02-16', '2024-02-17', '2024-02-18'], // Даты для примера, можете изменить на свои
      times: [
        { time: '08:00', '2024-02-14': null, '2024-02-15': null, '2024-02-16': null, '2024-02-17': null, '2024-02-18': null },
        { time: '09:00', '2024-02-14': null, '2024-02-15': null, '2024-02-16': null, '2024-02-17': null, '2024-02-18': null },
        { time: '10:00', '2024-02-14': null, '2024-02-15': null, '2024-02-16': null, '2024-02-17': null, '2024-02-18': null },
        { time: '11:00', '2024-02-14': null, '2024-02-15': null, '2024-02-16': null, '2024-02-17': null, '2024-02-18': null }
      ]
    }
  },
  methods: {
    cellClicked(time, date) {
        if (this.selectedCell && this.selectedCell.time === time && this.selectedCell.date === date) {
          this.selectedCell = null;
          return;
        }

          this.selectedCell = { time, date };
          this.selectedDateTime = {time, date};

          // Удалите класс 'selected' у всех ячеек
          document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));

          // Добавьте класс 'selected' к выбранной ячейке
          document.querySelector(`td[data-time="${time}"][data-date="${date}"]`).classList.add('selected');
      },
      

      isSelected(time, date) {
        return this.selectedCell && this.selectedCell.time === time && this.selectedCell.date === date;
      },
      saveDocument() {
        axios.post(smartEnuApi+"/helpdesk/ticket/create", this.request, {headers: getHeader()})
        .then(res => {

      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          console.log(err)
        }

        this.loading = false;
      });
      },

  },
  created() {
    switch (this.$i18n.locale) {
    case "kz":
      this.request.local = 1;
      break;
    case "ru":
      this.request.local = 2;
      break;
    case "en":
      this.request.local = 3;
      break;
    default:
      this.request.local = 1;
      break;
  }


    axios.post(smartEnuApi + "/helpdesk/ticket/get",
          {
            ID:null,
            SearchText:null,
            Page:0,
            Rows:10,
            uuid: this.uuid ? this.uuid : this.$route.params.uuid, 
            is_saved: history.state.isCreated
          },{ headers: getHeader(),})
        .then((res) => {
          this.request.id = res.data.ticket[0].id
          this.request.category = res.data.ticket[0].category
          this.selectedDirection = res.data.ticket[0].category
        })
        .catch((err) => {
          if (err.response.status == 401) {
            this.$store.dispatch("logLout");
          }

          this.$toast.add({
            severity: "error",
            detail: this.$t("common.message.saveError"),
            life: 3000,
          });
        });
  
  },
  computed: {
    isSaveItemsRequest(){
      return this.choseAudience !== null || this.specialization !== null || this.description !== null || this.contactNumber !== null;
    },
    isSendItemsRequest(){
      return  this.description !== null && this.contactNumber !== null; //this.choseAudience !== null && this.specialization !== null &&
    }
  }
  }

</script>
<style scoped>
.progress-spinner {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  margin: auto;
  z-index: 1102;
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
.status-status_created {
  background: #6c757d;
  color: #fff;
}
.status-status_signing {
  background: #17a2b8;
  color: #fff;
}
.status-status_signed {
  background: #28a745;
  color: #fff;
}
.status-status_inapproval {
  background: #9317b8;
  color: #ffffff;
}
.status-status_approved {
  background: #007bff;
  color: #ffffff;
}
.status-status_revision {
  background: #ffcdd2;
  color: #c63737;
}
:deep(.p-datatable-footer),
:deep(.p-button-link),
:deep(.p-datatable-thead > tr > th) {
  padding-top: 0rem;
  padding-bottom: 0rem;
}
table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f2f2f2;
}

td.selected {
  background-color: #aaf0d1;
}

td.booked {
  background-color: #ffcccc;
}

td.selected.booked {
  background-color: #ffcdd2;
}

td:hover {
  cursor: pointer;
  background-color: #f9f9f9;
}
</style>