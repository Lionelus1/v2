<template>
  <BlockUI :blocked="saving" :fullScreen="true"></BlockUI>
  <ProgressBar v-if="saving" mode="indeterminate" style="height: .5em" />
  <h3 class="mt-0"> {{ $t('contracts.title') }} </h3>
  <div class="card">
    <div class="p-col">
      <div class="box">
        <span class="subtitle"><i class="pi pi-copy subtitle"></i>&nbsp;{{ $t('contracts.documents') }}</span>
        <div class="fieldmenu-item pb-3">
          <Button :label="$t('common.newDoc')" @click="openForm('createDocDialog')" class="p-button-link" /><br>
          <i class="mx-3">{{ $t('contracts.create') }}</i>
        </div>
        <div class="fieldmenu-item pb-3">
          <router-link to="/documents/catalog/contracts" class="p-button p-button-link">{{ $t('contracts.list') }}</router-link><br>
          <i class="mx-3">{{ $t('contracts.listdesc') }}</i>
        </div>
        <div class="fieldmenu-item pb-3" v-if="!this.findRole(null, 'student')">
          <router-link to="/documents/catalog/acts" class="p-button p-button-link">{{ $t('contracts.menu.actsJournal') }}</router-link><br>
          <i class="mx-3">{{ $t('contracts.menu.actsJournalDesc') }}</i>
        </div>
      </div>
    </div>
  </div>

  <Sidebar v-model:visible="dialogOpenState.createDocDialog" :modal="true" :style="largeScreen ? 'width:75vw' : ''" :position="largeScreen ? 'right' : 'full'">
    <div class="flex flex-wrap justify-content-between">
      <SelectButton :disabled="true" v-model="selectedDocSourceType" :options="docSourceType" class="mb-3 mr-3">
        <template #option="slotProps">
          <div v-if="slotProps.option == Enum.DocSourceType.Template">{{ $t('contracts.fromtemplate') }}</div>
          <div v-else>{{ $t('contracts.fromdoc') }}</div>
        </template>
      </SelectButton>
      <SelectButton @change="changeLanguage" v-model="selectedDocLanguage" :options="languages" class="mb-3" :disabled="selectedDocSourceType != Enum.DocSourceType.Template">
        <template #option="slotProps">
          <div v-if="slotProps.option == 'kz'">{{ $t('common.language.kz') }}</div>
          <div v-else>{{ $t('common.language.ru') }}</div>
        </template>
      </SelectButton>
    </div>
    <div v-if="selectedDocSourceType == Enum.DocSourceType.Template">
      <DocumentTemplates ref="templateComponent" mode="selection" @onselect="dialogOpenState.createDocDialog = false; createDocByTemplate($event)"></DocumentTemplates>
    </div>
    <Card v-else>
      <template #content>
        <PostFile :fileUpload="true" :modelValue="file" :showCatalog="true" directory="readyMadeContract" @updated="fileUpdated" accept=".pdf"></PostFile>
      </template>
    </Card>
  </Sidebar>
</template>
<script>

  import { smartEnuApi, getHeader, findRole } from "@/config/config";
  import Enum from "@/enum/docstates/index";
  import { DocService } from "@/service/doc.service";
  import PostFile from "./PostFile.vue"
  import { AgreementService } from "@/service/agreement.service";
  import DocumentTemplates from "@/components/documents/catalog/DocumentTemplates.vue";

export default {
  components: { DocumentTemplates, PostFile },
  data() {
    return {
      service: new DocService(),

      largeScreen: false,

      dialogOpenState: {
        createDocDialog: false,
      },
      saving: false,
      docTemplates: [],
      selectedTemplate: null,
      Enum: Enum,
      selectedDocSourceType: Enum.DocSourceType.Template,
      docSourceType: [Enum.DocSourceType.Template, Enum.DocSourceType.FilledDoc],
      languages: ["kz", "ru"],
      selectedDocLanguage: "kz",
      lazyParams: {
        page: 0,
        rows: 10,
        userType: Number(this.$route.params.type),
        sortLang: this.$i18n.locale,
      },
      findRole: findRole,
      file: {
        namekz: '',
        nameru: '',
        nameen: '',
        id: null,
        lang: { name: "kz", value: 0 },
        docType: Enum.DocType.Contract,
        sourceType: Enum.DocSourceType.FilledDoc,
      },
      agreementService: new AgreementService()
    }
  },
  mounted() {
    this.checkScreenSize();
    this.$emit('apply-flex', true);
  },
  beforeUnmount() {
    this.$emit('apply-flex', false);
  },
  methods: {
    checkScreenSize() {
      this.largeScreen = window.innerWidth >= 640;
    },
    changeLanguage() {
      this.$refs.templateComponent.changeLanguage(this.selectedDocLanguage)
    },
    openForm(formName, node) {
      this.dialogOpenState[formName] = true;
      if (node != null) {
        this.selectedNode = node;
      }
    },
    closeForm(formName) {
      this.dialogOpenState[formName] = false;
    },
    showMessage(msgtype, message, content) {
      this.$toast.add({ severity: msgtype, summary: message, detail: content, life: 3000 });
    },
    createDocByTemplate(event) {
      this.saving = true;

      this.service.createDocumentV2({
        templateId: event.id,
        docType: Enum.DocType.Contract,
        language: this.selectedDocLanguage === "kz" ? 0 : 1,
      }).then(res => {
        this.showMessage('success', this.$t('contracts.title'), this.$t('contracts.message.created'));

        this.saving = false;

        this.$router.push({ path: '/documents/contracts/' + res.data.uuid });
      }).catch(err => {
        if (err.response && err.response.status == 401) {
          this.$store.dispatch("logLout")
        } else if (err.response && err.response.data && err.response.data.localized) {
          this.showMessage('error', this.$t(err.response.data.localizedPath), null)
        } else {
          this.showMessage('error', this.$t('common.message.actionError'), this.$t('common.message.actionErrorContactAdmin'))
        }

        this.saving = false;
      })
    },
    fileUpdated(event) {
      this.$router.push({ path: '/documents/contracts/' + event.key });
    },
  },
}
</script>

<style scoped>
.card {
  flex-grow: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0px;
}

.subtitle {
  font-size: 20px;
  letter-spacing: .3px;
}
</style>
