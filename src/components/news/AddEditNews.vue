<template>
  <Dialog v-if="newsData && editVisible" v-model:visible="editVisible" :style="{ width: '1000px' }" :header="$t('smartenu.createOrEditNews')"
          :modal="true" class="p-fluid">
    <div class="card">
      <Message v-for="msg of formValid" severity="error" :key="msg">{{ msg }}</Message>
      <TabView>
        <TabPanel header="Қазақша">
          <div class="p-field p-mt-3">
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
            <InputText id="kz-title" v-model="newsData.titleKz" rows="3"
                       :class="{ 'p-invalid': formValid.titleKz && submitted }"/>
            <small v-show="formValid.titleKz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
          </div>
          <div class="p-field">
            <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
            <Editor id="kz-content" v-model="newsData.contentKz" editorStyle="height: 320px"/>
            <small v-show="formValid.contentKz && submitted" class="p-error">{{
                $t("smartenu.contentKzInvalid")
              }}</small>
          </div>
        </TabPanel>
        <TabPanel header="Русский">
          <div class="p-field p-mt-3">
            <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
            <InputText id="ru-title" v-model="newsData.titleRu"
                       rows="3" :class="{ 'p-invalid': formValid.titleRu && submitted }"/>
            <small v-show="formValid.titleRu && submitted" class="p-error">{{ $t("smartenu.titleRuInvalid") }}</small>
          </div>
          <div class="p-field">
            <label for="ru-content">{{ $t("common.contentInRussian") }}</label>
            <Editor id="ru-content" v-model="newsData.contentRu" editorStyle="height: 320px"/>
            <small v-show="formValid.contentRu && submitted" class="p-error">
              {{ $t("smartenu.contentRuInvalid") }}
            </small>
          </div>
        </TabPanel>
        <TabPanel header="English">
          <div class="p-field p-mt-3">
            <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
            <InputText id="en-title" v-model="newsData.titleEn" rows="3"
                       :class="{ 'p-invalid': formValid.titleEn && submitted }"/>
            <small v-show="formValid.titleEn && submitted" class="p-error">
              {{ $t("smartenu.titleEnInvalid") }}
            </small>
          </div>

          <div class="p-field">
            <label for="en-content">{{ $t("common.contentInEnglish") }}</label>
            <Editor id="en-content" v-model="newsData.contentEn" editorStyle="height: 320px"/>
            <small v-show="formValid.contentEn && submitted" class="p-error">
              {{ $t("smartenu.contentEnInvalid") }}
            </small>
          </div>
        </TabPanel>
      </TabView>
      <div class="p-field">
        <TreeSelect v-model="selectedCatTree" :options="catTree.root" selectionMode="checkbox"
                    :placeholder="$t('smartenu.selectCategories')" class="p-mb-3"/>
      </div>
      <div class="p-field">
        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadImage1($event)"
                    :auto="true" v-bind:chooseLabel="$t('smartenu.chooseImage1')"></FileUpload>
        <div v-if="mainImage" class="p-mt-3">
          <img :src="mainImage" style="width: 50%; height: 50%" alt=""/>
        </div>
        <div v-else class="p-mt-3">
          <img :src="newsData.imageUrl" style="width: 50%; height: 50%"/>
        </div>
      </div>
      <div class="p-field-checkbox">
        <Checkbox id="isPoster" name="isPoster" v-model="newsData.isPoster" :binary="true"/>
        <label for="isPoster">{{ $t("smartenu.addPoster") }}</label>
      </div>
      <div class="p-field p-mt-3" style="margin-bottom: 1.5rem" v-if="newsData.isPoster">
        <label for="poster-link">{{ $t("smartenu.posterLink") }}</label>
        <InputText id="poster-link" v-model="poster.link" rows="3" :placeholder="$t('smartenu.posterLink')"/>
        <div class="p-grid p-mt-3" v-if="newsData.isPoster">
          <div class="p-col">
            <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageKk($event)"
                        :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageKk')"/>
            <div v-if="posterImageKk" class="p-mt-3">
              <img :src="posterImageKk" style="width: 50%; height: 50%"/>
            </div>
            <div v-else class="p-mt-3">
              <img :src="poster.imageKkUrl" style="width: 50%; height: 50%"/>
            </div>
          </div>
          <div class="p-col">
            <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageRu($event)"
                        :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageRu')"/>
            <div v-if="posterImageRu" class="p-mt-3">
              <img :src="posterImageRu" style="width: 50%; height: 50%"/>
            </div>
            <div v-else class="p-mt-3">
              <img :src="poster.imageRuUrl" style="width: 50%; height: 50%"/>
            </div>
          </div>
          <div class="p-col">
            <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageEn($event)"
                :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageEn')"/>
            <div v-if="posterImageEn" class="p-mt-3">
              <img :src="posterImageEn" style="width: 50%; height: 50%"/>
            </div>
            <div v-else class="p-mt-3">
              <img :src="poster.imageEnUrl" style="width: 50%; height: 50%"/>
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
</template>

