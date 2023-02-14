<template>
  <Dialog v-if="editVisible" v-model:visible="editVisible" :style="{ width: '1000px' }" :breakpoints="{'960px': '75vw', '640px': '90vw'}"
          :header="$t('smartenu.createOrEditNews')"
          :modal="true" class="p-fluid">
    <div class="card">
<!--      <Message v-for="msg of formValid" severity="error" :key="msg">{{ msg }}</Message>-->
      <TabView>
        <TabPanel header="Қазақша">
          <div class="fieldmt-3">
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
            <InputText id="kz-title" v-model="newsData.titleKz" rows="3"
                       :class="{ 'p-invalid': !newsData.titleKz && submitted }"/>
            <small v-show="!newsData.titleKz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
          </div>
          <div class="field">
            <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
            <Editor id="kz-content" v-model="newsData.contentKz" editorStyle="height: 320px"/>
            <small v-show="!newsData.contentKz && submitted" class="p-error">{{
                $t("smartenu.contentKzInvalid")
              }}</small>
          </div>
        </TabPanel>
        <TabPanel header="Русский">
          <div class="fieldmt-3">
            <label for="ru-title">{{ $t("common.nameInRussian") }}</label>
            <InputText id="ru-title" v-model="newsData.titleRu"
                       rows="3" :class="{ 'p-invalid': !newsData.titleRu && submitted }"/>
            <small v-show="!newsData.titleRu && submitted" class="p-error">{{ $t("smartenu.titleRuInvalid") }}</small>
          </div>
          <div class="field">
            <label for="ru-content">{{ $t("common.contentInRussian") }}</label>
            <Editor id="ru-content" v-model="newsData.contentRu" editorStyle="height: 320px"/>
            <small v-show="!newsData.contentRu && submitted" class="p-error">
              {{ $t("smartenu.contentRuInvalid") }}
            </small>
          </div>
        </TabPanel>
        <TabPanel header="English">
          <div class="fieldmt-3">
            <label for="en-title">{{ $t("common.nameInEnglish") }}</label>
            <InputText id="en-title" v-model="newsData.titleEn" rows="3"
                       :class="{ 'p-invalid': !newsData.titleEn && submitted }"/>
            <small v-show="!newsData.titleEn && submitted" class="p-error">
              {{ $t("smartenu.titleEnInvalid") }}
            </small>
          </div>

          <div class="field">
            <label for="en-content">{{ $t("common.contentInEnglish") }}</label>
            <Editor id="en-content" v-model="newsData.contentEn" editorStyle="height: 320px"/>
            <small v-show="!newsData.contentEn && submitted" class="p-error">
              {{ $t("smartenu.contentEnInvalid") }}
            </small>
          </div>
        </TabPanel>
      </TabView>
      <div class="field">
        <TreeSelect v-show="selectedCatTree" v-model="selectedCatTree" :options="catTree.root" selectionMode="checkbox"
                    :placeholder="$t('smartenu.selectCategories')"
                    :class="{ 'p-invalid': selectedCatTree.length === 0 && submitted }"/>
        <small v-show="selectedCatTree.length === 0 && submitted" class="p-error">
          {{ $t("smartenu.selectedCatInvalid") }}
        </small>
      </div>
      <div class="field">
        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadImage1($event)"
                    :auto="true" v-bind:chooseLabel="$t('smartenu.chooseImage1')" accept="image/*"/>
        <small v-show="(!newsData.image1 && !imageFileMain) && submitted" class="p-error">
          {{ $t("smartenu.image1Invalid") }}
        </small>
        <div v-if="mainImage" class="mt-3">
          <img :src="mainImage" style="width: 50%; height: 50%" alt=""/>
        </div>
        <div v-if="!mainImage && newsData.imageUrl" class="mt-3">
          <img :src="newsData.imageUrl" style="width: 50%; height: 50%"/>
        </div>
      </div>
      <div class="field-checkbox">
        <Checkbox id="isPoster" name="isPoster" v-model="newsData.isPoster" :binary="true"/>
        <label for="isPoster">{{ $t("smartenu.addPoster") }}</label>
      </div>
      <div class="fieldmt-3" style="margin-bottom: 1.5rem" v-if="newsData.isPoster">
        <label for="poster-link">{{ $t("smartenu.posterLink") }}</label>
        <InputText id="poster-link" v-model="poster.link" rows="3" :placeholder="$t('smartenu.posterLink')"/>
        <div class="grid mt-3" v-if="newsData.isPoster">
          <div class="p-col">
            <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageKk($event)"
                        :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageKk')" accept="image/*"/>
            <div v-if="posterImageKk" class="mt-3">
              <img :src="posterImageKk" style="width: 50%; height: 50%"/>
            </div>
            <div v-else class="mt-3">
              <img :src="poster.imageKkUrl" style="width: 50%; height: 50%"/>
            </div>
          </div>
          <div class="p-col">
            <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageRu($event)"
                        :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageRu')" accept="image/*"/>
            <div v-if="posterImageRu" class="mt-3">
              <img :src="posterImageRu" style="width: 50%; height: 50%"/>
            </div>
            <div v-else class="mt-3">
              <img :src="poster.imageRuUrl" style="width: 50%; height: 50%"/>
            </div>
          </div>
          <div class="p-col">
            <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadPosterImageEn($event)"
                        :auto="true" v-bind:chooseLabel="$t('smartenu.posterImageEn')" accept="image/*"/>
            <div v-if="posterImageEn" class="mt-3">
              <img :src="posterImageEn" style="width: 50%; height: 50%"/>
            </div>
            <div v-else class="mt-3">
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
          class="p-button p-component p-button-success mr-2"
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
      posterImgKk: null,
      posterImgRu: null,
      posterImgEn: null,
      poster: this.selectedNews.poster ? this.selectedNews.poster : {
        link: "",
        imageKk: null,
        imageRu: null,
        imageEn: null,
      },
      imageFileMain: null,
      newsService: new NewsService(),
      posterService: new PosterService()
    }
  },
  created() {
    if (this.editVisible) {
      this.selectedCatTree = [];
      for (let key in this.catTreeElementsList) {
        for (let ixd in this.newsData.contentCategoryRelations) {
          if (this.catTreeElementsList[key].data.id === this.newsData.contentCategoryRelations[ixd].categoryId) {
            this.selectedCatTree[this.catTreeElementsList[key].key] = {
              checked: this.newsData.contentCategoryRelations[ixd].checked,
              partialChecked: this.newsData.contentCategoryRelations[ixd].partialChecked,
            };
          }
        }
      }
    }
  },
  methods: {
    addNews() {
      this.submitted = true;
      if (this.validateNews().length > 0) {
        return;
      }
      this.newsData.contentCategoryRelations = [];
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
        if (this.posterImgKk)
          fd.append("imgKk", this.posterImgKk)
        if (this.posterImgRu)
          fd.append("imgRu", this.posterImgRu)
        if (this.posterImgEn)
          fd.append("imgEn", this.posterImgEn)

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
      if (this.newsData.poster)
        this.newsData.posterId = this.newsData.poster.id;
      const fd = new FormData();
      fd.append("news", JSON.stringify(this.newsData))
      fd.append("imageFileMain", this.imageFileMain);
      this.newsService.addNews(fd).then((response) => {
        if (response.data !== null) {
          this.emitter.emit('newsCreated', true);
        }
      }).catch((error) => {
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
      this.posterImgKk = event.files[0];
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
      this.posterImgRu = event.files[0];
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
      this.posterImgEn = event.files[0];
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
        this.formValid.push({titleKz: true})
      }
      if (!this.newsData.titleRu) {
        this.formValid.push({titleRu: true})
      }
      if (!this.newsData.titleEn) {
        this.formValid.push({titleRu: true})
      }
      if (!this.newsData.contentKz) {
        this.formValid.push({contentKz: true})
      }
      if (!this.newsData.contentRu) {
        this.formValid.push({contentRu: true})
      }
      if (!this.newsData.contentEn) {
        this.formValid.push({contentEn: true})
      }
      if (this.selectedCatTree.length === 0) {
        this.formValid.push({selectedCatTree: true})
      }
      if (!this.newsData.image1) {
        if (!this.imageFileMain)
          this.formValid.push(this.$t("smartenu.image1Invalid"));
      }
      return this.formValid;
    },
    validPosterImages() {
      if (!this.poster.imageKk && !this.posterImgKk) {
        this.formValid.push(this.$t("smartenu.posterImageKkInvalid"));
      }
      if (!this.poster.imageRu && !this.posterImgRu) {
        this.formValid.push(this.$t("smartenu.posterImageRuInvalid"));
      }
      if (!this.poster.imageEn && !this.posterImgEn) {
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
