<template>
  <div class="col-12">
    <!--    <h4>Сұрақ-жауап</h4>-->
    <div class="card" v-if="userData.userType === 'student'">
      <Button icon="pi pi-plus" :label="$t('faq.addFaq')" @click="createFaq"/>
    </div>
    <div class="card" v-if="isShowPersonal">
      <DataTable :lazy="true" :value="data" :paginator="true" @page="onPage($event)" :totalRecords="total"
                 paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                 :rowsPerPageOptions="[10,25,50]"
                 :currentPageReportTemplate="$t('common.showingRecordsCount', {first: '{first}', last: '{last}', totalRecords: '{totalRecords}' })"
                 class="p-datatable-customers" :rows="10" dataKey="id" :rowHover="true" v-model:filters="filters"
                 filterDisplay="menu"
                 :loading="loading" responsiveLayout="scroll"
                 :globalFilterFields="['question','recipient','status', 'sendDate', 'createDate']"
                 @sort="onSort($event)">
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <h5 class="m-0">{{ $t('faq.title') }}</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"/>
              <InputText type="search" v-model="userData.searchText" :placeholder="$t('common.search')"
                         @keyup.enter="getData" @click="clearData"/>
              <Button icon="pi pi-search" class="ml-1" @click="getData"/>
            </span>
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('faq.loading') }}</template>
        <Column field="content" :header="$t('faq.question')" sortable>
          <template #body="{ data }">
            <router-link :to="{ name: 'FaqView', params: { id: data.id } }" tag="a">
              {{ data.content }}
            </router-link>
          </template>
        </Column>
        <Column
            :field=" $i18n.locale === 'kz' ? `category.nameKz` : $i18n.locale === 'ru' ? `category.nameRu` : `category.nameEn`"
            :header="$t('faq.recipient')" sortable>
          <template #body="{data}">
            {{
              $i18n.locale === "kz" ? data.category.nameKz : $i18n.locale === "ru" ? data.category.nameRu : data.category.nameEn
            }}
          </template>
        </Column>
        <Column :header="$t('faq.status')"
                :field="$i18n.locale === 'kz' ? `status.nameKz` : $i18n.locale === 'ru' ? `status.nameRu` : `status.nameEn`"
                style="min-width: 10rem;"
                sortable>
          <template #body="{data}">
            <span :class="'customer-badge status-' + data.status.id">
              {{
                $i18n.locale === "kz"
                    ? data.status.nameKz
                    : $i18n.locale === "ru"
                        ? data.status.nameRu
                        : data.status.nameEn
              }}
            </span>
          </template>
        </Column>
        <Column
            :header="$t('faq.sendDate')"
            field="sendDate"
            dataType="date"
            sortable
        >
          <template #body="{ data }">
            {{ formatDate(data.sendDate) }}
          </template>
        </Column>
        <Column
            :header="$t('faq.createDate')"
            field="createdDate"
            dataType="date"
            sortable
        >
          <template #body="{ data }">
            {{ formatDate(data.createdDate) }}
          </template>
        </Column>
        <Column :header="$t('faq.attachments')" field="createdDate" style="min-width: 10rem">
          <template #body="{ data }">
            <Button
                type="button"
                icon="pi pi-image"
                @click="downloadFile(data.image, 0)"
                class="p-button-rounded p-button-success mr-2"
                v-if="data.image != null"
            ></Button>
            <Button
                type="button"
                icon="pi pi-file"
                @click="downloadFile(data.filePath, 1)"
                class="p-button-rounded p-button-success"
                v-if="data.filePath != null"
            ></Button>
          </template>
        </Column>
        <Column
            :v-if="userData.userType === 'personal'">
          <template #body="{ data }">
            <Button
                type="button"
                icon="pi pi-check-square"
                @click="openAnswerFaq(data)"
                v-if="departmentAccess && data.status.id !== 2 && !isChancery"
                :label="$t('faq.toAnswer')"
            ></Button>
            <Button
                type="button"
                icon="pi pi-send"
                v-if="isChancery"
                @click="openForward(data)"
                :label="$t('faq.forward')"
            ></Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <div class="card" v-if="userData.userType === 'student'">
      <DataTable :lazy="true" :value="data" :paginator="true" @page="onPage($event)" :totalRecords="total"
                 paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                 :rowsPerPageOptions="[10,25,50]"
                 :currentPageReportTemplate="$t('common.showingRecordsCount', {first: '{first}', last: '{last}', totalRecords: '{totalRecords}' })"
                 class="p-datatable-customers" :rows="10" dataKey="id" :rowHover="true" v-model:filters="filters"
                 filterDisplay="menu"
                 :loading="loading" responsiveLayout="scroll"
                 :globalFilterFields="['question','recipient','status', 'sendDate', 'createDate']"
                 @sort="onSort($event)">
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <h5 class="m-0">{{ $t('faq.title') }}</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"/>
              <InputText type="search" v-model="userData.searchText" :placeholder="$t('common.search')"
                         @keyup.enter="getData" @click="clearData"/>
              <Button icon="pi pi-search" class="ml-1" @click="getData"/>
            </span>
          </div>
        </template>
        <template #empty> {{ $t('common.noData') }}</template>
        <template #loading> {{ $t('faq.loading') }}</template>
        <Column
            field="content"
            :header="$t('faq.question')"
            sortable
            filterMatchMode="contains"
            style="min-width: 14rem"
        >
          <template #body="{data}">
            <router-link
                :to="{ name: 'FaqView', params: { id: data.id } }"
                tag="a"
            >{{ data.content }}
            </router-link
            >
          </template>
        </Column>
        <Column
            :field="
            $i18n.locale === 'kz'
              ? `category.nameKz`
              : $i18n.locale === 'ru'
              ? `category.nameRu`
              : `category.nameEn`
          "
            :header="$t('faq.recipient')"
            sortable
            style="min-width: 14rem"
        >
          <template #body="slotProps">
            {{
              $i18n.locale === "kz"
                  ? slotProps.data.category.nameKz
                  : $i18n.locale === "ru"
                      ? slotProps.data.category.nameRu
                      : slotProps.data.category.nameEn
            }}
          </template>
        </Column>
        <Column
            :header="$t('faq.status')"
            :field="
            $i18n.locale === 'kz'
              ? `status.nameKz`
              : $i18n.locale === 'ru'
              ? `status.nameRu`
              : `status.nameEn`
          "
            sortable
            filterMatchMode="contains"
            style="min-width: 14rem"
        >
          <template #body="slotProps">
            <span :class="'customer-badge status-' + slotProps.data.status.id">
              {{
                $i18n.locale === "kz"
                    ? slotProps.data.status.nameKz
                    : $i18n.locale === "ru"
                        ? slotProps.data.status.nameRu
                        : slotProps.data.status.nameEn
              }}
            </span>
          </template>
        </Column>
        <Column
            :header="$t('faq.sendDate')"
            field="sendDate"
            dataType="date"
            style="min-width: 10rem"
            sortable
        >
          <template #body="{ data }">
            {{ formatDate(data.sendDate) }}
          </template>
        </Column>
        <Column
            :header="$t('faq.createDate')"
            field="createdDate"
            dataType="date"
            style="min-width: 10rem"
            sortable
        >
          <template #body="{ data }">
            {{ formatDate(data.createdDate) }}
          </template>
        </Column>
        <Column :header="$t('faq.attachments')" field="createdDate" style="min-width: 10rem">
          <template #body="{ data }">
            <Button
                type="button"
                icon="pi pi-image"
                @click="downloadFile(data.image, 0)"
                class="p-button-rounded p-button-success mr-2"
                v-if="data.image != null"
            ></Button>
            <Button
                type="button"
                icon="pi pi-file"
                @click="downloadFile(data.filePath, 1)"
                class="p-button-rounded p-button-success"
                v-if="data.filePath != null"
            ></Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- ADD FAQ -->
    <Dialog
        v-model:visible="faqDialog"
        :style="{ width: '600px' }"
        :header="$t('faq.addFaq')"
        :modal="true"
        class="p-fluid"
    >
      <div class="field">
        <label for="dep" class="mb-3">{{ $t('faq.recipient') }}</label>
        <Dropdown
            id="dep"
            v-model="faq.departmentId"
            :options="departmentList"
            :optionLabel="
            $i18n.locale === 'kz'
              ? 'nameKz'
              : $i18n.locale === 'ru'
              ? 'nameRu'
              : 'nameEn'
          "
            optionValue="id"
            :placeholder="$t('faq.selectRecipient')"
        >
        </Dropdown>
      </div>

      <div class="field">
        <label for="content">{{ $t('faq.question') }}</label>
        <Textarea id="content" v-model="faq.content" rows="3" cols="20"/>
      </div>

      <div class="field">
        <FileUpload
            ref="form"
            mode="basic"
            :customUpload="true"
            @uploader="uploadImage($event)"
            :auto="true"
            :chooseLabel="$t('faq.uploadImage')"
            accept="image/*"
        ></FileUpload>
      </div>
      <div class="field">
        <FileUpload
            ref="form"
            mode="basic"
            :customUpload="true"
            @uploader="uploadFile($event)"
            :auto="true"
            :chooseLabel="$t('faq.uploadFile')"
        ></FileUpload>
      </div>
      <template #footer>
        <Button
            :label="$t('faq.addFaq')"
            icon="pi pi-check"
            class="p-button-rounded p-button-success mr-2"
            @click="saveFaq"
        />
        <Button
            :label="$t('common.cancel')"
            icon="pi pi-times"
            class="p-button-rounded p-button-danger"
            @click="hideDialog"
        />
      </template>
    </Dialog>


    <!-- ANSWER -->
    <Dialog
        v-model:visible="answerDialog"
        :style="{ width: '600px' }"
        :header="$t('faq.toAnswer')"
        :modal="true"
        class="p-fluid"
    >
      <div class="field">
        <label for="content"><b>{{ $t('faq.question') }}</b></label>
        <p id="content">{{ selectedFaq.content }}</p>
      </div>

      <div class="field" v-if="selectedFaq.image || selectedFaq.filepath">
        <label><b>{{ $t('faq.attachments') }}</b></label>
        <div>
          <Button
              icon="pi pi-image"
              iconPos="left"
              class="p-button-rounded p-button-success m-2"
              @click="downloadFile(selectedFaq.image, 0)"
          />
          <Button
              icon="pi pi-file"
              iconPos="left"
              class="p-button-rounded p-button-success m-2"
              v-if="selectedFaq.filePath != null"
              @click="downloadFile(selectedFaq.filePath, 1)"
          />
        </div>
      </div>
      <div class="field">
        <label for="faqAnswer"><b>{{ $t('faq.answer') }}</b></label>
        <Editor
            id="faqAnswer"
            v-model="faqAnswer.answer"
            editorStyle="height: 320px"
        />
      </div>
      <div class="field">
        <FileUpload
            id="uploadFileToAnswer"
            ref="form"
            mode="basic"
            :customUpload="true"
            @uploader="uploadFileToAnswer($event)"
            :auto="true"
            :chooseLabel="$t('faq.uploadFile')"
        ></FileUpload>
      </div>
      <template #footer>
        <Button
            :label="$t('faq.toAnswer')"
            icon="pi pi-check"
            class="p-button-rounded p-button-success mr-2"
            @click="addAnswer"
        />
        <Button
            :label="$t('common.cancel')"
            icon="pi pi-times"
            class="p-button-rounded p-button-danger"
            @click="hideDialog"
        />
      </template>
    </Dialog>

    <Dialog
        v-model:visible="faqViewDialog"
        :modal="true"
        class="p-fluid"
        :style="{ width: '500px' }"
    >
      <div class="field">
        <h2>{{ selectedFaq.content }}</h2>
      </div>
      <small class="field">
        {{ formatDate(selectedFaq.sendDate) }}
      </small>
      <small class="field">
        {{
          $i18n.locale === "kz"
              ? selectedFaq.category.nameKz
              : $i18n.locale === "ru"
                  ? selectedFaq.category.nameRu
                  : selectedFaq.category.nameEn
        }}
      </small>
      <div class="field">
        <label><b>{{ $t('faq.answer') }}:</b></label>
        <div v-if="selectedFaq.answer">
          <p v-html="selectedFaq.answer.answer"></p>
        </div>
        <div v-if="!selectedFaq.answer">{{ $t('faq.noAnswer') }}</div>
      </div>
      <div class="field" v-if="selectedFaq.image || selectedFaq.filepath">
        <label><b>{{ $t('faq.attachments') }}</b></label>
        <div>
          <Button
              :label="selectedFaq.image"
              icon="pi pi-image"
              iconPos="left"
              class="mb-2"
              @click="downloadFile(selectedFaq.image, 0)"
          />
          <Button
              :label="selectedFaq.filePath"
              icon="pi pi-file"
              iconPos="left"
              v-if="selectedFaq.filePath != null"
              @click="downloadFile(selectedFaq.filePath, 1)"
          />
        </div>
      </div>
      <template #footer>
        <!-- <Button
          :label="$t('common.save')"
          icon="pi pi-check"
          class="p-button-rounded p-button-success mr-2"
          @click="saveFaq"
        /> -->
        <Button
            :label="$t('common.cancel')"
            icon="pi pi-times"
            class="p-button-rounded p-button-danger"
            @click="hideDialog"
        />
      </template>
    </Dialog>

    <Dialog
        v-model:visible="forwardDialog"
        :header="$t('faq.forward')"
        :modal="true"
        class="p-fluid"
        :style="{ width: '550px' }"
    >
      <div class="field">
        {{ selectedFaq.content }}
      </div>
      <div class="field mt-3">
        <label for="forwardDep">{{ $t('faq.recipient') }}</label>
        <Dropdown id="forwardDep" v-model="selectedForwardDep" :options="forwardDepartmentList"
                  :optionLabel="$i18n.locale === 'kz' ? 'nameKz' : $i18n.locale === 'ru' ? 'nameRu' : 'nameEn'"
                  :placeholder="$t('faq.selectRecipient')"/>
      </div>
      <template #footer>
        <Button
            :label="$t('faq.forward')"
            icon="pi pi-check"
            class="p-button-rounded p-button-success mr-2"
            @click="forwardFaq"
        />
        <Button
            :label="$t('common.cancel')"
            icon="pi pi-times"
            class="p-button-rounded p-button-danger"
            @click="hideDialog"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import {FilterMatchMode, FilterOperator} from 'primevue/api';
