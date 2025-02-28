<template>
  <ProgressBar v-if="wait" mode="indeterminate" style="height: .5em" />
  <BlockUI :blocked="wait" :fullScreen="true"></BlockUI>
  <div>
    <DataTable :value="approvalList" tableStyle="width: 100%;">
      <Column header="ID">
        <template #body="slotProps">
          <span>
            {{ slotProps.data.approvalListId }}
          </span>
        </template>
      </Column>
      <Column :header="$t('roleControl.title')">
        <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz" ? slotProps.data.titleKz : $i18n.locale === "ru"
                  ? slotProps.data.titleRu : slotProps.data.titleEn
            }}
          </span>
        </template>
      </Column>
      <Column :header="$t('roleControl.certificate')">
        <template #body="slotProps">
          <span> {{ slotProps.data.certificate.value }} </span>
        </template>
      </Column>
      <Column :header="$t('roleControl.userChangeable')">
        <template #body="slotProps">
          <span>
            <Checkbox v-model="slotProps.data.userChangeable" :binary="true" :disabled="true"></Checkbox>
          </span>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button icon="fa-solid fa-users" class="p-button-warning" @click="open(slotProps.data, 'users')" style="margin-right: 0.5rem"/>
          <Button icon="fa-solid fa-pencil" @click="open(slotProps.data, 'edit')" style="margin-right: 0.5rem"/>
          <!-- <Button icon="fa-solid fa-trash-can" @click="deleteApproval(slotProps.data)" class="p-button-danger"/> -->
        </template>
      </Column>

      <div class="card flex justify-content-start flex-wrap gap-3">
        <Button icon="fa-solid fa-plus" class="p-button-success" raised @click="open(null, 'create')"></Button>
      </div>

    </DataTable>
  </div>
  <!--  БОКОВАЯ ПАНЕЛЬ default user -->
  <Sidebar v-model:visible="view['users']"
           position="right"
           class="p-sidebar-lg"
           style="overflow-y: scroll">
    <div>
      <span>
        <h5 style="margin-top: 15px">
          {{ this.currentApprovalList['title' + this.$i18n.locale[0].toUpperCase() + this.$i18n.locale.slice(1)] }}
        </h5>
      </span>
      <FindUser
          v-model="newApprovalList.users"
          :userType="Enum.UserType.Staff"
          @add="infoChanged" @remove="infoChanged"
      ></FindUser>
    </div>
    <div>
      <Button :label="$t('common.save')" icon="pi pi-check"
              :disabled="!changed"
              @click="saveDefaultUsers" style="margin-top: 15px"/>
    </div>
  </Sidebar>

  <!--  EDIT-->
  <Sidebar v-model:visible="view['edit']"
           position="right"
           class="p-sidebar-lg"
           style="overflow-y: scroll">
    <div>
      <h5 style="margin-top: 15px">
        {{ this.currentApprovalList['title' + this.$i18n.locale[0].toUpperCase() + this.$i18n.locale.slice(1)] }}
      </h5>
      <span>
        <div class="flex align-items-center">
          <Checkbox @change="infoChanged" v-model="newApprovalList.userChangeable" :binary="true"/>
          <label class="ml-2"> {{ $t('roleControl.userChangeable') }} </label>
        </div>
      </span>
      <br>
      <div>
        <label> {{ $t('common.chooseCert') }} </label>
        <br>
        <Dropdown v-model="newApprovalList.certificate.value"
                  :options="sertificates"
                  @change="infoChanged"
                  :placeholder="$t('roleControl.certificate')"
                  class="w-full md:w-14rem"
        ></Dropdown>
      </div>
    </div>
    <div>
      <Button :label="$t('common.save')" icon="pi pi-check" :disabled="!changed"
              @click="editApprovalList" style="margin-top: 15px"/>
    </div>
  </Sidebar>

  <!--  ADD-->
  <Sidebar v-model:visible="view['create']"
           position="right"
           class="p-sidebar-lg"
           style="overflow-y: scroll">
    <h5>
      {{ $t('roleControl.addSidebar') }}
    </h5>
    <div>
      <br>
      <span class="p-float-label1">
        <label>{{ $t('common.nameInQazaq') }}</label>
        <InputText v-model="newApprovalList.titleKz" class="w-full p-float-label"/>
      </span>
      <br>
      <span class="p-float-label2">
        <label>{{ $t('common.nameInRussian') }}</label>
        <InputText  v-model="newApprovalList.titleRu" class="w-full p-float-label"/>
      </span>
      <br>
      <span class="p-float-label3">
        <label>{{ $t('common.nameInEnglish') }}</label>
        <InputText v-model="newApprovalList.titleEn" class="w-full p-float-label"/>
      </span>
      <br>
      <span>
        <div class="flex align-items-center">
          <Checkbox v-model="newApprovalList.userChangeable" :binary="true"/>
          <label class="ml-2">
            {{ $t('roleControl.userChangeable') }}
          </label>
        </div>
      </span>
      <br>
      <div>
        <label>{{ $t('common.chooseCert') }}</label>
        <br>
        <Dropdown v-model="newApprovalList.certificate.value"
                  :options="sertificates"
                  :placeholder="$t('roleControl.certificate')"
                  class="w-full md:w-14rem"
        ></Dropdown>
      </div>
    </div>
    <div>
      <Button :label="$t('common.save')" icon="pi pi-check" :disabled="!(newApprovalList.titleKz && newApprovalList.titleRu && newApprovalList.titleEn)"
              @click="saveApprovalList" style="margin-top: 10px"/>
    </div>
  </Sidebar>
