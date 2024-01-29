<template>
  <div class="col-12">
    <h3>{{ $t('workPlan.plans') }}</h3>
    <div class="card">
      <Button :label="$t('workPlan.addPlan')" icon="pi pi-plus" @click="openBasic" class="ml-2 p-button-outlined"/>
    </div>
    <div class="card">
      <DataTable :lazy="true" :rowsPerPageOptions="[5, 10, 20, 50]" :value="data" dataKey="id" :rowHover="true"
        v-model:filters="filters" filterDisplay="menu" :loading="loading" responsiveLayout="scroll" :paginator="true"
        :rows="10" :totalRecords="total" @page="onPage"
        :globalFilterFields="['question', 'recipient', 'status', 'sendDate', 'createDate']" @sort="onSort($event)">
        <template #header>
          <div class="table-header flex justify-content-end align-items-center">
            <div v-if="isAdmin">
            <Button type="button" icon="fa-solid fa-filter" @click="toggle('global-filter', $event)" aria:haspopup="true"
              aria-controls="overlay_panel" class="p-button-outlined mr-2" />
            <OverlayPanel ref="global-filter">
              <div v-for="(item, index) in types" :key="index" class="flex align-items-center">
                <div class="field-radiobutton">
                  <RadioButton v-model="selectedPlanType" :value="item.id" />
                  <label :for="item" class="ml-2">{{ item['name_' + $i18n.locale] }}</label>
                </div>
              </div>
              <div class="p-fluid">
                <div class="field">
                  <Button icon="pi pi-search" :label="$t('common.search')" class="ml-1" @click="setPlanType(null)" />
                </div>
                <div class="field">
                  <Button icon="pi pi-trash" class="ml-1" @click="clearPlanTypeFilter()" :label="$t('common.clear')" />
                </div>
              </div>
            </OverlayPanel>
          </div>
            <span class="p-input-icon-left"><i class="pi pi-search" />
              <InputText type="search" v-model="lazyParams.searchText" @keyup.enter="getPlans"
                :placeholder="$t('common.search')" @search="getPlans" />
              <Button icon="pi pi-search" class="ml-1" @click="getPlans" />
            </span>
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column field="content" :header="$t('workPlan.planName')" sortable>
          <template #body="{ data }">
            <a href="javascript:void(0)" @click="navigateToEvent(data)">{{ data.work_plan_name }}</a>
          </template>
        </Column>

        <Column field="status" :header="$t('common.status')">
          <template #body="{ data }">
            <span :class="'customer-badge status-' + data.doc_info.docHistory.stateEn">
              {{ getDocStatus(data.doc_info.docHistory.stateEn) }}
          </span>
          </template>
        </Column>
        <Column field="user" :header="$t('common.created')">
          <template #body="{ data }">
            {{ data.user.fullName }}
          </template>
        </Column>
        <Column field="status" :header="$t('workPlan.planType')" v-if="isAdmin">
          <template #body="{ data }">
            <span :class="'customer-badge ' + data.plan_type.code">
              {{ data.plan_type['name_' + $i18n.locale] }}
            </span>
          </template>
        </Column>
        <Column field="create_date" :header="$t('faq.createDate')">
          <template #body="{ data }">
            {{ formatDate(data.create_date) }}
          </template>
        </Column>
        <Column field="actions" header="">
          <template #body="{ data }">
            <Button type="button"
              v-if="data.user.id === loginedUserId && (data.status.work_plan_status_id === 1 || data.status.work_plan_status_id === 3 || data.status.work_plan_status_id === 5)"
              icon="pi pi-trash" class="p-button-danger mr-2" label="" @click="deleteConfirm(data)"></Button>
          </template>
        </Column>

      </DataTable>
    </div>

    <!--    <Dialog :header="$t('common.action.accept')" v-model:visible="isAcceptModal" :style="{width: '450px'}" class="p-fluid">
          <div class="field">
          </div>
          <template #footer>
            <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                    @click="closeModal"/>
            <Button :label="$t('ncasigner.sign')" icon="pi pi-check" class="p-button-rounded p-button-success mr-2" @click="approve"/>
          </template>
        </Dialog>

        <Dialog header="На доработку" v-model:visible="isRejectModal" :style="{width: '450px'}" class="p-fluid">
          <div class="field">
            <label>Комментарий</label>
            <Textarea v-model="comment" rows="3" style="resize: vertical"/>
          </div>
          <template #footer>
            <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                    @click="closeModal"/>
            <Button label="Отправить" icon="pi pi-check" class="p-button-rounded p-button-success mr-2"
                    @click="rejectPlan"/>
          </template>
        </Dialog>-->

    <WorkPlanAdd v-if="showAddPlanDialog" :visible="showAddPlanDialog" @hide="closeBasic" />
  </div>
