<template>
  <div id="carddiv" class="p-grid">
    <div class="p-col-12">
      <h3>{{ $t("common.userDetail") }}</h3>
      <div>
        <Menubar
          :model="menu"
          :key="active"
          style="
            height: 36px;
            margin-top: -7px;
            margin-left: -14px;
            margin-right: -14px;
          "
        ></Menubar>
      </div>
    </div>
    <div
      v-if="userDetailSaved"
      id="contentcnv"
      class="p-col-12"
      :style="backcolor"
      ref="content"
    >
      <h6>{{ $t("common.message.userSuccessInserted") }}</h6>
      <table style="border: 1px solid black; border-collapse: collapse">
        <tr style="border: 1px solid black; border-collapse: collapse">
          <th style="border: 1px solid black; border-collapse: collapse">
            {{ $t("contact.iin") }}
          </th>
          <th style="border: 1px solid black; border-collapse: collapse">
            {{ $t("common.password") }}
          </th>
        </tr>
        <tr style="border: 1px solid black; border-collapse: collapse">
          <td style="border: 1px solid black; border-collapse: collapse">
            {{ value.IIN }}
          </td>
          <td style="border: 1px solid black; border-collapse: collapse">
            {{ password }}
          </td>
        </tr>
      </table>
    </div>
    <Button
      v-if="userDetailSaved"
      @click="download"
      :label="$t('common.download')"
      class="p-button-link"
    />
    <div class="p-col-12 p-md-12 p-fluid">
      <div class="card">
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("contact.lname")
              }}<span class="p-error" v-if="addMode">*</span></label
            >

            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              v-model="value.thirdName"
            ></InputText>
            <small
              class="p-error"
              v-if="submitted && validationErrors.thirdName"
              >{{ $t("common.requiredField") }}</small
            >
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("contact.fname")
              }}<span class="p-error" v-if="addMode">*</span></label
            >
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              v-model="value.firstName"
            ></InputText>
            <small
              class="p-error"
              v-if="submitted && validationErrors.firstName"
              >{{ $t("common.requiredField") }}</small
            >
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.sname") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              v-model="value.lastName"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("contact.birthday")
              }}<span class="p-error" v-if="addMode">*</span></label
            >

            <PrimeCalendar
              :readonly="readonly"
              class="p-mt-2"
              v-model="value.birthday"
              dateFormat="dd.mm.yy"
            />
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("contact.iin")
              }}<span class="p-error" v-if="addMode">*</span></label
            >
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.iin')"
              v-model="value.IIN"
            ></InputText>
            <small class="p-error" v-if="submitted && validationErrors.iin">{{
              $t("common.requiredField")
            }}</small>
          </div>
          <div v-if="addMode" class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("common.password") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              v-model="password"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("common.academicDegree") }}</label>
            <Dropdown  class="p-mt-2"  v-model="value.academicDegree" :options="academicDegreeDictionary" :optionLabel="('name'+$i18n.locale)" :placeholder="$t('common.select')" />

          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("common.academicTitle") }}</label>
            <Dropdown  class="p-mt-2" :disabled="readonly && !addMode" v-model="value.academicTitle" :options="academicTitleDictionary" :optionLabel="('name'+$i18n.locale)" :placeholder="$t('common.select')" />

          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("common.workPlace")
              }}<span class="p-error" v-if="addMode">*</span></label
            >
            <ContragentSelectOrg 
              v-model="value.organization"
              class="p-mt-2"
            ></ContragentSelectOrg>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("contact.position")
              }}<span class="p-error" v-if="addMode">*</span></label
            >
            <PositionsList 
              class="p-mt-2"
              :readonly="readonly && !addMode"
              v-model="value.mainPosition"
            ></PositionsList>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.gender") }}</label>
            <Dropdown
              :disabled="readonly && !addMode"
              class="p-mt-2"
              v-model="value.gender"
              :options="gender"
              :optionLabel="$i18n.locale"
              optionValue="id"
              :placeholder="$t('contact.gender')"
            />
          </div>
          <div v-if="!addMode" class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("common.state") }}</label>
            <SelectButton
              :disabled="readonly"
              class="p-mt-2"
              v-model="value.state"
              :options="states"
              optionValue="id"
              optionLabel="name"
            />
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>&nbsp;</label>
            <SelectButton
              :disabled="readonly"
              class="p-mt-2"
              v-model="value.resident"
              :options="resident"
              optionValue="id"
              optionLabel="name"
            />
          </div>
        </div>
      </div>
      <div class="card">
        <div class="p-text-uppercase p-mb-2">
          {{ this.$t("contact.title") }}
        </div>
        <div class="p-grid p-formgrid">
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.email") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.email')"
              v-model="value.email"
            ></InputText>
            <small class="p-error" v-if="submitted && validationErrors.email">{{
              $t("common.requiredField")
            }}</small>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.locality") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.locality')"
              v-model="value.locality.name"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("contact.address") }} ({{
                this.$t("common.language.kz")
              }})</label
            >
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.address')"
              v-model="value.address"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label
              >{{ this.$t("contact.address") }} ({{
                this.$t("common.language.ru")
              }})</label
            >
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.address')"
              v-model="value.addressrus"
            ></InputText>
          </div>
          <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
            <label>{{ this.$t("contact.phone") }}</label>
            <InputText
              :readonly="readonly"
              class="p-mt-2"
              type="text"
              :placeholder="$t('contact.phone')"
              v-model="value.phone"
            ></InputText>
          </div>
        </div>
      </div>
      <Accordion style="margin-left: -14px; margin-right: -14px">
        <AccordionTab>
          <template #header>
            <div class="p-text-uppercase">
              {{ this.$t("contact.idcard.requisite") }}
            </div>
          </template>
          <div class="card">
            <div class="p-grid p-formgrid">
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("common.number") }}</label>
                <InputText
                  :readonly="readonly"
                  class="p-mt-2"
                  type="text"
                  :placeholder="$t('common.number')"
                  v-model="value.idnumber"
                    ></InputText>
              </div>
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("contact.idcard.givenorg") }}</label>
                <Dropdown
                  :disabled="readonly"
                  class="p-mt-2"
                  v-model="value.idsource"
                  :options="givenorg"
                  :optionLabel="$i18n.locale"
                  optionValue="id"
                  :placeholder="$t('contact.idcard.givenorg')"
                    />
              </div>
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("contact.idcard.givendate") }}</label>
                <PrimeCalendar
                  v-model="value.iddate"
                  dateFormat="dd.mm.yy"
                  placeholder="dd.mm.yyyy"
                  :monthNavigator="true"
                  :yearNavigator="true"
                  yearRange="1990:2050"
                    />
              </div>
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("contact.idcard.expire") }}</label>
                <PrimeCalendar
                  v-model="value.idexpire"
                  dateFormat="dd.mm.yy"
                  placeholder="dd.mm.yyyy"
                  :monthNavigator="true"
                  :yearNavigator="true"
                  yearRange="1990:2050"
                    />
              </div>
            </div>
          </div>
        </AccordionTab>
        <AccordionTab>
          <template #header>
            <div class="p-text-uppercase">{{ this.$t("bank.requisite") }}</div>
          </template>
          <div class="card">
            <div class="p-grid p-formgrid">
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("bank.accnumber") }}</label>
                <InputText
                  :readonly="readonly"
                  class="p-mt-2"
                  type="text"
                  :placeholder="$t('bank.accnumber')"
                  v-model="value.bankaccount"
                    ></InputText>
              </div>
              <div class="p-col-12 p-mb-2 p-pb-2 p-lg-6 p-mb-lg-0">
                <label>{{ this.$t("bank.title2") }}</label>
                <InputText
                  :readonly="readonly"
                  class="p-mt-2"
                  type="text"
                  :placeholder="$t('bank.title2')"
                  v-model="value.bank.name"
                    ></InputText>
              </div>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>
  </div>
