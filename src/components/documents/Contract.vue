<template>
  <div class="ontent-section">
    <h4 class="p-ml-3">{{ $t("contracts.contract") }}</h4>
    <Menubar
      :model="menu"
      :key="active"
      style="height: 36px; margin-top: -7px; margin-left: -14px"
    ></Menubar>
    <TabView @TabChange="tabChanged" v-model:activeIndex="activeTab">
      <TabPanel :header="$t('common.params')">
        <div class="p-grid">
          <div class="p-lg-8 p-md-12 p-sm-12">
            <h6>{{ $t("common.main").toUpperCase() }}</h6>
            <div
              v-if="contract != null && contract.sourceType === 0"
              class="p-fluid"
            >
              <div
                v-for="param in contract.params"
                :key="param.id"
                class="p-field p-grid"
              >
                <label
                  v-if="param.name == 'contragent' || param.name == 'ourside'"
                  :for="param.name + param.id"
                  class="p-col-12 p-mb-12 p-md-12 p-mb-md-0 p-text-uppercase"
                  >{{ $t("doctemplate.editor." + param.name) }}</label
                >
                <label
                  v-else-if="param.name !== 'text'"
                  :for="param.name + param.id"
                  class="p-col-12 p-mb-2 p-md-2 p-mb-md-0"
                  >{{ $t("doctemplate.editor." + param.name) }}</label
                >
                <label
                  v-else
                  :for="param.name + param.id"
                  class="p-col-12 p-mb-2 p-md-2 p-mb-md-0"
                  >{{ param.description }}</label
                >

                <div
                  v-if="param.name == 'contragent' || param.name == 'ourside'"
                  class="p-col-12 p-md-12"
                >
                  <ContragentSelect v-model="param.value"></ContragentSelect>
                </div>
                <div v-else class="p-col-12 p-md-10">
                  <UserSearch
                    v-if="param.name == 'student'"
                    v-model="param.value"
                    :max="1"
                    :userType="1"
                  ></UserSearch>
                  <DatePicker
                    v-else-if="param.name == 'period'"
                    v-model="param.value"
                    is-range
                  >
                    <template v-slot="{ inputValue, inputEvents }">
                      <div class="flex justify-center items-center">
                        <input
                          :value="inputValue.start"
                          v-on="inputEvents.start"
                          class="border px-2 py-1 w-32 rounded focus:outline-none focus:border-indigo-300"
                        />
                        <svg
                          class="w-4 h-4 mx-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                        <input
                          :value="inputValue.end"
                          v-on="inputEvents.end"
                          class="border px-2 py-1 w-32 rounded focus:outline-none focus:border-indigo-300"
                        />
                      </div>
                    </template>
                  </DatePicker>
                  <InputText
                    v-model="contract.number"
                    v-else-if="param.name === 'number'"
                    :id="param.name + param.id"
                    type="text"
                    :readonly="param.name == 'number' || param.name == 'date'"
                    :placeholder="
                      param.name == 'number' || param.name == 'date'
                        ? $t('contracts.autogenerate')
                        : ''
                    "
                  />
                  <InputText
                    v-model="param.value"
                    v-else
                    :id="param.name + param.id"
                    type="text"
                    :readonly="param.name == 'number' || param.name == 'date'"
                    :placeholder="
                      param.name == 'number' || param.name == 'date'
                        ? $t('contracts.autogenerate')
                        : ''
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel :header="$t('common.show')">
        <div class="card">
          <embed
            style="width: 100%; height: 1000px"
            v-if="pdf"
            type="application/pdf"
            :src="'data:application/pdf;base64,' + pdf + '#toolbar=0'"
          />
        </div>
      </TabPanel>
    </TabView>

    <Dialog
      :header="$t(temp ? 'contracts.reserveNumber' : 'common.registration')"
      modal="true"
      v-model:visible="dialog.setNumber"
    >
      <div class="p-grid p-formgrid">
        <div class="p-col-12 p-mb-2 p-lg-3 p-mb-lg-1">
          <label for="catalog">{{ $t("contracts.journal") }}</label>
        </div>
        <div class="p-col-12 p-mb-2 p-lg-9 p-mb-lg-1 p-pr-2">
          <InputText
            readonly="true"
            :modelValue="
              this.$i18n.locale === 'kz'
                ? contract.template.folder.nameKaz
                : this.$i18n.locale === 'ru'
                ? contract.template.folder.nameRus
                : contract.template.folder.nameEn
            "
            >{{}}</InputText
          >
        </div>
        <div class="p-col-12 p-mb-2 p-lg-3 p-mb-lg-1">
          <label for="catalog">{{ $t("common.date") }}</label>
        </div>
        <div class="p-col-12 p-mb-2 p-lg-9 p-mb-lg-1 p-pr-2">
          <PrimeCalendar
            :readonly="readonly"
            class="p-mt-2"
            v-model="contract.registerDate"
            dateFormat="dd.mm.yy"
          />
        </div>
        <div class="p-col-12 p-mb-2 p-lg-3 p-mb-lg-0">
          <label for="regnum">{{ $t("contracts.regnum") }}</label>
        </div>
        <div class="p-col-6 p-mb-2 p-lg-4 p-mb-lg-2 p-pr-2">
          <InputText
            v-model="reserveNumber"
            readonly="true"
            id="regnum"
            class=""
            style="width: 100%"
          ></InputText>
        </div>
        <div class="p-col-3 p-mb-2 p-lg-5 p-mb-lg-0">
          <i>-{{ $t("contracts.preliminary") }}</i>
        </div>
      </div>

      <template #footer>
        <Button
			:disabled= "(this.contract.number && this.contract.number !== '')"
          	:label="$t(temp ? 'common.reserve' : 'common.registration')"
          	@click="registrateContract()"
        />
        <Button :label="$t('common.cancel')" @click="closeForm('setNumber')" />
      </template>
    </Dialog>
  </div>