</template>

<script>
import WorkPlanAdd from "./WorkPlanAdd";
import { getHeader, smartEnuApi, findRole } from "@/config/config";
import { WorkPlanService } from "@/service/work.plan.service";

export default {
  components: { WorkPlanAdd },
  data() {
    return {
      data: [],
      //searchText: null,
      isAdded: null,
      isCurrentUserApprove: false,
      isAcceptModal: false,
      isRejectModal: false,
      comment: null,
      currentWorkPlanId: 0,
      loading: false,
      isAdmin: false,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      planService: new WorkPlanService(),
      lazyParams: {
        page: 0,
        rows: 10,
        searchText: null,
        filter: {
          plan_type: null,
          user_id: null,
        }
      },
      total: 0,
      selectedPlanType: null,
      workplan_radio_options: [
        {
          text: this.$t('workPlan.simplePlan'),
          value: "simple_plan"
        },
        {
          text: this.$t('workPlan.operationalPlan'),
          value: "oper_plan"
        },
        {
          text: this.$t('workPlan.myPlans'),
          value: "my_plan"
        },

      ],
      docStatus: [
        { name_kz: "құрылды", name_en: "created", name_ru: "создан", code: "created" },
        { name_kz: "келісуде", name_en: "inapproval", name_ru: "на согласовании", code: "inapproval" },
        { name_kz: "келісілді", name_en: "approved", name_ru: "согласован", code: "approved" },
        { name_kz: "түзетуге", name_en: "revision", name_ru: "на доработку", code: "revision" },
        { name_kz: "қайтарылды", name_en: "rejected", name_ru: "отклонен", code: "rejected" },
        { name_kz: "қол қоюда", name_en: "signing", name_ru: "на подписи", code: "signing" },
        { name_kz: "қол қойылды", name_en: "signed", name_ru: "подписан", code: "signed" },
        { name_kz: "қайта бекітуге жіберілді", name_en: "sent for re-approval", name_ru: "отправлен на переутверждение", code: "sent for re-approval" },
        { name_kz: "жаңартылды", name_en: "updated", name_ru: "обновлен", code: "updated" },
        { name_kz: "берілді", name_en: "issued", name_ru: "выдан", code: "issued" },
      ],
      selectedDocStatus: null,
      types: [],
      showAddPlanDialog: false
    }
  },
  mounted() {
    this.emitter.on('workPlanIsAdded', (data) => {
      if (data === true) {
        this.getPlans();
      }
    });
    this.emitter.on('planSentToReapprove', (data) => {
      if (data === true) {
        this.getPlans();
      }
    });

  },
  created() {
    this.isAdmin = this.findRole(null, 'main_administrator')
    this.getPlans();
    this.getWorkPlanTypes()
  },
  methods: {
    findRole: findRole,
    toggle(ref, event) {
      this.$refs[ref].toggle(event);
    },
    openBasic() {
      this.showAddPlanDialog = true
    },
    closeBasic() {
      this.showAddPlanDialog = false
      this.getPlans()
    },
    getPlans() {
      this.loading = true;
      this.planService.getPlans(this.lazyParams).then(res => {
        this.data = res.data.plans;
        this.total = res.data.total;
        this.loading = false;
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
        this.loading = false;
      });
    },
    rejectPlan() {
      let data = {
        work_plan_id: this.currentWorkPlanId,
        comment: this.comment
      }
      this.planService.rejectPlan(data).then(res => {
        if (res.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('workPlan.message.planSentToApprove'),
            life: 3000,
          });
        }
        this.isRejectModal = false;
        this.getPlans();
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    deleteConfirm(event) {
      this.$confirm.require({
        message: this.$t('common.doYouWantDelete'),
        header: this.$t('common.delete'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.delete(event);
        },
      });
    },
    delete(event) {
      this.planService.deletePlan(event.work_plan_id).then(response => {
        if (response.data.is_success) {
          this.$toast.add({
            severity: "success",
            summary: this.$t('common.success'),
            life: 3000,
          });
          this.getPlans();
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    navigateToEvent(event) {
      //localStorage.setItem('workPlan', JSON.stringify(event));
      this.$router.push({ name: 'WorkPlanEvent', params: { id: event.work_plan_id } });
    },
    formatDate(value) {
      let result = "";
      if (value == null) {
        return result;
      }
      let date = new Date(value);
      result = date.toLocaleDateString("kk-KZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return result == "Invalid Date" ? "" : result;
    },
    openAcceptModal(id) {
      this.isAcceptModal = true;
      this.currentWorkPlanId = id;
    },
    openRejectModal(id) {
      this.isRejectModal = true;
      this.currentWorkPlanId = id;
    },
    closeModal() {
      this.isAcceptModal = false;
      this.isRejectModal = false;
    },
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getPlans();
    },
    clearPlanTypeFilter() {
      this.lazyParams.filter.is_plan = null;
      this.lazyParams.filter.is_oper_plan = null;
      this.selectedPlanType = null;
      this.lazyParams.filter.user_id = null;
      this.getPlans();
    },
    setPlanType() {
      this.lazyParams.filter.plan_type = this.selectedPlanType
      this.getPlans();
    },
    getDocStatus(code) {
      const foundStatus = this.docStatus.find(status => status.code === code);

      if (foundStatus) {
        switch (this.$i18n.locale) {
          case "kz":
            return foundStatus.name_kz;
          case "ru":
            return foundStatus.name_ru;
          case "en":
            return foundStatus.name_en;
          default:
            return null;
        }
      } else {
        return null;
      }
    },
    getWorkPlanTypes() {
      this.types = []
      this.planService.getWorkPlanTypes().then(res => {
        this.types = res.data
        this.types.push({id: 4, code: 'mine', name_kz: 'Менің жоспарларым', name_ru: 'Мои планы', name_en: 'My Plans'})
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      })
    },
  }
}
</script>

<style scoped lang="scss">
.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;

  &.status-5 {
    background: #B48B7D;
    color: #fff;
  }

  &.status-4 {
    background: #C8E6C9;
    color: #256029;
  }

  &.status-3 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-2 {
    background: #FEEDAF;
    color: #8A5340;
  }

  &.status-1 {
    background: #B3E5FC;
    color: #23547B;
  }
  &.created {
    background: #3588a8;
    color: #fff;
  }

  &.inapproval {
    background: #C8E6C9;
    color: #256029;
  }

  &.approved {
    background: #FFCDD2;
    color: #C63737;
  }

  &.revision {
    background: #FEEDAF;
    color: #8A5340;
  }

  &.rejected {
    background: #B3E5FC;
    color: #23547B;
  }
  &.signing {
    background: #2a6986;
    color: #bfc9d1;
  }
  &.signed {
    background: rgb(57, 134, 42);
    color: #bfc9d1;
  }
  &.sent for re-approval {
    background: rgb(134, 42, 119);
    color: #bfc9d1;
  }
  &.updated for re-approval {
    background: rgb(134, 42, 54);
    color: #bfc9d1;
  }
  &.issued for re-approval {
    background: rgb(42, 134, 88);
    color: #bfc9d1;
  }

  &.oper  {
    background-color: #3B82F6;
    color: #ffffff;
    font-weight: 500;
    border-radius: 3px;
  }

  &.standart {
    background-color: #10b981;
    color: #ffffff;
    font-weight: 500;
    border-radius: 3px;
  }

  &.science {
    background: #3588a8;
    color: #fff;
    font-weight: 500;
    border-radius: 3px;
  }
}
</style>