</template>
<script>
import api from "@/service/api";
import {getHeader, smartEnuApi} from '../../config/config';
import Enum from '@/enum/roleControls/index'

export default {
  data() {
    return {
      approvalList: [],
      view: {
        users: false,
        create: false,
        edit: false,
      },
      sertificates: [
        'individual',
        'ceo',
        'financial_sign_right',
        'hr_worker',
        'internal',
      ],
      Enum: Enum,
      currentApprovalList: null,
      newApprovalList: {
        approvalListId: null,
        titleKz: null,
        titleRu: null,
        titleEn: null,
        certificate: {
          value: 'internal',
        },
        userChangeable: true,
        users: [],
      },
      changed: false,
      wait: false,
    };
  },
  mounted() {
    this.getApprovalList();
  },
  methods: {
    getApprovalList() {
      this.wait = true

      api.get('/approvalList/get', {
        headers: getHeader()
      }).then(res => {
        this.approvalList = res.data;
        this.wait = false
      }).catch(err => {
        this.wait = false
      });
    },
    open(data, name) {
      this.view[name] = true
      this.changed = false
      this.clear()

      if (name !== 'create') {
        this.currentApprovalList = data
        this.newApprovalList.users = data.users
        this.newApprovalList.certificate.value = data.certificate.value
        this.newApprovalList.userChangeable = data.userChangeable
      }
    },
    close(name) {
      this.view[name] = false
    },
    clear() {
      this.newApprovalList = {
        approvalListId: null,
        titleKz: null,
        titleRu: null,
        titleEn: null,
        certificate: {
          value: 'internal',
        },
        userChangeable: true,
        users: [],
      }
    },
    saveDefaultUsers() {
      this.wait = true
      let currentUsersId = []
      this.newApprovalList.users.forEach(elem => {
        currentUsersId.push(elem.userID)
      })

      api.post('/approvalList/defaultUsers', {
        approvalListId: this.currentApprovalList.approvalListId,
        userIds: [...currentUsersId],
      }, {
        headers: getHeader()
      }).then(res => {
        for (let i = 0; i < this.approvalList.length; i++) {
          if (this.approvalList[i].approvalListId === this.currentApprovalList.approvalListId) {
            this.approvalList[i].users = res.data.users
            break
          }
        }

        this.$toast.add({
          severity: "success",
          summary: this.$t("common.save"),
          detail: this.$t("common.message.succesSaved"),
          life: 3000,
        })

        this.wait = false
        this.close('users')
      }).catch(err => {
        this.wait = false
      });
    },
    saveApprovalList() {
      this.wait = true
      api.post('/approvalList/create', {
        titleRu: this.newApprovalList.titleRu,
        titleEn: this.newApprovalList.titleEn,
        titleKz: this.newApprovalList.titleKz,
        userChangeable: this.newApprovalList.userChangeable,
        certificate: this.newApprovalList.certificate.value
      }, {
        headers: getHeader()
      }).then(res => {
        this.approvalList.push(res.data)

        this.$toast.add({
          severity: "success",
          summary: this.$t("common.save"),
          detail: this.$t("common.message.succesSaved"),
          life: 3000,
        })

        this.wait = false
        this.close('create')
      }).catch(err => {
        this.wait = false
      });
    },
    editApprovalList() {
      this.wait = true
      api.post('/approvalList/update', {
        approvalListId: this.currentApprovalList.approvalListId,
        userChangeable: this.newApprovalList.userChangeable,
        certificate: this.newApprovalList.certificate.value,
      }, {
        headers: getHeader()
      }).then(res => {
        for (let i = 0; i < this.approvalList.length; i++) {
          if (this.approvalList[i].approvalListId === this.currentApprovalList.approvalListId) {
            this.approvalList[i].userChangeable = res.data.userChangeable
            this.approvalList[i].certificate.value = res.data.certificate.value
            break
          }
        }

        this.$toast.add({
          severity: "success",
          summary: this.$t("common.save"),
          detail: this.$t("common.message.succesSaved"),
          life: 3000,
        })

        this.wait = false
        this.close('edit')
      }).catch(err => {

        this.wait = fase
      });
    },
    infoChanged() {
      this.changed = true
    },
  }
};
</script>



   