<script>
import * as imageResizeCompress from "image-resize-compress";
import {resizeImages} from "../../helpers/HelperUtil";
import {NewsService} from "../../service/news.service";
import {PosterService} from "../../service/poster.service";

export default {
  name: "AddEditNews",
  props: ['isVisible', 'selectedNews', 'catTree', 'catTreeList'],
  data() {
    return {
      editVisible: this.isVisible ?? false,
      formValid: [],
      newsData: this.selectedNews,
      submitted: false,
      selectedCatTree: null,
      catTreeElementsList: this.catTreeList,
      mainImage: null,
      posterImageKk: null,
      posterImageRu: null,
      posterImageEn: null,
      poster: this.selectedNews.poster ? this.selectedNews.poster : {
        link: "",
        imageKk: null,
        imageRu: null,
        imageEn: null,
      },
      newsService: new NewsService(),
      posterService: new PosterService()
    }
  },
  created() {
    console.log(this.newsData)
  },
  methods: {
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
      if (this.newsData.isPoster) {
        this.validPosterImages();
        if (this.formValid.length > 0) {
          return;
        }
        const fd = new FormData();
        fd.append("link", this.poster.link ? this.poster.link : '')
        fd.append("imageKk", this.poster.imageKk)
        fd.append("imageRu", this.poster.imageRu)
        fd.append("imageEn", this.poster.imageEn)
        fd.append("id", this.poster.id ? parseInt(this.poster.id) : 0)

        this.posterService.addPoster(fd).then((res) => {
          this.newsData.posterId = res.data.id;
          this.insertNews();
        });
      } else {
        this.insertNews();
      }
    },
    async insertNews() {
      await resizeImages(this.newsData.contentKz).then(res => {
        this.newsData.contentKz = res
      });
      await resizeImages(this.newsData.contentRu).then(res => {
        this.newsData.contentRu = res
      });
      await resizeImages(this.newsData.contentEn).then(res => {
        this.newsData.contentEn = res
      });
      const fd = new FormData();
      fd.append("news", JSON.stringify(this.newsData))
      fd.append("imageFileMain", this.imageFileMain);
      this.newsService.addNews(fd).then((response) => {
        if (response.data !== null) {
          this.emitter.emit('newsCreated', true);
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
    uploadImage1(event) {
      const file = event.files[0];
      this.imageFileMain = event.files[0];
      this.newsData.image1 = null;
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.mainImage = resp;
            });
          });
    },
    uploadPosterImageKk(event) {
      const file = event.files[0];
      this.poster.imageKk = event.files[0];
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.posterImageKk = resp;
            });
          });
    },
    uploadPosterImageRu(event) {
      const file = event.files[0];
      this.poster.imageRu = event.files[0];
      imageResizeCompress
          .fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.posterImageRu = resp;
            });
          });
    },
    uploadPosterImageEn(event) {
      const file = event.files[0];
      this.poster.imageEn = event.files[0];
      imageResizeCompress.fromBlob(file, 90, 720, "auto", "jpeg")
          .then((res) => {
            imageResizeCompress.blobToURL(res).then((resp) => {
              this.posterImageEn = resp;
            });
          });
    },
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
        if (!this.imageFileMain)
          this.formValid.push(this.$t("smartenu.image1Invalid"));
      }
      if (!this.selectedCatTree) {
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
    hideDialog() {
      this.emitter.emit('addEditNewsDialogHide', true);
    }
  }
}
</script>

<style scoped>

</style>