<template>
  <!--    BEGINNING OF ADD/EDIT DIALOG-->

  <Dialog v-model:visible="editVisible" :closable="false" :style="{ width: '1000px' }"
          :header="$t('smartenu.createOrEditEvents')" :modal="true" class="p-fluid">
    <div class="card">
      <Message v-for="msg of formValid" severity="error" :key="msg">{{
          msg
        }}
      </Message>
      <TabView>
        <TabPanel header="Қазақша">
          <div class="p-field p-mt-3">
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
            <InputText
                id="kz-title"
                v-model="event.titleKz"
                rows="3"
                :class="{ 'p-invalid': formValid.titleKz && submitted }"
            />
            <small v-show="formValid.titleKz && submitted" class="p-error">{{
                $t("smartenu.titleKzInvalid")
              }}</small>
          </div>
          <div class="p-field">
            <label for="kz-content">{{ $t("common.contentInQazaq") }}</label>
            <RichEditor
                ref="kztext"
                id="kz-content"
                v-model="event.contentKz"
                editorStyle="height: 320px"
            >
            </RichEditor>
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
                v-model="event.titleRu"
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
                v-model="event.contentRu"
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
                v-model="event.titleEn"
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
                v-model="event.contentEn"
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
      <div class="p-field">
        <label for="is-online">{{ $t("smartenu.eventFormat") }}</label>
        <Dropdown
            id="is-online"
            v-model="event.isOnline"
            :options="format"
            optionLabel="name"
            optionValue="value"
            :placeholder="$t('smartenu.eventFormat')"
            :class="{ 'p-invalid': formValid.isOnline && submitted }"
        />
        <small v-show="formValid.isOnline && submitted" class="p-error">{{
            $t("smartenu.isOnlineInvalid")
          }}</small>
      </div>
      <div
          class="p-field"
          style="margin-top: 1.5rem"
          v-if="event.isOnline == true"
      >
        <label for="event-link">{{ $t("smartenu.meetingLink") }}</label>
        <InputText
            id="event-link"
            v-model="event.eventLink"
            rows="3"
            :class="{ 'p-invalid': formValid.eventLink && submitted }"
        />
        <small v-show="formValid.eventLink && submitted" class="p-error">{{
            $t("smartenu.eventLinkInvalid")
          }}</small>
      </div>
      <div
          class="p-field"
          style="margin-top: 1.5rem"
          v-if="event.isOnline == false"
      >
        <label for="event-location">{{
            $t("smartenu.meetingLocation")
          }}</label>
        <InputText
            id="event-location"
            v-model="event.eventLocation"
            rows="3"
            :class="{ 'p-invalid': formValid.eventLocation && submitted }"
        />
        <small
            v-show="formValid.eventLocation && submitted"
            class="p-error"
        >{{ $t("smartenu.eventLocationInvalid") }}</small
        >
      </div>
      <div class="p-field">
        <label for="p-cat">{{ $t("smartenu.participantsCategory") }}</label>
        <MultiSelect
            v-model="selectedMainCategories"
            :options="participantsMainCategories"
            :optionLabel="
              $i18n.locale === 'kz'
                ? `nameKz`
                : $i18n.locale === 'ru'
                ? `nameRu`
                : `nameEn`
            "
            :placeholder="$t('smartenu.selectMainCategory')"
            :class="{
              'p-invalid': formValid.selectedMainCategories && submitted,
            }"
        />
        <small
            v-show="formValid.selectedMainCategories && submitted"
            class="p-error"
        >{{ $t("smartenu.selectedCatInvalid") }}</small
        >
      </div>
      <div class="p-field">
        <MultiSelect
            v-if="isBachelor"
            v-model="selectedBachelorCourses"
            :options="bachelorCourses"
            :optionLabel="
              $i18n.locale === 'kz'
                ? `nameKz`
                : $i18n.locale === 'ru'
                ? `nameRu`
                : `nameEn`
            "
            :placeholder="$t('smartenu.selectBachelor')"
        />
      </div>
      <div class="p-field">
        <MultiSelect
            v-if="isMaster"
            v-model="selectedMasterCourses"
            :options="masterCourses"
            :optionLabel="
              $i18n.locale === 'kz'
                ? `nameKz`
                : $i18n.locale === 'ru'
                ? `nameRu`
                : `nameEn`
            "
            :placeholder="$t('smartenu.selectMaster')"
        />
      </div>
      <div class="p-field">
        <MultiSelect
            v-if="isFaculty"
            v-model="selectedFaculties"
            :options="faculties"
            :optionLabel="
              $i18n.locale === 'kz'
                ? `nameKz`
                : $i18n.locale === 'ru'
                ? `nameRu`
                : `nameEn`
            "
            :placeholder="$t('smartenu.selectFaculty')"
        />
      </div>
      <div class="p-field">
        <MultiSelect
            v-if="isFacultySelected"
            v-model="selectedDepartments"
            :options="departments"
            :optionLabel="
              $i18n.locale === 'kz'
                ? `nameKz`
                : $i18n.locale === 'ru'
                ? `nameRu`
                : `nameEn`
            "
            :placeholder="$t('smartenu.selectDepartment')"
        />
      </div>
      <div class="p-field">
        <div>
          <label for="data-and-time">{{ $t("smartenu.dataAndTime") }}</label>
        </div>
        <PrimeCalendar
            id="data-and-time"
            :placeholder="$t('faq.createDate')"
            :showTime="true"
            :showSeconds="true"
            v-model="event.eventDate"
            dateFormat="dd.mm.yy"/>
      </div>
      <div class="p-field">
        <div class="p-grid">
          <div class="p-col-12 p-md-5">
            <FileUpload
                ref="form"
                mode="basic"
                :customUpload="true"
                @uploader="uploadMainImage($event)"
                :auto="true"
                v-bind:chooseLabel="$t('smartenu.chooseMainImage')"
            ></FileUpload>
          </div>
        </div>
        <div v-if="event.mainImage">
          <img :src="event.mainImage"
               style="width: 50%; height: 50%"/>
        </div>
        <div v-else>
          <img :src="event.imageUrl"
               style="width: 50%; height: 50%"/>
        </div>
      </div>
      <div class="p-field">
        <div class="p-grid">
          <div class="p-col-12 p-md-3">
            <FileUpload
                ref="form"
                mode="basic"
                :customUpload="true"
                @uploader="uploadFile($event)"
                :auto="true"
                v-bind:chooseLabel="$t('smartenu.chooseAdditionalFile')"
            ></FileUpload>
          </div>
          <div class="p-col-12 p-md-5">
            <InlineMessage severity="info" show v-if="event.additionalFileName">
              {{ $t("ncasigner.chosenFile", {fn: event.additionalFileName}) }}
            </InlineMessage>
            <!--              <InlineMessage severity="info" show v-if="file">
                            {{ $t("ncasigner.chosenFile", {fn: file ? file.name : ""}) }}
                          </InlineMessage>-->
          </div>
        </div>
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
              <img :src="poster.imageKkUrl" style="width: 50%; height: 50%"/>
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
              <img :src="poster.imageRuUrl" style="width: 50%; height: 50%"/>
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
              <img :src="poster.imageEnUrl" style="width: 50%; height: 50%"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <Button
          v-bind:label="$t('common.cancel')"
          icon="pi pi-times"
          class="p-button-rounded p-button-danger"
          @click="hideDialog"
      />
      <Button
          v-bind:label="$t('common.save')"
          icon="pi pi-check"
          class="p-button-rounded p-button-success p-mr-2"
          v-on:click="addEvent"
      />
    </template>
  </Dialog>
</template>

<script>
export default {
  name: "AddEditEvent"
}
</script>

<style scoped>

</style>