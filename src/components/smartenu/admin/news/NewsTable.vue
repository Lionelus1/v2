<template>
  <div class="card">
    <!-- BEGINNING OF TOOLBAR -->

    <Toolbar class="p-mb-4">
      <template #left>
        <Button
            :label="$t('common.add')"
            icon="pi pi-plus"
            class="p-button-success p-mr-2"
            v-on:click="createNews"
        />
        <Button
            :label="$t('common.send')"
            v-if="
            selectedNews &&
            selectedNews.history.status.id === statuses.created &&
            (!isModer || !isPublisher || !isAdmin)
          "
            icon="pi pi-send"
            class="p-mr-2"
            v-on:click="sendNews"
        />
        <Button
            :label="$t('common.publish')"
            v-if="
            selectedNews &&
            (selectedNews.history.status.id === statuses.sent ||
              selectedNews.history.status.id === statuses.created) &&
            (isModer || isPublisher || isAdmin)
          "
            icon="pi pi-check"
            class="p-button-help p-mr-2"
            v-on:click="publishNews"
        />
        <Button
            :label="$t('common.reject')"
            v-if="
            selectedNews &&
            selectedNews.history.status.id === statuses.sent &&
            (isModer || isPublisher || isAdmin)
          "
            icon="pi pi-check"
            class="p-button-danger p-mr-2"
            v-on:click="rejectReason"
        />
        <Button
            :label="$t('common.show')"
            v-if="selectedNews"
            icon="pi pi-eye"
            class="p-button-secondary p-mr-2"
            v-on:click="newsView"
        />
      </template>
    </Toolbar>

    <!-- BEGINNING OF TABLE -->

    <DataTable
        :lazy="true"
        :value="allNews"
        @page="onPage($event)"
        :totalRecords="newsCount"
        :paginator="true"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 25, 50]"
        :currentPageReportTemplate="$t('common.showingRecordsCount', {
              first: '{first}',
              last: '{last}',
              totalRecords: '{totalRecords}',
            })"
        class="p-datatable-customers"
        :rows="10"
        dataKey="id"
        :rowHover="true"
        v-model:selection="selectedNews"
        :filters="filters"
        filterDisplay="menu"
        :showFilterMatchModes="false"
        :loading="loading"
        responsiveLayout="scroll"
        @sort="onSort($event)">
      <template #header>
        <div class="table-header">
          {{ $t("smartenu.newsTitle") }}
          <span class="p-input-icon-left">
            <i class="pi pi-search"/>
            <InputText type="search" v-model="lazyParams.searchText" :placeholder="$t('common.search')"
                       @keyup.enter="getAllNews" @click="clearData"/>
              <Button icon="pi pi-search" class="p-ml-1" @click="getAllNews"/>
          </span>
        </div>
      </template>
      <template #empty>
        {{ $t("smartenu.newsNotFound") }}
      </template>
      <template #loading>
        {{ $t("smartenu.loadingNews") }}
      </template>
      <Column selectionMode="single" headerStyle="width: 3em"></Column>
      <Column
          :field="
          $i18n.locale === 'kz'
            ? `titleKz`
            : $i18n.locale === 'ru'
            ? `titleRu`
            : `titleEn`
        "
          v-bind:header="$t('common.nameIn')"
          :sortable="true"
      >
        <template #body="slotProps">
          <span>
            {{
              $i18n.locale === "kz"
                  ? slotProps.data.titleKz
                  : $i18n.locale === "ru"
                      ? slotProps.data.titleRu
                      : slotProps.data.titleEn
            }}
          </span>
        </template>
      </Column>
      <Column
          :field="
          $i18n.locale === 'kz'
            ? `history.status.nameKz`
            : $i18n.locale === 'ru'
            ? `history.status.nameRu`
            : `history.status.nameEn`
        "
          v-bind:header="$t('common.status')"
          :sortable="true"
      >
        <template #body="slotProps">
          <span
              :class="'customer-badge status-' + slotProps.data.history.status.id"
          >
            {{
              $i18n.locale === "kz"
                  ? slotProps.data.history.status.nameKz
                  : $i18n.locale === "ru"
                      ? slotProps.data.history.status.nameRu
                      : slotProps.data.history.status.nameEn
            }}
          </span>
        </template>
      </Column>
      <Column
          field="categories"
          v-bind:header="$t('smartenu.categories')"
          :sortable="false"
      >
        <template #body="slotProps">
          <span>
            {{
              slotProps.data.categories
                  .map((cat) => cat.nameKz)
                  .toString()
                  .replaceAll(",", ", ")
            }}
          </span>
        </template>
      </Column>
      <Column
          field="createdBy"
          v-bind:header="$t('common.createdBy')"
          :sortable="true"
      >
        <template #body="slotProps">
          <span>
            {{ slotProps.data.createdBy.name }}
          </span>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-success p-mr-2"
              @click="editNews(slotProps.data.id)"
              v-if="
              slotProps.data.history.status.id === statuses.created ||
              isAdmin ||
              isModer
            "
          />
          <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-warning"
              v-if="
              slotProps.data.history.status.id === statuses.created || isAdmin
            "
              @click="delNews(slotProps.data.id)"
          />
        </template>
      </Column>
    </DataTable>

    <!--    BEGINNING OF ADD/EDIT DIALOG-->

    <Dialog
        v-model:visible="editVisible"
        :style="{ width: '1000px' }"
        :header="$t('smartenu.createOrEditNews')"
        :modal="true"
        class="p-fluid"
    >
      <div class="card">
        <Message v-for="msg of formValid" severity="error" :key="msg">{{
            msg
          }}
        </Message>
        <TabView>
          <TabPanel header="Қазақша">
            <div class="p-field p-mt-3" style="margin-bottom: 1.5rem">
              <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
              <InputText
                  id="kz-title"
                  v-model="newsData.titleKz"
                  rows="3"
                  :class="{ 'p-invalid': formValid.titleKz && submitted }"
              />
              <small v-show="formValid.titleKz && submitted" class="p-error">{{
                  $t("smartenu.titleKzInvalid")
                }}</small>
            </div>
            <div class="p-field">
              <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
              <Editor
                  id="kz-content"
                  v-model="newsData.contentKz"
                  editorStyle="height: 320px"
              />
              <small
                  v-show="formValid.contentKz && submitted"
                  class="p-error"
              >{{ $t("smartenu.contentKzInvalid") }}</small
              >
            </div>
          </TabPanel>
          <TabPanel header="Русский">
            <div class="p-field p-mt-3" style="margin-bottom: 1.5rem">
              <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
              <InputText
                  id="ru-title"
                  v-model="newsData.titleRu"
                  rows="3"
                  :class="{ 'p-invalid': formValid.titleRu && submitted }"
              />
              <small v-show="formValid.titleRu && submitted" class="p-error">{{
                  $t("smartenu.titleRuInvalid")
                }}</small>
            </div>
            <div class="p-field">
              <label for="ru-content">{{
                  $t("common.contentInRussian")
                }}</label>
              <Editor
                  id="ru-content"
                  v-model="newsData.contentRu"
                  editorStyle="height: 320px"
              />
              <small
                  v-show="formValid.contentRu && submitted"
                  class="p-error"
              >{{ $t("smartenu.contentRuInvalid") }}</small
              >
            </div>
          </TabPanel>
          <TabPanel header="English">
            <div class="p-field p-mt-3" style="margin-bottom: 1.5rem">
              <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
              <InputText
                  id="en-title"
                  v-model="newsData.titleEn"
                  rows="3"
                  :class="{ 'p-invalid': formValid.titleEn && submitted }"
              />
              <small v-show="formValid.titleEn && submitted" class="p-error">{{
                  $t("smartenu.titleEnInvalid")
                }}</small>
            </div>

            <div class="p-field">
              <label for="en-content">{{
                  $t("common.contentInEnglish")
                }}</label>
              <Editor
                  id="en-content"
                  v-model="newsData.contentEn"
                  editorStyle="height: 320px"
              />
              <small
                  v-show="formValid.contentEn && submitted"
                  class="p-error"
              >{{ $t("smartenu.contentEnInvalid") }}</small
              >
            </div>
          </TabPanel>
        </TabView>
        <!-- <label for="cat-tree">{{ $t('smartenu.selectCategories') }}</label> -->
        <!-- <Tree :value="catTree.root" selectionMode="checkbox" v-model:selectionKeys="selectedCatTree" style="margin-bottom: 1.5rem" /> -->
        <TreeSelect
            v-model="selectedCatTree"
            :options="catTree.root"
            selectionMode="checkbox"
            :placeholder="$t('smartenu.selectCategories')"
            class="p-mb-3"
        />
        <div class="p-fluid p-formgrid p-grid">
          <div class="p-field p-col">
            <FileUpload
                ref="form"
                mode="basic"
                :customUpload="true"
                @uploader="uploadImage1($event)"
                :auto="true"
                v-bind:chooseLabel="$t('smartenu.chooseImage1')"
            ></FileUpload>
            <div v-if="newsData.image1" class="p-mt-3">
              <img :src="newsData.image1" style="width: 50%; height: 50%"/>
            </div>
          </div>
          <!-- <div class="p-field p-col">
                    <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadImage2($event)" :auto="true" v-bind:chooseLabel="$t('smartenu.chooseImage2')"></FileUpload>
                    <div v-if="newsData.image2" class="p-mt-3">
                        <img :src="newsData.image2" style="width: 50%; height: 50%;" />
                    </div>
                </div> -->
        </div>
        <div class="p-field-checkbox">
          <Checkbox
              id="isPoster"
              name="isPoster"
              v-model="isPoster"
              :binary="true"
          />
          <label for="isPoster">{{ $t("smartenu.addPoster") }}</label>
        </div>
        <div
            class="p-field p-mt-3"
            style="margin-bottom: 1.5rem"
            v-if="isPoster"
        >
          <label for="poster-link">{{ $t("smartenu.posterLink") }}</label>
          <InputText
              id="poster-link"
              v-model="poster.link"
              rows="3"
              :placeholder="$t('smartenu.posterLink')"
          />
          <div class="p-grid p-mt-3" v-if="isPoster">
            <div class="p-col">
              <FileUpload
                  ref="form"
                  mode="basic"
                  :customUpload="true"
                  @uploader="uploadPosterImageKk($event)"
                  :auto="true"
                  v-bind:chooseLabel="$t('smartenu.posterImageKk')"
              ></FileUpload>
              <div v-if="poster.imageKk" class="p-mt-3">
                <img :src="poster.imageKk" style="width: 50%; height: 50%"/>
              </div>
            </div>
            <div class="p-col">
              <FileUpload
                  ref="form"
                  mode="basic"
                  :customUpload="true"
                  @uploader="uploadPosterImageRu($event)"
                  :auto="true"
                  v-bind:chooseLabel="$t('smartenu.posterImageRu')"
              ></FileUpload>
              <div v-if="poster.imageRu" class="p-mt-3">
                <img :src="poster.imageRu" style="width: 50%; height: 50%"/>
              </div>
            </div>
            <div class="p-col">
              <FileUpload
                  ref="form"
                  mode="basic"
                  :customUpload="true"
                  @uploader="uploadPosterImageEn($event)"
                  :auto="true"
                  v-bind:chooseLabel="$t('smartenu.posterImageEn')"
              ></FileUpload>
              <div v-if="poster.imageEn" class="p-mt-3">
                <img :src="poster.imageEn" style="width: 50%; height: 50%"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
            v-bind:label="$t('common.save')"
            icon="pi pi-check"
            class="p-button p-component p-button-success p-mr-2"
            v-on:click="addNews"
        />
        <Button
            v-bind:label="$t('common.cancel')"
            icon="pi pi-times"
            class="p-button p-component p-button-danger"
            @click="hideDialog"
        />
      </template>
    </Dialog>

    <!--    BEGINNING OF REJECT DIALOG-->

    <Dialog
        v-model:visible="rejectVisible"
        :style="{ width: '600px' }"
        :header="$t('smartenu.createOrEditNews')"
        :modal="true"
        class="p-fluid"
    >
      <div class="card">
        <div class="p-field p-mt-3" style="margin-bottom: 1.5rem">
          <span class="p-float-label">
            <InputText
                id="kz-title"
                v-model="selectedNews.history.rejectReasonKz"
                rows="3"
            />
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
          </span>
        </div>
        <div class="p-field p-mt-3" style="margin-bottom: 1.5rem">
          <span class="p-float-label">
            <InputText
                id="ru-title"
                v-model="selectedNews.history.rejectReasonRu"
                rows="3"
            />
            <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
          </span>
        </div>
        <div class="p-field p-mt-3">
          <span class="p-float-label">
            <InputText
                id="en-title"
                v-model="selectedNews.history.rejectReasonEn"
                rows="3"
            />
            <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
          </span>
        </div>
      </div>
      <template #footer>
        <Button
            v-bind:label="$t('common.save')"
            icon="pi pi-check"
            class="p-button-text"
            v-on:click="rejectNews"
        />
        <Button
            v-bind:label="$t('common.cancel')"
            icon="pi pi-times"
            class="p-button-text"
            @click="rejectVisible = false"
        />
      </template>
    </Dialog>

    <!--    BEGINNING OF DELETE DIALOG-->

    <Dialog
        v-model:visible="deleteVisible"
        :style="{ width: '450px' }"
        :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
        <span v-if="newsData"
        >{{ $t("common.doYouWantDelete") }}
          <b>{{
              $i18n.locale === "kz"
                  ? newsData.titleKz
                  : $i18n.locale === "ru"
                      ? newsData.titleRu
                      : newsData.titleEn
            }}</b
          >?
        </span>
      </div>
      <template #footer>
        <Button
            :label="$t('common.yes')"
            icon="pi pi-check"
            class="p-button p-component p-button-success p-mr-2"
            @click="deleteNews(newsData.id)"
        />
        <Button
            :label="$t('common.no')"
            icon="pi pi-times"
            class="p-button p-component p-button-danger p-mr-2"
            @click="deleteVisible = false"
        />
      </template>
    </Dialog>

    <!--    BEGINNING OF VIEW DIALOG-->

    <Dialog
        v-model:visible="newsViewVisible"
        :style="{ width: '1000px' }"
        :modal="true"
        class="p-fluid"
    >
      <Card style="box-shadow: none">
        <template #header>
          <InlineMessage
              severity="error"
              show
              v-if="selectedNews.history.status.id === statuses.rejected"
              style="margin-bottom: 1.5rem"
          >
            {{
              $t("smartenu.rejectReason", {
                fn:
                    $i18n.locale === "kz"
                        ? selectedNews.history.rejectReasonKz
                        : $i18n.locale === "ru"
                            ? selectedNews.history.rejectReasonRu
                            : selectedNews.history.rejectReasonEn,
              })
            }}
          </InlineMessage>
          <div style="padding: 0 100px">
            <img :src="selectedNews.image1" style="width: 100%; height: 100%"/>
          </div>
        </template>
        <template #title>
          {{
            $i18n.locale === "kz"
                ? selectedNews.titleKz
                : $i18n.locale === "ru"
                    ? selectedNews.titleRu
                    : selectedNews.titleEn
          }}
        </template>
        <template #subtitle>
          {{ new Date(selectedNews.history.modifyDate).toLocaleString() }}
        </template>
        <template #content>
          <div
              v-html="
              $i18n.locale === 'kz'
                ? selectedNews.contentKz
                : $i18n.locale === 'ru'
                ? selectedNews.contentRu
                : selectedNews.contentEn
            "
          ></div>
        </template>
        <template #footer>
          <div style="padding: 0 100px">
            <img :src="selectedNews.image2" style="width: 100%; height: 100%"/>
          </div>
        </template>
      </Card>
      <template #footer>
        <Button
            v-bind:label="$t('common.close')"
            icon="pi pi-times"
            class="p-button p-component p-button-primary"
            @click="newsViewVisible = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import axios from "axios";
