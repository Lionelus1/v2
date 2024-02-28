<template>
  <ProgressSpinner v-if="loading" class="progress-spinner" strokeWidth="5" />
  <div class="flex flex-row mb-3">
    <div v-if="!uuid" class="arrow-icon" @click="$router.back()">
      <i class="fas fa-arrow-left"></i>
    </div>
    <h4 class="m-0">{{ $t("helpDesk.application.applicationName") }}</h4>
  </div>
  <ToolbarMenu :data="menu" @search="search" :search="true" @filter="toggleFilter($event)" :filter="true" :filtered="filtered" />

  <!-- <template #end>
        <Button class="align-items-center" :class="{
          'p-button-success p-button-outlined': filter.applied,
          'p-button-secondary p-button-text': !filter.applied
        }">
        </Button>
      </template> -->


  <BlockUI class="card">
    <DataTable :lazy="true" :rowsPerPageOptions="[5, 10, 20, 50]" :value="data" dataKey="id" :rowHover="true" v-model:filters="filters"
      filterDisplay="menu" :loading="loading" responsiveLayout="scroll" :paginator="true" stripedRows class="p-datatable-sm" :rows="10"
      :totalRecords="total" @page="onPage" v-model:selection="currentDocument" :first="first" scrollable scrollHeight="flex" @lazy="true">
      <template #empty> {{ $t('common.noData') }}</template>
      <template #loading> {{ $t('common.loading') }}</template>

      <Column field="checkbox">
        <template #body="{ data }">
          <Checkbox :disabled="isDisabled(data)" v-model="data.checked" :binary="true" @change="checkBoxSelect(data)" style="margin-left: 20px;" />
        </template>
      </Column>

      <Column field="name" :header="$t('common.name')" style="padding-top: 15px; padding-bottom: 15px;">
        <template #body="{ data }">
          <a href="javascript:void(0)">{{ $i18n.locale === "kz" ? data.namekz : $i18n.locale === "ru" ? data.nameru :
            data.category.nameen }}</a>
        </template>
      </Column>

      <Column field="description" :header="$t('common.description')" style="padding-top: 15px; padding-bottom: 15px;">
        <template #body="{ data }">
          <a href="javascript:void(0)">{{ $i18n.locale === "kz" ? data.descriptionkz : $i18n.locale === "ru" ? data.descriptionru :
            data.descriptionen }}</a>
        </template>
      </Column>
      <!-- <Column style="min-width: 50px;">
            <template #body="{ data }">
              <div class="flex flex-wrap column-gap-1 row-gap-1">
                <Button class="p-button-text p-button-warning p-1 mr-2" @click="currentDocument = data; openDocument()">
                  <i class="fa-solid fa-pencil fa-xl"></i>
                </Button>
                <Button class="p-button-text p-button-danger p-1 mr-2" @click="currentDocument = data; deleteFile()">
                  <i class="fa-solid fa-trash-can fa-xl"></i>
                </Button>
              </div>
            </template>
          </Column> -->
    </DataTable>
  </BlockUI>
  <Dialog :header="$t('common.action.sendToApprove')" v-model:visible="visibility.sendToApproveDialog" :style="{ width: '50vw' }">
    <div class="p-fluid">
      <ApprovalUsers :approving="loading" v-model="selectedUsers" @closed="close('sendToApproveDialog')" @approve="sendToApprove($event)"
        :stages="stages" mode="standard"></ApprovalUsers>
    </div>
  </Dialog>
</template>

<script>
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import { getHeader, smartEnuApi } from "@/config/config";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import axios from 'axios';
export default {
  name: 'Request',
  components: {
    ToolbarMenu, ApprovalUsers
  },
  data() {
    return {
      data: null,
      selectedIds: [],
      filtered: false,
      loading: false,
      lazyParams: {
        page: 0,
        rows: 10,
      },
      total: 0,
      currentDocument: null,
      checked: null,
      maxChecked: 5,
      filter: {
        applied: false,
        name: null,
        author: [],
        status: null,
        years: [],
      },
      visibility: {
        documentInfoSidebar: false,
        revisionDialog: false,
        sendToApproveDialog: false,
      },
      selectedUsers: [],
    }
  },
  computed: {
    menu() {
      return [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          command: () => { this.saveDocument() },
          disabled: !this.selectedIds.length,
        },
        {
          label: this.$t("common.send"),
          icon: "pi pi-fw pi-send",
          disabled: !this.selectedIds.length,
          items: [
            {
              label: this.$t("common.tosign"),
              icon: "pi pi-user-edit",
              command: () => { this.open('sendToApproveDialog') }
            },
          ]
        },
      ];
    },
    saveButtonDisabled() {
      return !this.selectedIds.length;
    },
    selectedCount() {
      return this.data.filter(item => item.checked).length;
    }
  },
  methods: {
    showMessage(msgtype, message, content) {
      this.$toast.add({
        severity: msgtype,
        summary: message,
        detail: content,
        life: 3000
      });
    },
    open(name) {
      this.visibility[name] = true;
    },
    close(name) {
      this.visibility[name] = false
    },
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getCourse()
    },
    search(data) {
      alert(data)
    },
    toggleFilter(event) {
      this.sort = event
    },
    getCourse() {
      axios.post(smartEnuApi + "/onlinecourse/courses",
        {
          page: this.lazyParams.page,
          rows: this.lazyParams.rows,
          categoryID: 4,
          lang: this.$i18n.locale,
          searchText: null,
        }, { headers: getHeader(), })
        .then((res) => {
          this.data = res.data.courses
          for (let i = 1; i <= 8; i++) {
            this.data.push({ name: "Item " + i, checked: false });
          }
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
    isDisabled(rowData) {
      let checkedCount = this.data.filter(item => item.checked).length;
      return checkedCount >= this.maxChecked && !rowData.checked;
    },
    saveDocument() {
      // axios.post(smartEnuApi + "",  { headers: getHeader() })
      //   .then(res => {

      //   }).catch(err => {
      //     if (err.response && err.response.status == 401) {
      //       this.$store.dispatch("logLout")
      //     } else if (err.response && err.response.data && err.response.data.localized) {
      //       this.showMessage('error', this.$t(err.response.data.localizedPath), null)
      //     } else {
      //       console.log(err)
      //     }

      //     this.loading = false;
      //   });
    },
    checkBoxSelect(course) {
      if (course.checked) {
        this.selectedIds.push(course.id);
      } else {
        this.selectedIds = this.selectedIds.filter(id => id !== course.id);
      }
    },
    sendToApprove(approvalUsers) {
      if (this.changed) {
        this.showMessage("warn", this.$t("common.tosign"), this.$t("common.message.saveChanges"));
        return;
      }
      this.loading = true;

    },

  },
  created() {
    this.getCourse()

  },

}

</script>

<style scoped>
.progress-spinner {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
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

.commonColum {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;
}

.customer-badge.status-5 {
  background: #B48B7D;
  color: #fff;
}

.customer-badge.status-4 {
  background: #C8E6C9;
  color: #256029;
}

.customer-badge.status-3 {
  background: #FFCDD2;
  color: #C63737;
}

.customer-badge.status-2 {
  background: #FEEDAF;
  color: #8A5340;
}

.customer-badge.operational-plan {
  background-color: #3B82F6;
  color: #ffffff;
  font-weight: 500;
  border-radius: 3px;
}

.customer-badge.simple-plan {
  background-color: #10b981;
  color: #ffffff;
  font-weight: 500;
  border-radius: 3px;
}

.commonColum {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

