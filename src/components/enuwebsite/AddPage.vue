<template>
  <div class="grid">
    <div class="col-12">
      <h3>{{ $t('web.createPage') }}</h3>
    </div>
    <div class="col-12 p-fluid">
      <Menubar :model="initMenu" :key="active"
               style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>

      <div class="field-checkbox mt-3">
        <Checkbox id="landing" name="landing" v-model="formData.is_landing" :binary="true"/>
        <label for="landing">Landing page</label>
      </div>

      <div v-if="formData.is_landing">
        <div class="field">
          <label>{{ $t('common.nameInQazaq') }}</label>
          <InputText type="text" v-model="formData.title_kz"  />
          <small class="p-error" v-if="!formData.title_kz && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label>{{ $t('common.nameInRussian')}}</label>
          <InputText type="text" v-model="formData.title_ru"  />
          <small class="p-error" v-if="!formData.title_ru && submitted">{{ $t("common.requiredField") }}</small>
        </div>
        <div class="field">
          <label>{{ $t('common.nameInEnglish') }}</label>
          <InputText type="text" v-model="formData.title_en"  />
          <small class="p-error" v-if="!formData.title_en && submitted">{{ $t("common.requiredField") }}</small>
        </div>
      </div>

      <TabView v-if="!formData.is_landing">
        <TabPanel header="Қазақша">
          <div class="field mt-3">
            <label for="kz-title">{{ $t("common.nameInQazaq") }}</label>
            <InputText v-model="formData.title_kz" rows="3" :class="{ 'p-invalid': !formData.title_kz && submitted }"/>
            <small v-show="!formData.title_kz && submitted" class="p-error">{{ $t("smartenu.titleKzInvalid") }}</small>
          </div>
          <div class="field">
            <label>{{ $t("common.contentInQazaq") }}</label>
<!--            <RichEditor ref="kztext" v-model="formData.content_kz" editorStyle="height: 320px"></RichEditor>-->
            <TinyEditor v-model="formData.content_kz" />
            <small v-show="!formData.content_kz && submitted" class="p-error">
              {{ $t("smartenu.contentKzInvalid") }}
            </small>
          </div>
        </TabPanel>
        <TabPanel header="Русский">
          <div class="field mt-3" style="margin-bottom: 1.5rem">
            <label>{{ $t("common.nameInRussian") }}</label>
            <InputText v-model="formData.title_ru" rows="3" :class="{ 'p-invalid': !formData.title_ru && submitted }"/>
            <small v-show="!formData.title_ru && submitted" class="p-error">
              {{ $t("smartenu.titleRuInvalid") }}
            </small>
          </div>
          <div class="field">
            <label for="ru-content">{{ $t("common.contentInRussian") }}</label>
<!--            <RichEditor id="ru-content" v-model="formData.content_ru" editorStyle="height: 320px"/>-->
            <TinyEditor v-model="formData.content_ru" />
            <small v-show="!formData.content_ru && submitted" class="p-error">
              {{ $t("smartenu.contentRuInvalid") }}
            </small>
          </div>
        </TabPanel>
        <TabPanel header="English">
          <div class="field mt-3" style="margin-bottom: 1.5rem">
            <label>{{ $t("common.nameInEnglish") }}</label>
            <InputText v-model="formData.title_en" rows="3" :class="{ 'p-invalid': !formData.title_en && submitted }"/>
            <small v-show="!formData.title_en && submitted" class="p-error">
              {{ $t("smartenu.titleEnInvalid") }}
            </small>
          </div>
          <div class="field">
            <label>{{ $t("common.contentInEnglish") }}</label>
<!--            <RichEditor v-model="formData.content_en" editorStyle="height: 320px"/>-->
            <TinyEditor v-model="formData.content_en" />
            <small v-show="!formData.content_en && submitted" class="p-error">
              {{ $t("smartenu.contentEnInvalid") }}
            </small>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script>
import RichEditor from "@/components/documents/editor/RichEditor.vue";
import {EnuWebService} from "@/service/enu.web.service";
import TinyEditor from "../TinyEditor";

export default {
  name: "AddPage",
  components: {TinyEditor},
  data() {
    return {
      formData: {},
      submitted: false,
      enuService: new EnuWebService(),
    }
  },
  computed: {
    initMenu() {
      return [
        {
          label: this.$t('common.save'),
          icon: "pi pi-fw pi-save",
          command: () => {
            this.save();
          },
        }
      ];
    }
  },
  methods: {
    save() {
      this.submitted = true;
      if (!this.isValid()) {
        return;
      }
      this.enuService.addPage(this.formData).then(res => {
        if (res.data) {
          this.emitter.emit("pageCreated", res.data);
        }
      }).catch(error => {
        this.$toast.add({
          severity: "error",
          summary: error,
          life: 3000,
        });
      });

    },
    isValid() {
      let errors = [];
      if (!this.formData.title_kz)
        errors.push(1);
      if (!this.formData.title_ru)
        errors.push(1);
      if (!this.formData.title_en)
        errors.push(1);
      if (!this.formData.is_landing && !this.formData.content_kz)
        errors.push(1);
      if (!this.formData.is_landing && !this.formData.content_ru)
        errors.push(1);
      if (!this.formData.is_landing && !this.formData.content_en)
        errors.push(1);

      return errors.length === 0
    }
  }
}
</script>

<style scoped>

</style>
