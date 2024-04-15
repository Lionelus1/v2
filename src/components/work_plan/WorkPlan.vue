<template>
  <div class="col-12">
    <h3>{{ $t('workPlan.plans') }}</h3>
    <ToolbarMenu v-model:searchModel="filter.searchText" :data="initMenu" @search="initSearch" :search="true" @filter="toggle('global-filter', $event)" :filter="isAdmin" :filtered="filtered"/>
    <div class="card">
      <DataTable :lazy="true" :rowsPerPageOptions="[5, 10, 20, 50]" :value="data" dataKey="id" :rowHover="true"
                 :loading="loading" responsiveLayout="scroll" :paginator="true" :first="lazyParams.first || 0" :rows="lazyParams.rows" :totalRecords="total" @page="onPage">
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('common.loading') }}</template>
        <Column field="content" :header="$t('workPlan.planName')" sortable>
          <template #body="{ data }">
            <router-link :to="{ name: 'WorkPlanEvent', params: { id: data.work_plan_id }, query: {first: lazyParams.first, page: lazyParams.page, rows: lazyParams.rows} }" tag="a">
              {{ data.work_plan_name }}
            </router-link>
          </template>
        </Column>
        <Column field="sing" :header="$t('ncasigner.sign')">
          <template #body="{ data }">
            <div v-if="showMySign(data.doc_info.approvalStages)">
              <i v-if="greenMySign(data.doc_info.approvalStages)" class="pi pi-check-circle" style="color:green;"></i>
              <i v-else class="pi pi-check-circle" style="color: red;"></i>
            </div>
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
                    v-if="this.isAdmin || (data.user.id === loginedUserId && (data.doc_info?.docHistory?.stateId === Enum.REVISION.ID
                    || data.doc_info?.docHistory?.stateId === Enum.CREATED.ID || data.doc_info?.docHistory?.stateId === Enum.INAPPROVAL.ID))"
                    icon="pi pi-trash" class="p-button-danger mr-2" label="" @click="deleteConfirm(data)"></Button>
          </template>
        </Column>

      </DataTable>
    </div>
    <WorkPlanAdd v-if="showAddPlanDialog" :visible="showAddPlanDialog" @hide="closeBasic"/>

    <OverlayPanel ref="global-filter">
      <div v-for="(item, index) in types" :key="index" class="flex align-items-center">
        <div class="field-radiobutton">
          <RadioButton v-model="filter.plan_type" :value="item.id"/>
          <label :for="item" class="ml-2">{{ item['name_' + $i18n.locale] }}</label>
        </div>
      </div>
      <div class="p-fluid">
        <!--        <div class="field">
                  <label for="status-filter">{{ $t('common.status') }}</label>
                  <Dropdown v-model="filter.doc_status" :options="statuses" optionValue="value"
                            class="p-column-filter" :showClear="true">
                    <template #value="slotProps">
                    <span v-if="slotProps && slotProps.value" :class="'customer-badge status-' + statuses.find((e) => e.value === slotProps.value).value">
                      {{ $i18n.locale === 'kz' ? statuses.find((e) => e.value === slotProps.value).nameKz : $i18n.locale === 'ru'
                        ? statuses.find((e) => e.value === slotProps.value).nameRu : statuses.find((e) => e.value === slotProps.value).nameEn }}
                    </span>
                    </template>
                    <template #option="slotProps">
                    <span :class="'customer-badge status-' + slotProps.option.value">
                      {{ $i18n.locale === 'kz' ? slotProps.option.nameKz : $i18n.locale === 'ru'
                        ? slotProps.option.nameRu : slotProps.option.nameEn }}
                    </span>
                    </template>
                  </Dropdown>
                </div>-->
        <div class="field">
          <Button icon="pi pi-search" :label="$t('common.search')" class="button-blue p-button-sm" @click="initFilter"/>
          <Button icon="pi pi-trash" class="p-button-outlined p-button-sm mt-1" @click="clearFilter()" :label="$t('common.clear')"/>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script>
import WorkPlanAdd from "./WorkPlanAdd";
import {findRole} from "@/config/config";
import {WorkPlanService} from "@/service/work.plan.service";
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import Enum from "@/enum/docstates";
import moment from "moment";
import {formatDate} from "@/helpers/HelperUtil";