import * as imageResizeCompress from "image-resize-compress"; // ES6
import {FilterMatchMode, FilterOperator} from "primevue/api";
import {getHeader, header, smartEnuApi} from "@/config/config";

export default {
  name: "NewsTable",
  data() {
    return {
      lazyParams: {
        page: 0,
        rows: 10,
        searchText: null,
        sortField: "",
        sortOrder: 0
      },
      statuses: {
        created: 1,
        sent: 2,
        published: 3,
        rejected: 4,
      },
      editVisible: false,
      deleteVisible: false,
      rejectVisible: false,
      newsViewVisible: false,
      submitted: false,
      categories: null,
      newsData: null,
      allNews: [],
      newsCount: 200,
      selectedNews: null,
      filters: {
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'question': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'recipient': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'status': {value: null, matchMode: FilterMatchMode.EQUALS},
        'sendDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]},
        'createDate': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]}
      },
      loading: true,
      catTree: {
        root: [],
      },
      catTreeElementsList: [],
      selectedCatTree: null,
      contentImage1: null,
      contentImage2: null,
      userRoles: null,
      roles: {
        isAdmin: false,
        isModer: false,
        isPublisher: false,
        isUser: true,
        isStudent: false,
      },
      formValid: [],
      isPoster: false,
      poster: {
        link: "",
        imageKk: "",
        imageRu: "",
        imageEn: "",
      },
    };
  },
  methods: {
    clearData() {
      if (!this.lazyParams.searchText) {
        return;
      }
      this.lazyParams.searchText = "";
      this.getAllNews();
    },
    onSort(event) {
      console.log(event)
      this.lazyParams.sortField = event.sortField;
      this.lazyParams.sortOrder = event.sortOrder;
      this.getAllNews();
    },
    onPage(event) {
      this.lazyParams.page = event.page
      this.lazyParams.rows = event.rows
      this.getAllNews();
    },

    /**
     *  UPLOAD POSTER IMAGEKK
     */
    uploadPosterImageKk(event) {
      const file = event.files[0];
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.poster.imageKk = resp;
            });
          });
    },
    /**
     *  UPLOAD POSTER IMAGERU
     */
    uploadPosterImageRu(event) {
      const file = event.files[0];
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.poster.imageRu = resp;
            });
          });
    },
    /**
     *  UPLOAD POSTER IMAGEEN
     */
    uploadPosterImageEn(event) {
      const file = event.files[0];
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.poster.imageEn = resp;
            });
          });
    },
    /**
     *  UPLOAD IMAGE1
     */
    uploadImage1(event) {
      const file = event.files[0];
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.newsData.image1 = resp;
            });
          });
    },

    /**
     *  UPLOAD IMAGE2
     */
    uploadImage2(event) {
      const file = event.files[0];
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.newsData.image2 = resp;
            });
          });
    },

    /**
     *  CONVERT IMAGE TO BASE64
     */
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

    /**
     *  GET ALL CATEGORIES
     */

    getCategories() {
      this.categories = [];
      axios
          .get(smartEnuApi + "/allCategories", {
            headers: getHeader(),
          })
          .then((response) => {
            this.categories = response.data;
            this.categories = this.categories.reverse();
            this.loading = false;
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary:
                    this.$t("smartenu.loadAllCategoriesError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },

    /**
     *  GET ALL NEWS
     */
    getAllNews() {
      this.loading = true
      // this.allNews = [];
      this.lazyParams.countMode = null;
      axios
          .post(smartEnuApi + "/allNews", this.lazyParams, {
            headers: getHeader(),
          })
          .then((response) => {
            this.allNews = response.data.news;
            this.newsCount = response.data.total;
            this.loading = false;
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.loadAllNewsError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },

    /**
     *  DELETE NEWS
     */
    deleteNews(id) {
      axios
          .post(
              smartEnuApi + "/delNews",
              {
                id: id,
              },
              {
                headers: getHeader(),
              }
          )
          .then((response) => {
            if (response.status === 200) {
              this.getAllNews();
            }
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.delNewsError") + ":\n" + error,
                life: 3000,
              });
            }
          });
      this.deleteVisible = false;
      this.newsData = {};
    },

    /**
     *  ADD NEWS
     */
    addNews() {
      this.submitted = true;
      this.validateNews();
      if (this.formValid.length > 0) {
        return;
      }
      for (let key in this.catTreeElementsList) {
        for (let ixd in this.selectedCatTree) {
          if (this.catTreeElementsList[key].key.toString() === ixd) {
            this.newsData.contentCategoryRelations.push({
              id: 0,
              contentId: 0,
              categoryId: this.catTreeElementsList[key].data.id,
              checked: this.selectedCatTree[ixd].checked,
              partialChecked: this.selectedCatTree[ixd].partialChecked,
            });
          }
        }
      }
      if (this.isPoster) {
        this.validPosterImages();
        if (this.formValid.length > 0) {
          return;
        }
        axios
            .post(smartEnuApi + "/addPoster", this.poster, {
              headers: getHeader(),
            })
            .then((res) => {
              this.newsData.posterId = res.data.id;
              this.newsData.isPoster = this.isPoster;
              this.insertNews();
            });
      } else {
        this.insertNews();
      }
    },
    insertNews() {
      console.log(this.newsData);
      axios
          .post(smartEnuApi + "/addNews", this.newsData, {
            headers: getHeader(),
          })
          .then((response) => {
            if (response.data !== null) {
              this.$toast.add({
                severity: "success",
                summary: this.$t("smartenu.saveSuccess"),
                life: 3000,
              });
              this.getAllNews();
              this.editVisible = false;
              this.newsData = {};
              this.selectedCatTree = null;
            }
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.saveNewsError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },
    /**
     *  CREATE NEWS
     */
    createNews() {
      this.catTreeElementsList = [];
      this.catTree.root = this.createCatTree(null, null);
      this.newsData = {};
      this.editVisible = true;
      this.submitted = false;
      this.newsData.id = null;
      this.newsData.contentCategoryRelations = [];
      this.selectedCatTree = [];
    },

    /**
     *  NEWS PRE DELETE
     */
    delNews(id) {
      this.newsData = {};
      this.newsData = this.allNews.find((x) => x.id === id);
      this.deleteVisible = true;
    },

    /**
     *  NEWS PRE EDITING
     */
    editNews(id) {
      ``;
      this.catTreeElementsList = [];
      this.catTree.root = this.createCatTree(null, null);
      this.newsData = {};
      this.editVisible = true;
      this.submitted = false;
      let newsData = this.allNews.find((x) => x.id === id);
      console.log(newsData);
      this.newsData.id = newsData.id;
      this.newsData.titleKz = newsData.titleKz;
      this.newsData.titleRu = newsData.titleRu;
      this.newsData.titleEn = newsData.titleEn;
      this.newsData.image1 = newsData.image1;
      this.newsData.image2 = newsData.image2;
      this.newsData.contentKz = newsData.contentKz;
      this.newsData.contentRu = newsData.contentRu;
      this.newsData.contentEn = newsData.contentEn;
      this.newsData.history = newsData.history;
      this.newsData.createdBy = newsData.createdBy;
      this.isPoster = newsData.isPoster;
      this.poster.id = newsData.posterId;
      this.poster.link = newsData.poster.link;
      this.poster.imageKk = newsData.poster.posterKk;
      this.poster.imageRu = newsData.poster.posterRu;
      this.poster.imageEn = newsData.poster.posterEn;
      this.selectedCatTree = [];
      this.newsData.contentCategoryRelations = [];
      for (let key in this.catTreeElementsList) {
        for (let ixd in newsData.contentCategoryRelations) {
          if (
              this.catTreeElementsList[key].data.id ===
              newsData.contentCategoryRelations[ixd].categoryId
          ) {
            this.selectedCatTree[this.catTreeElementsList[key].key] = {
              checked: newsData.contentCategoryRelations[ixd].checked,
              partialChecked:
              newsData.contentCategoryRelations[ixd].partialChecked,
            };
          }
        }
      }
    },

    /**
     * HIDE ADD EDIT DIALOG
     */
    hideDialog() {
      this.newsData = {};
      this.editVisible = false;
      this.submitted = false;
      this.catTree.root = [];
      this.catTreeElementsList = [];
      this.selectedCatTree = null;
    },

    /**
     * ADD REJECT REASON VISIBILITY
     */
    rejectReason() {
      this.rejectVisible = true;
    },

    /**
     * VIEW NEWS DIALOG VISIBILITY
     */
    newsView() {
      this.newsViewVisible = true;
    },

    /**
     * SEND NEWS TO MODERATOR ACTION
     */
    sendNews() {
      axios
          .post(
              smartEnuApi + "/send",
              {
                id: this.selectedNews.id,
                userId: this.selectedNews.history.userId,
              },
              {
                headers: getHeader(),
              }
          )
          .then((response) => {
            if (response.data !== null) {
              this.$toast.add({
                severity: "success",
                summary: this.$t("smartenu.saveSuccess"),
                life: 3000,
              });
              this.getAllNews();
            }
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.saveNewsError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },

    /**
     * PUBLSIH NEWS ACTION
     */
    publishNews() {
      axios
          .post(
              smartEnuApi + "/publish",
              {
                id: this.selectedNews.id,
                userId: this.selectedNews.history.userId,
              },
              {
                headers: getHeader(),
              }
          )
          .then((response) => {
            if (response.data !== null) {
              this.$toast.add({
                severity: "success",
                summary: this.$t("smartenu.saveSuccess"),
                life: 3000,
              });
              this.getAllNews();
            }
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.saveNewsError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },

    /**
     * REJECT NEWS ACTION
     */
    rejectNews() {
      axios
          .post(
              smartEnuApi + "/reject",
              {
                id: this.selectedNews.id,
                userId: this.selectedNews.history.userId,
                rejectReasonKz: this.selectedNews.history.rejectReasonKz,
                rejectReasonRu: this.selectedNews.history.rejectReasonRu,
                rejectReasonEn: this.selectedNews.history.rejectReasonEn,
              },
              {
                headers: getHeader(),
              }
          )
          .then((response) => {
            if (response.data !== null) {
              this.$toast.add({
                severity: "success",
                summary: this.$t("smartenu.saveSuccess"),
                life: 3000,
              });
              this.rejectVisible = false;
              this.getAllNews();
            }
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.saveNewsError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },

    /**
     * CREATE CATEGORIES TREE RECURSION FUNCTION
     * @param id
     * @param key
     * @returns {[]}
     */
    createCatTree: function (id, key) {
      let array = [];
      let grandparents = this.categories.filter(
          (category) => category.parentId === id
      );
      for (let i = 0; i < grandparents.length; i++) {
        this.catTreeElementsList.push({
          key: key + i,
          data: grandparents[i],
        });
        array.push({
          key: key + i,
          label:
              this.$i18n.locale === "kz"
                  ? grandparents[i].nameKz
                  : this.$i18n.locale === "ru"
                      ? grandparents[i].nameRu
                      : grandparents[i].nameEn,
          data: grandparents[i],
          children: this.createCatTree(grandparents[i].id, key + i + "-"),
        });
      }
      return array;
    },
    getRoles() {
      this.userRoles = [];
      axios
          .get(smartEnuApi + "/getroles", {
            headers: getHeader(),
          })
          .then((response) => {
            this.userRoles = response.data;
            this.roles.isAdmin = this.findRole(this.userRoles, "ADMINISTRATOR");
            this.roles.isPublisher = this.findRole(this.userRoles, "PUBLISHER");
            this.roles.isStudent = this.findRole(this.userRoles, "STUDENT");
            this.roles.isModer = this.findRole(this.userRoles, "MODERATOR");
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: this.$t("smartenu.loadAllEventsError") + ":\n" + error,
                life: 3000,
              });
            }
          });
    },
    findRole(roles, code) {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].roleCode === code) {
          return true;
        }
      }
      return false;
    },
    validateNews() {
      this.formValid = [];
      if (!this.newsData.titleKz) {
        this.formValid["titleKz"] = true;
      } else {
        delete this.formValid["titleKz"];
      }
      if (!this.newsData.titleRu) {
        this.formValid["titleRu"] = true;
      } else {
        delete this.formValid["titleRu"];
      }
      if (!this.newsData.titleEn) {
        this.formValid["titleEn"] = true;
      } else {
        delete this.formValid["titleEn"];
      }
      if (!this.newsData.contentKz) {
        this.formValid["contentKz"] = true;
      } else {
        delete this.formValid["contentKz"];
      }
      if (!this.newsData.contentRu) {
        this.formValid["contentRu"] = true;
      } else {
        delete this.formValid["contentRu"];
      }
      if (!this.newsData.contentEn) {
        this.formValid["contentEn"] = true;
      } else {
        delete this.formValid["contentEn"];
      }
      if (!this.newsData.image1) {
        this.formValid.push(this.$t("smartenu.image1Invalid"));
      }
      if (this.selectedCatTree.length == 0) {
        this.formValid.push(this.$t("smartenu.selectedCatInvalid"));
      }
    },
    validPosterImages() {
      if (!this.poster.imageKk) {
        this.formValid.push(this.$t("smartenu.posterImageKkInvalid"));
      }
      if (!this.poster.imageRu) {
        this.formValid.push(this.$t("smartenu.posterImageRuInvalid"));
      }
      if (!this.poster.imageEn) {
        this.formValid.push(this.$t("smartenu.posterImageEnInvalid"));
      }
    },
  },

  created() {
    this.getAllNews();
    this.getCategories();
    this.getRoles();
  },

  computed: {
    isAdmin: function () {
      return this.roles.isAdmin;
    },
    isModer: function () {
      return this.roles.isModer;
    },
    isPublisher: function () {
      return this.roles.isPublisher;
    },
    isStudent: function () {
      return this.roles.isStudent;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep(.p-progressbar) {
  height: 0.5rem;
  background-color: #d8dadc;

  .p-progressbar-value {
    background-color: #607d8b;
  }
}

.p-datatable .p-column-filter {
  display: none;
}

.table-header {
  display: flex;
  justify-content: space-between;
}

::v-deep(.p-datatable.p-datatable-customers) {
  .p-datatable-header {
    padding: 1rem;
    text-align: left;
    font-size: 1.5rem;
  }

  .p-paginator {
    padding: 1rem;
  }

  .p-datatable-thead > tr > th {
    text-align: left;
  }

  .p-datatable-tbody > tr > td {
    cursor: auto;
  }

  .p-dropdown-label:not(.p-placeholder) {
    text-transform: uppercase;
  }
}

/* Responsive */
.p-datatable-customers .p-datatable-tbody > tr > td .p-column-title {
  display: none;
}

.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-3 {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-4 {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-negotiation {
    background: #feedaf;
    color: #8a5340;
  }

  &.status-1 {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-2 {
    background: #eccfff;
    color: #694382;
  }

  &.status-proposal {
    background: #ffd8b2;
    color: #805b36;
  }
}

.p-progressbar-value.ui-widget-header {
  background: #607d8b;
}

@media (max-width: 640px) {
  .p-progressbar {
    margin-top: 0.5rem;
  }
}

.product-image {
  width: 100px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.orders-subtable {
  padding: 1rem;
}

.product-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-instock {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-outofstock {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-lowstock {
    background: #feedaf;
    color: #8a5340;
  }
}

.order-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.order-delivered {
    background: #c8e6c9;
    color: #256029;
  }

  &.order-cancelled {
    background: #ffcdd2;
    color: #c63737;
  }

  &.order-pending {
    background: #feedaf;
    color: #8a5340;
  }

  &.order-returned {
    background: #eccfff;
    color: #694382;
  }
}

@media screen and (max-width: 960px) {
  ::v-deep(.p-datatable) {
    &.p-datatable-customers {
      .p-datatable-thead > tr > th,
      .p-datatable-tfoot > tr > td {
        display: none !important;
      }

      .p-datatable-tbody > tr {
        > td {
          text-align: left;
          display: block;
          border: 0 none !important;
          width: 100% !important;
          float: left;
          clear: left;
          border: 0 none;

          .p-column-title {
            padding: 0.4rem;
            min-width: 30%;
            display: inline-block;
            margin: -0.4rem 1rem -0.4rem -0.4rem;
            font-weight: bold;
          }

          .p-progressbar {
            margin-top: 0.5rem;
          }
        }
      }
    }
  }
}
</style>