</template>
<script>
import { smartEnuApi, getHeader } from "@/config/config";
import axios from "axios";

import UserSearch from "./usersearch/UserSearch.vue";
import ContragentSelect from "../contragent/ContragentSelect.vue";
import { DatePicker } from "v-calendar";
import Enum from "@/enum/docstates/index";
import {
  incline,
  inclineFirstname,
  inclineLastname,
  inclineMiddlename,
} from "lvovich";
import { constantizeGenderInRules } from "lvovich/lib/inclineRules";
export default {
  name: "Contract",
  components: { UserSearch, DatePicker, ContragentSelect },
  data() {
    return {
      contract: null,
      students: null,
      organization: null,
      pdf: null,
      activeTab: 0,
      readonly: true,
      ContragentType: Enum.ContragentType,
      tabs: {
        Parameters: 0,
        Preview: 1,
      },
      temp: false,
      sourceType: {
        template: 0,
        uploadedDoc: 1,
      },
	  reserveNumber: null,
      range: {
        start: new Date(2020, 0, 1),
        end: new Date(2020, 0, 5),
      },
      language: {
        kz: 0,
        ru: 1,
        en: 2,
      },
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          disabled: this.readonly,
          command: () => {
            this.saveContract();
          },
        },
        {
          label: this.$t("common.download"),
          icon: "pi pi-fw pi-download",
          disabled: this.readonly,
          command: () => {
            this.downloadContract(true);
          },
        },
        {
          label: this.$t("common.registration"),
          icon: "pi pi-fw pi-paperclip",
          disabled: this.readonly,

          items: [
            // {
            //   label: this.$t("common.registration"),
            //   icon: "pi pi-fw pi-paperclip",
            //   command: () => {
            //     this.temp = false;
            //     this.openForm("setNumber");
            //   },
            // },
            {
              label: this.$t("contracts.setnumber"),
              icon: "pi pi-fw pi-list",
              command: () => {
                this.temp = true;
                this.openForm("setNumber");
              },
            },
          ],
        },
        {
          label: this.$t("common.send"),
          icon: "pi pi-send",
          items: [
            {
              label: this.$t("common.toapprove"),
              icon: "pi pi-check",
              visible: () =>
                this.contract &&
                this.contract.sourceType === this.sourceType.uploadedDoc,
            },
            {
              label: this.$t("contracts.signing"),
              icon: "pi pi-user-edit",
              visible: () =>
                this.contract &&
                this.contract.sourceType === this.sourceType.template,
            },
          ],
        },
      ],
      dialog: {
        setNumber: false,
      },
    };
  },
  computed: {
    previewText() {
      if (!this.contract) return "";
      var result = this.contract.text;
      var ourside = null;
      var contragents = null;
      this.contract.params.forEach((param) => {
        if (param.name == "ourside")
          result = result.replace(
            "{" +
              param.name +
              (param.description != null && param.description != ""
                ? ":" + param.description + "}"
                : "}"),
            this.paramToString(param)
          );
      });
      return result;
    },
  },
  methods: {
    openForm(formName) {
      this.dialog[formName] = true;
      if (formName === "setNumber" && (!this.contract.number  || this.contract.number === "" )) {
        this.registrateContract(true);
        this.contract.registerDate = new Date()
          .toJSON()
          .slice(0, 10)
          .replace(/-/g, ".");
      }
    },
    closeForm(formName) {
      this.dialog[formName] = false;
    },
    sm(message) {
      alert(JSON.stringify(message));
    },
    tabChanged() {
      if (this.activeTab === this.tabs.Preview) {
        if (!this.contract) return;
        this.downloadContract(false);
      }
    },
    initApiCall() {
      let url = "/agreement/get";
      var req = { id: parseInt(this.$route.params.id) };
      axios
        .post(smartEnuApi + url, req, { headers: getHeader() })
        .then((res) => {
          this.contract = res.data;
		  this.reserveNumber = this.contract.number
          if (this.contract.sourceType == 0) {
            this.contract.text =
              this.contract.lang == this.language.kz
                ? this.contract.template.mainTextKaz
                : this.contract.template.mainTextRus;
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    paramToString(param) {
      var result = "";
      if (!param || !param.name) return result;

      switch (param.name) {
        case "text":
          result = param.value;
          break;
        case "number":
          result = "№ " + (param.value ?? "________");
          break;
        case "date":
          result = this.getDate(param.value ?? new Date());
          break;
        case "contragent":
          result =
            result + this.getContragentName(param.value, this.contract.lang);
          break;
        default:
          result = param.name;
      }
      return result;
    },
    getContragentName(agent, lang) {
      if (!agent) {
        return "";
      }
      switch (agent.type) {
        case Enum.ContragentType.Organization:
          var orgName =
            lang != this.language.ru
              ? '"' + agent.data.name + '" ' + agent.data.form.shortname
              : agent.data.form.shortnameru + ' "' + agent.data.nameru + '"';
          if (lang === this.language.kz) {
            orgName += " в лице " + inclineFirstname("директор", "genitive");
          }
          orgName +=
            " " +
            agent.data.chief.lname +
            " " +
            agent.data.chief.fname +
            " " +
            (agent.data.chief.sname ?? "");
          if (lang === this.language.ru) {
            orgName += " тұлғасында";
          }
          return orgName;
        case Enum.ContragentType.Person:
          return (
            this.value.data.lname +
            " " +
            agent.data.fname +
            " " +
            (agent.data.sname ?? "")
          );
        case Enum.ContragentType.Bank:
          return lang != this.language.ru
            ? '"' +
                agent.data.organization.name +
                '" ' +
                agent.data.organization.form.shortname
            : agent.data.organization.form.shortnameru +
                ' "' +
                agent.data.organization.nameru +
                '"';
      }
    },
    getDate(date) {
      var dd = date.getDate();
      var mm = date.getMonth() + 1;
      var yyyy = date.getFullYear();
      if (dd < 10) {
        dd = "0" + dd;
      }
      if (mm < 10) {
        mm = "0" + mm;
      }
      return dd + "." + mm + "." + yyyy;
    },
    saveContract() {
      if (!this.contract) return;
      let url = "/agreement/updatedocparams";
      var req = this.contract;
      axios
        .post(smartEnuApi + url, req, { headers: getHeader() })
        .then((res) => {
          this.$toast.add({
            severity: "success",
            summary: this.$t("common.save"),
            detail: this.$t("common.message.succesSaved"),
            life: 3000,
          });
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    downloadContract(saveFile) {
      if (!this.contract) return;
      let url = "/contract/getpdf";
      var req = { id: this.contract.id };
      req.lang = "kaz";
      if (this.contract.lang != 0) {
        req.lang = "rus";
      }
      axios
        .post(smartEnuApi + url, req, { headers: getHeader() })
        .then((response) => {
          this.pdf = response.data;
          if (saveFile) {
            var link = document.createElement("a");
            link.innerHTML = "Download PDF file";
            link.download = this.contract.id + ".pdf";
            link.href = "data:application/octet-stream;base64," + this.pdf;
            link.click();
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    registrateContract(next = false) {
      if (!this.contract) return;
      let url = "/contract/setnumber";
      var req = {
        id: this.contract.id,
        temp: this.temp,
        next: next,
      };

      axios
        .post(smartEnuApi + url, req, { headers: getHeader() })
        .then((res) => {
		  this.reserveNumber = res.data;
          if (!next) {
            this.contract.number = res.data;

            this.$toast.add({
              severity: "success",
              summary: this.$t("common.save"),
              detail: this.$t("common.message.succesRegistered"),
              life: 3000,
            });
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status == 401) {
            this.$store.dispatch("logout");
          }
        });
    },
  },
  mounted() {
    this.initApiCall();
  },
};
</script>
<style scoped lang="scss">
.border-indigo-300 {
  --border-opacity: 1;
  border-color: #a3bffa;
  border-color: rgba(163, 191, 250, var(--border-opacity));
}
.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.border {
  border-width: 1px;
}
.rounded {
  border-radius: 0.25rem;
}
.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.focus\:border-indigo-300:focus {
  --border-opacity: 1;
  border-color: #a3bffa;
  border-color: rgba(163, 191, 250, var(--border-opacity));
}
.w-4 {
  width: 1rem;
}
.h-4 {
  height: 1rem;
}
.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
.embed-cover {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin-right: 20px;
}

.wrapper {
  position: relative;
  overflow: hidden;
}

/* Not Important*/
img {
  width: 300px;
}
</style>