export default {
  components: {ToolbarMenu, WorkPlanAdd},
  data() {
    return {
      data: [],
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
        first: 0
      },
      defaultQueryParams: {
        page: 0,
        rows: 10,
        first: 0
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
        {name_kz: "құрылды", name_en: "created", name_ru: "создан", code: "created"},
        {name_kz: "келісуде", name_en: "inapproval", name_ru: "на согласовании", code: "inapproval"},
        {name_kz: "келісілді", name_en: "approved", name_ru: "согласован", code: "approved"},
        {name_kz: "түзетуге", name_en: "revision", name_ru: "на доработку", code: "revision"},
        {name_kz: "қайтарылды", name_en: "rejected", name_ru: "отклонен", code: "rejected"},
        {name_kz: "қол қоюда", name_en: "signing", name_ru: "на подписи", code: "signing"},
        {name_kz: "қол қойылды", name_en: "signed", name_ru: "подписан", code: "signed"},
        {name_kz: "қайта бекітуге жіберілді", name_en: "sent for re-approval", name_ru: "отправлен на переутверждение", code: "sent for re-approval"},
        {name_kz: "жаңартылды", name_en: "updated", name_ru: "обновлен", code: "updated"},
        {name_kz: "берілді", name_en: "issued", name_ru: "выдан", code: "issued"},
      ],
      selectedDocStatus: null,
      types: [],
      showAddPlanDialog: false,
      filtered: false,
      filter: {
        doc_status: null,
        plan_type: null,
        user_id: null,
        searchText: null
      },
      statuses: [Enum.StatusesArray.StatusCreated, Enum.StatusesArray.StatusInapproval, Enum.StatusesArray.StatusApproved,
        Enum.StatusesArray.StatusRevision, Enum.StatusesArray.StatusSigning, Enum.StatusesArray.StatusSigned],
      Enum: Enum,
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
  computed: {
    initMenu() {
      return [
        {
          label: this.$t('workPlan.addPlan'),
          icon: "pi pi-plus",
          command: () => {
            this.openBasic()
          },
        }
      ]
    }
  },
  created() {
    this.isAdmin = this.findRole(null, 'main_administrator')

    this.lazyParams.first = parseInt(this.$route.query.first) || 0
    this.lazyParams.page = parseInt(this.$route.query.page) || 0
    this.lazyParams.rows = parseInt(this.$route.query.rows) || 10

    const storageFilter = JSON.parse(localStorage.getItem("workPlanFilter"))

    this.filter = storageFilter || this.filter
    this.filtered = storageFilter || false

    this.getPlans();
    this.getWorkPlanTypes()
  },
  methods: {
    findRole: findRole,
    formatDate: formatDate,
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
      this.lazyParams.filter = this.filter
      this.planService.getPlans(this.lazyParams).then(res => {
        this.data = res.data.plans;
        this.total = res.data.total;
        this.loading = false;
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
        this.loading = false;
      }).finally(() => {
        const query = {
          first: this.lazyParams.first,
          page: this.lazyParams.page,
          rows: this.lazyParams.rows
        }

        this.$router.push({query: query})
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
          this.$toast.add({severity: "success", summary: this.$t('common.success'), life: 3000});
          this.getPlans();
        }
      }).catch(error => {
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
    },
    onPage(event) {
      this.lazyParams.first = event?.first
      this.lazyParams.page = event?.page
      this.lazyParams.rows = event?.rows
      this.getPlans();
    },
    clearFilter() {
      localStorage.removeItem("workPlanFilter");
      this.filter = {
        doc_status: null,
        plan_type: null,
        user_id: null,
      }
      this.selectedPlanType = null;
      this.filtered = false;
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
    initSearch(searchText) {
      this.filter.searchText = searchText;
      this.initFilter()
    },
    initFilter() {
      localStorage.setItem("workPlanFilter", JSON.stringify(this.filter));
      this.lazyParams.first = 0
      this.lazyParams.page = 0
      this.filtered = true;
      this.getPlans()
    },
    showMySign(approvalStages) {
      try {
        for (let i in approvalStages) {
          let stage = approvalStages[i]
          let stagePassed = true

          for (let j = 0; j < stage.users.length; j++) {
            if (stage.usersApproved[j] < 1) {
              stagePassed = false
            }

            if (stage.users[j].userID === this.loginedUserId) {
              return true
            }
          }

          if (!stagePassed) {
            break
          }
        }
      } catch (e) {
        console.log(e)
        return false
      }

      return false
    },
    greenMySign(approvalStages) {
      let signed = true

      try {
        for (let i in approvalStages) {
          let stage = approvalStages[i]
          let stagePassed = true

          for (let j = 0; j < stage.users.length; j++) {
            if (stage.usersApproved[j] < 1) {
              stagePassed = false
            }

            if (stage.users[j].userID === this.loginedUserId && stage.usersApproved[j] < 1) {
              signed = false
            }
          }

          if (!stagePassed) {
            break
          }
        }
      } catch (e) {
        console.log(e)
        return signed
      }

      return signed
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

  &.oper {
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

  .approved {
    color: #42855B;
  }

  .not-approved {
    color: #a6a6a6;
  }
}
</style>