import {getHeader, header, smartEnuApi} from "@/config/config";
import * as imageResizeCompress from "image-resize-compress"; // ES6
import { FaqService } from "../../service/faq.service";
import {UserService} from "@/service/user.service"

export default {
  data() {
    return {
      data: [],
      selectedData: null,
      filters: {
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'question': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'recipient': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'status': {value: null, matchMode: FilterMatchMode.EQUALS},
        'sendDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
        'createDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]}
      },
      loading: true,
      faq: {
        content: null,
        image: null,
        filePath: null,
        departmentId: null,
      },
      departmentList: [],
      forwardDepartmentList: [],
      faqDialog: false,
      faqViewDialog: false,
      selectedDepartment: null,
      statuses: {
        new: 1,
        inWork: 2,
        completed: 3,
        expired: 4,
      },
      imageFile: null,
      file: null,
      userData: {
        userType: null,
        departmentId: null,
        departmentName: null,
        page: 0,
        rows: 10,
        searchText: null,
        sortField: "",
        sortOrder: 0

      },
      selectedFaq: {
        content: null,
        image: null,
        filePath: null,
        departmentName: null,
      },
      departmentAccess: true,
      answerDialog: false,
      forwardDialog: false,
      faqAnswer: {
        answer: null,
        faqRequestId: null,
        filePath: null,
        userId: null,
      },
      answerFile: null,
      accessDepList: [
        "Центр обслуживания обучающихся",
        "Центр профориентации и тестирования",
        "Департамент по социальному и гражданскому развитию",
        "Офис-регистратор",
        "Департамент международного сотрудничества",
        "Отдел послевузовского образования",
        "Департамент информационных технологий",
        "Департамент науки и инновации",
        "Департамент коммерциализации технологий",
        "Аппарат",
        "Департамент финансов",
        "Научная библиотека",
        "Дирекция студенческих домов",
        "Департамент цифрового развития и дистанционного обучения",
        "Отдел документооборота и контроля",
        "Другое",
      ],
      isShowPersonal: false,
      userInfo: null,
      isChancery: false,
      selectedForwardDep: null,
      lazyParams: {
        page: 0,
        rows: 10,
        countMode: null,
      },
      total: 0,
      faqService: new FaqService(),
      userService: new UserService()
    };
  },
  created() {
    this.userInfo = JSON.parse(localStorage.getItem("loginedUser"));
    this.getUserType();
    this.getDepartmentList();
  },
  methods: {
    getData() {
      this.loading = true;
      this.faqService.getAllFaq(this.userData).then((response) => {
        this.data = response.data.items;
        this.total = response.data.total;
        this.loading = false;
      })
      .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
          this.loading = false;
      });
    },
    uploadFile(event) {
      this.file = event.files[0];
    },
    uploadImage(event) {
      this.imageFile = event.files[0];
      // const file = event.files[0];
      // imageResizeCompress
      //   .fromBlob(file, 90, 720, "auto", "jpeg")
      //   .then((res) => {
      //     imageResizeCompress.blobToURL(res).then((resp) => {
      //       this.faq.image = resp;
      //     });
      //   });
    },
    uploadFileToAnswer(event) {
      this.answerFile = event.files[0];
    },
    getDepartmentList() {
      this.faqService.getDepartmentList().then((response) => {
        this.departmentList = response.data;
        response.data.map(res => {
          if (res.nameRu !== 'Другое') {
            this.forwardDepartmentList.push(res)
          }
        })
      })
      .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
      });
    },
    createFaq() {
      this.faqDialog = true;
    },
    hideDialog() {
      this.faq = {};
      this.faqDialog = false;
      this.faqViewDialog = false;
      this.forwardDialog = false;
      this.answerDialog = false;
      //this.submitted = false;
    },
    saveFaq() {
      const fd = new FormData();
      fd.append("faqRequest", JSON.stringify(this.faq));
      fd.append("uploadedFile", this.file);
      fd.append("imageFile", this.imageFile);
      this.faqService.addFaqRequest(fd).then((response) => {
          this.hideDialog();
          this.getData();
        })
        .catch((error) => {
            console.log(error);
            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
          
        });
    },
    getUserType() {
      this.userService.getCurrentUserType().then((response) => {
          this.userData.userType = response.data.userType;
          this.userData.departmentId = response.data.departmentId;
          this.userData.departmentName = response.data.departmentName;
          this.userData.userId = response.data.userId;
          this.faq.userId = response.data.userId;
          this.isShowPersonal = this.accessDepList.some(function (field) {
            return field === response.data.departmentName;
          });
          this.isChancery = response.data.departmentName === 'Отдел документооборота и контроля';
          this.getData();
        })
        .catch((error) => { 
            console.log(error);
        });
    },
    downloadFile(fileName, fileType) {
      const req = {
        filename: fileName, fileType: fileType
      }
      this.faqService.downloadFile(req).then((response) => {
          // const blob = new Blob([response.data], )
          const link = document.createElement("a");
          link.href = "data:application/octet-stream;base64," + response.data;
          link.setAttribute("download", fileName);
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          this.$toast.add({
            severity: "error",
            summary: "downloadFileError:\n" + error,
            life: 3000,
          });
        });
    },
    addAnswer() {
      this.faqAnswer.faqRequestId = this.selectedFaq.id;
      this.faqAnswer.userId = this.userData.userId;
      const fd = new FormData();
      fd.append("faqAnswer", JSON.stringify(this.faqAnswer));
      fd.append("uploadedFile", this.answerFile);
      this.faqService.addAnswer(fd).then((response) => {
          this.answerDialog = false;
          this.getData();
        })
        .catch((error) => {

            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
        });
    },
    forwardFaq() {
      const req = {
        faqId: this.selectedFaq.id,
        departmentId: this.selectedForwardDep.id
      }
      this.faqService.forwardFaq(req).then(response => {
        if (response.data.isSuccess === true) {
          this.forwardDialog = false;
          this.getData();
          this.$toast.add({severity: 'success', detail: 'Успешно', life: 3000});
        }
      }).catch(error => {
        console.log(error)
      });
    },
    clearData() {
      if (!this.userData.searchText) {
        return;
      }
      this.userData.searchText = "";
      this.getData();
    },
    onSort(event) {
      this.userData.sortField = event.sortField;
      this.userData.sortOrder = event.sortOrder;
      this.getData();
    },
    onPage(event) {
      this.userData.page = event.page
      this.userData.rows = event.rows
      this.getData();
    },
    openAnswerFaq(data) {
      (data);
      this.selectedFaq = data;
      this.answerDialog = true;
    },
    openForward(data) {
      this.selectedFaq = data;
      this.forwardDialog = true;
    },
    openFaq(selected) {
      (selected);
      this.$router.push({name: "FaqView", params: {id: selected.id}});
      //this.selectedFaq = selected;
      //this.faqViewDialog = true;
    },
    formatDate(value) {
      var result = "";
      if (value == null) {
        return result;
      }
      var date = new Date(value);
      result = date.toLocaleDateString("kk-KZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return result == "Invalid Date" ? "" : result;
    },
    async convertBase64(document) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(document);
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = (error) => reject(error);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-2 {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-3 {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-4 {
    background: #eccfff;
    color: #694382;
  }
}
</style>