</template>
<script>
import ContragentSelectOrg from "../contragent/ContragentSelectOrg.vue";
import PositionsList from "../smartenu/PositionsList.vue";
import axios from "axios";
import { getHeader, smartEnuApi } from "@/config/config";
import html2canvas from "html2canvas";
import * as jsPDF from "jspdf";
export default {
  components: { ContragentSelectOrg, PositionsList },
  name: "Person",
  data() {
    return {
      userDetailSaved: false,
      academicDegreeDictionary: [],
      academicTitleDictionary: [],
      backcolor: "background-color: var(--green-100);",
      password: "",
      value: this.modelValue,
      states: [
        { id: 1, name: this.$t("contragent.active") },
        { id: -1, name: this.$t("contragent.inactive") },
      ],
      resident: [
        { id: 1, name: this.$t("contragent.resident") },
        { id: -1, name: this.$t("contragent.noneresident") },
      ],
      givenorg: [
        { id: 1, kz: "ҚР ІІМ", ru: "МВД РК", en: "MIA RK" },
        { id: 2, kz: "ҚР ӘМ", ru: "МЮ РК", en: "MJ RK" },
      ],
      gender: [
        { id: 1, kz: "еркек", ru: "мужчина", en: "Male" },
        { id: 2, kz: "әйел", ru: "женщина", en: "Female" },
      ],
      validationErrors: {
        thirdName: false,
        firstName: false,
        iin: false,
        email: false,
      },
      submitted: false,
      active: null,
      menu: [
        {
          label: this.$t("common.save"),
          icon: "pi pi-fw pi-save",
          command: () => {
            if (this.addMode) this.insertUser();
          },
        },
        {
          label: this.$t("contact.mailto"),
          icon: "pi pi-fw pi-envelope",
          visible: !this.addMode,
          command: () => {
            window.location.href = "mailto:" + this.modelValue.value.email;
          },
        },
        {
          label: this.$t("common.contacts"),
          icon: "pi pi-fw pi-user",
          visible: !this.addMode,
        },
      ],
    };
  },
  props: {
    modelValue: null,
    placeholder: String,
    readonly: Boolean,
    addMode: Boolean,
  },
  emits: ['userCreated'],
  created() {
    var generator = require("generate-password");

    this.password = generator.generate({
      length: 10,
      numbers: true,
      symbols: true,
    });
    this.getCatalog("academic_degree");
    this.getCatalog("academic_title")
  },
  methods: {
    getCatalog(name) {
      axios
        .post(
          smartEnuApi + "/auth/getDictionary",
          { name: name },
          {
            headers: getHeader(),
          }
        )
        .then((res) => {
          if (name === "academic_degree") {
            this.academicDegreeDictionary = res.data
          } else {
            this.academicTitleDictionary = res.data
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else {
            this.$toast.add({
              severity: "error",
              summary: "Dictionary load error:\n" + error,
              life: 3000,
            });
          }
        });
    },
    insertUser() {
      this.submitted = true;
      if (this.validateAddForm()) {
        axios
          .post(
            smartEnuApi + "/insertUser",
            { user: this.value, password: this.password },
            {
              headers: getHeader(),
            }
          )
          .then((res) => {
            this.value.userID = res.data;
            this.submitted = false;
            this.userDetailSaved = true;
            if (this.value.thirdName != "") {
              this.value.fullName =  this.value.thirdName
            }
            if (this.value.firstName != "") {
               this.value.fullName =  this.value.fullName + " " +  this.value.firstName
            }
            if (this.value.lastName != "") {
               this.value.fullName =  this.value.fullName + " " +  this.value.lastName
            }
            this.$emit("userCreated", this.value);
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else if (error.response.status == 302) {
              this.$toast.add({
                severity: "error",
                summary: "User create error: " + error,
                life: 3000,
              });
            } else {
              this.$toast.add({
                severity: "error",
                summary: "User create error\n" + error,
                life: 3000,
              });
            }
          });
      }
    },
    validateAddForm() {
      this.validationErrors.firstName =
        !this.value.firstName || this.value.firstName == "";
      this.validationErrors.thirdName =
        !this.value.thirdName || this.value.thirdName == "";
      this.validationErrors.email = !this.value.email || this.value.email == "";
      this.validationErrors.iin = !this.value.IIN || this.value.IIN == "";
      return (
        !this.validationErrors.firstName &&
        !this.validationErrors.thirdName &&
        !this.validationErrors.email &&
        !this.validationErrors.iin
      );
    },
    download() {
      this.backcolor = "background-color: white";
      var element = document.getElementById("contentcnv");
      var positionInfo = element.getBoundingClientRect();
      var divHeight = positionInfo.height;
      var divWidth = positionInfo.width;
      var ratio = divHeight / divWidth;
      html2canvas(this.$refs.content, {
        height: divHeight,
        width: divWidth,
      }).then(function (canvas) {
        var image = canvas.toDataURL("image/jpeg");
        var doc = new jsPDF(); // using defaults: orientation=portrait, unit=mm, size=A4
        var width = doc.internal.pageSize.getWidth();
        var height = doc.internal.pageSize.getHeight();
        height = ratio * width;
        doc.addImage(image, "JPEG", 10, 10, width - 10, height);
        doc.save("user-credentials.pdf"); //Download the rendered PDF.
      });
      this.backcolor = "background-color: var(--teal-100);";
      this.userDetailSaved = false;
    },
  },
};
</script>
<style>
#carddiv label {
  position: inherit;
}
.p-accordion .p-accordion-header .p-accordion-header-link {
  border: 0px;
  height: 25px;
  background-color: #ffffff;
}
.p-accordion .p-accordion-content {
  border: 0px;
}
.p-accordion
  .p-accordion-header:not(.p-disabled).p-highlight
  .p-accordion-header-link {
  background-color: #ffffff;
}

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
