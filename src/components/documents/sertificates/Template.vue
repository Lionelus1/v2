<template>
   <div class="p-grid">
    <BlockUI :blocked="saving" :fullScreen="true">
    </BlockUI>
		<div class="p-col-12">
			<div class="card">
				<h3>{{$t("course.sertificate.template")}}</h3>
        <Toolbar>
          <template #end>
            <Button :label="$t('common.add')" @click="this.inittialNewTemplate();newTemplateDialogVisible=true;" icon="pi pi-plus" />
          </template>
        </Toolbar>
        <DataTable
          v-if="journal"
          selectionMode="single"
          v-model:selection="template"
          :lazy="true"
          :totalRecords="count"
          :value="journal"
          @page="onPage($event)"
          :paginator="true"
          :first="lazyParams.page"
          :rows="lazyParams.rows"
          dataKey="id"
          :rowHover="true"
          :loading="loading"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 25, 50]"
          :currentPageReportTemplate="
          $t('common.showingRecordsCount', {
            first: '{first}',
            last: '{last}',
            totalRecords: '{totalRecords}',
          })"
          responsiveLayout="scroll"
          @sort="onSort($event)"
          @filter="onFilter($event)">
          <Column field="name" :header="$t('common.name')"></Column>
          <Column headerStyle="width:60px;">
            <template #body="slotProps">
              <Button @click="template=slotProps.data;templateEditorVisilble = true"
                       type="button"
                      icon="pi pi-eye" class="p-button-info"></Button>
            </template>
          </Column>
        </DataTable>
			</div>
		</div>
              
    <Sidebar v-model:visible="templateEditorVisilble" position="full" :showCloseIcon="false" >
      <div>
        <Menubar :model="menu">
          <template #end>
            <Button icon="pi pi-times" @click="closeTemplateEditor(true)" class="p-button-rounded p-button-text  p-button-secondary" />
          </template>
        </Menubar>
      </div>
      <ProgressBar v-if="saving" mode="indeterminate" style="height: .5em" />
      <TabView style="margin-top:0px" v-model:activeIndex="activeIndex">
        <TabPanel headerStyle="" v-for="lang in languages" :key="lang" :header="$t('common.language.' + lang)">
          <div ref="canvdiv" id="candiv"    style:="overflow:scroll; width:100%; height:100%;">
            <div style="  height: 595px;width:842px;border: 1px solid #000;user-select: none;position:relative;">
              <template v-for="element in template.params">
                <Vue3DraggableResizable :active="element.active"  :ref="lang+template.params.indexOf(element)"  :id="lang+template.params.indexOf(element)" :key="element.id" v-if="element.value != null && !element.isDeleted && (element.description === lang || element.description == 'common')"
                  v-model:x="element.value.rectelement.x"
                  v-model:y="element.value.rectelement.y"
                  v-model:w="element.value.rectelement.w"
                  v-model:h="element.value.rectelement.h"
                  :initW="element.value.rectelement.w"
                  :initH="element.value.rectelement.h"
                  :draggable="true"
                  :resizable="true"
                  @activated="selectElement(element, lang)"
                  @deactivated="print('imgdiv')"
                  @drag-start="print('drag-start')"
                  @resize-start="print('resize-start')"
                  @dragging="print('dragging')"
                  @resizing="print('resizing')"
                  @drag-end="change()"
                  @resize-end="change()"
                  :style="'z-index:'+element.value.rectelement.z"
                  :parent="true">
                  <Button :ref="'btn'+ lang+template.params.indexOf(element)" style="position:absolute;right:-20px;top:0px;width:15px;height:15px;padding: 0px;" icon="pi pi-cog" @click="toggle($event,element)" class="button1 p-button-rounded p-button-text p-button-sm" />
                  <Button v-if="element.description !== 'common'" style="position:absolute; right:-20px;top:20px;width:15px;height:15px;padding: 0px;" icon="pi pi-trash" @click="removeElement(template.params,element)" class="button1 p-button-rounded p-button-text p-button-danger p-button-sm" />
                  <img v-if="element.name=='img'" style="width:100%;height: 100%;" :src="element.value.url">
                  <div  v-if="element.name=='txt'">
                    <p  :style="element.value.style" v-html="element.value['title' + lang] ? element.value['title' + lang] : element.value.title"></p>
                  </div>
                </Vue3DraggableResizable>
              </template>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </Sidebar>
    <OverlayPanel ref="op">
      <div v-if="activeElement && activeElement.name=='txt'" >
        <div>
          <InputNumber showButtons="true" inputStyle="width:35px" @keypress="calcStyle" v-model="activeElement.FontSize" @input="calcStyle"></InputNumber>
          <span class="p-buttonset p-ml-1 p-mr-1">
            <Button :class="activeElement && activeElement.isBold ? 'p-button-info' : 'p-button-outlined p-button-info'" @click="activeElement.isBold = !activeElement.isBold; calcStyle();" label="B"/>
            <Button style="font-style:italic" :class="activeElement && activeElement.isItalic ? 'p-button-info' : 'p-button-outlined p-button-info'" @click="activeElement.isItalic = !activeElement.isItalic; calcStyle();" label="I"/>
            <Button style="text-decoration:underline" :class="activeElement && activeElement.isUnderlined ? 'p-button-info' : 'p-button-outlined p-button-info'" @click="activeElement.isUnderlined = !activeElement.isUnderlined; calcStyle();" label="U"/>
          </span>
          <ColorPicker defaultColor="000000" class="p-mr-1" v-model="activeElement.Color" @change="calcStyle"/>
          <SplitButton  icon="fa-solid fa-text-width" @click="save" :model="letterspacing" class="p-button-outlined p-button-info p-mr-1"></SplitButton>
          <SplitButton  :icon="('pi pi-align-' +(activeElement.textAlign ? activeElement.textAlign : 'left'))" @click="save" :model="justifyOptions" class="p-button-outlined p-button-info p-mr-1"></SplitButton>
          <Button icon="fa-solid fa-copy" class="p-button-outlined p-button-info" @click="bringElementToFront"></Button>
          </div>
          <div class="p-mr-1 p-mt-2">
            <p contenteditable="true" v-if="activeElement.description  === 'common'"  style="width:100%;border-style: solid;padding: 2px;color:#2196f3" v-html="activeElement.value['title' + activeElement.lang]" @input="setText($event,activeElement.lang)" @keydown.enter="addLineBreak"></p>
            <p contenteditable="true" v-else style="width:100%;border-style: solid;padding:2px;color:#2196f3" v-html="activeElement.value.title" @input="setText($event,'common')" @keydown.enter="addLineBreak" ></p>
          </div>
        </div>
        <div  v-if="activeElement && activeElement.name=='img'" >
        <Button icon="fa-solid fa-copy" class="p-button-outlined p-button-info" @click="bringElementToFront"></Button>
      </div>
    </OverlayPanel>
     <!-- Шаблон атауын беру диалогы -->
     <Dialog :header="$t('doctemplate.newTemplate') " v-model:visible="newTemplateDialogVisible" :modal="true"  :breakpoints="{'960px': '75vw', '640px': '90vw'}" :style="{width: '50vw'}">
      <div class="p-fluid">
        <label class="p-mb-1" style="width:100%" >{{ $t("common.name") }}</label>
				<InputText class="p-mt-1" style="width:100%" id="templateName" type="text" v-model="template.name" />
        <div style="width: 100%; text-align: center;">
          <ProgressSpinner v-if="saving" aria-label="Basic ProgressSpinner" />
        </div>
        </div>
      <template #footer>
        <div class="p-fluid">
          <Button :label="$t('common.save')" :disabled="!(template.name && template.name.trim() != '')" @click="saveSertificateTemplate" class="p-button-primary"/>
          <Button :label="$t('common.cancel')" @click="newTemplateDialogVisible=false"  class="p-mt-1 p-button-secondary p-button-outlined"/>
        </div> 
      </template>
    </Dialog>
    <!-- Терезені жабу диалогы -->
    <Dialog v-model:visible="closeDialogVisible" :modal="true" :closable="false">
      <template #header>
        <h5>{{ $t("common.message.saveChangesWarning") }}</h5>
      </template>

      {{ $t("common.message.unsaveOutcome") }}

      <template #footer>
        <div class="p-fluid">
          <Button :label="$t('common.save')" @click="saveSertificateTemplate" style="width:100%" class="p-button-primary"/>
          <Button :label="$t('common.no')" @click="closeTemplateEditor(false)" style="width:100%" class="p-mt-1 p-button-secondary p-button-outlined"/>
          <Button :label="$t('common.cancel')" style="width:100%" @click="closeDialogVisible=false"  class="p-mt-3 p-button-secondary p-button-outlined"/>
        </div> 
      </template>
    </Dialog>
    <!-- жаңа сурет элементін қосу диалогы -->
    <Dialog v-model:visible="addPictureDialogVisible" :modal="true" :closable="false" :breakpoints="{'960px': '75vw', '640px': '90vw'}" :style="{width: '80vw'}">
      <template #header>
        <h5>{{ $t("common.message.addPicture") }}</h5>
      </template>
				<Images></Images>

      <template #footer>
        <div class="p-fluid">
          <Button :label="$t('common.save')" @click="saveSertificateTemplate" style="width:100%" class="p-button-primary"/>
          <Button :label="$t('common.no')" @click="closeTemplateEditor(false)" style="width:100%" class="p-mt-1 p-button-secondary p-button-outlined"/>
          <Button :label="$t('common.cancel')" style="width:100%" @click="closeDialogVisible=false"  class="p-mt-3 p-button-secondary p-button-outlined"/>
        </div> 
      </template>
    </Dialog>
	</div>
</template>
<script>

import Vue3DraggableResizable from 'vue3-draggable-resizable'
//default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

import {OnlineCourseService} from "@/service/onlinecourse.service";
import Images from "@/components/documents/Images.vue"

export default {
    name: "SertificateTemplate",
    components: {
      Vue3DraggableResizable, Images
    },
    data() {
        return {
            closeDialogVisible: false,
            journal: null,
            loading: false,
            count: 0,
            templateEditorVisilble: false,
            addPictureDialogVisible: true,
            newTemplateDialogVisible: false,
            saving: false,
            changed: false,
            service: new OnlineCourseService(),
            activeIndex: 0,
            languages: ["kz", "ru", "en"],
            savedRange: null,
            lazyParams : {
              page: 0,
              rows: 10,
            },
            letterspacing: [
              {
                label: this.$t('common.letterSpacing.normal'),
                command: () => { 
                  if (this.activeElement) {
                    this.activeElement.letterSpacing = 0; 
                  }
                  this.calcStyle();
                }
              },
              {
                label: this.$t('common.letterSpacing.expanded'),
                command: () => { 
                  if (this.activeElement) {
                    this.activeElement.letterSpacing = 2; 
                  }
                  this.calcStyle();
                }
              },
              {
                label: this.$t('common.letterSpacing.condensed'),
                command: () => { 
                  if (this.activeElement) {
                    this.activeElement.letterSpacing = -2; 
                  }
                  this.calcStyle();
                }
              }
            ],
            menu: [
              {
                label: this.$t('common.add'), icon: "pi pi-plus", items: [
                  {
                    label: this.$t("faq.uploadImage"), icon: "pi pi-image", 
                    command:() => {
                      this.initialNewElement("img");
                    }
                  },
                  {
                    label: this.$t("doctemplate.editor.text"), icon: "fa-solid fa-t",
                    command:() => {
                      this.initialNewElement("txt");
                    }
                  }
                ],
              },
              {
                label: this.$t('common.save'), icon: "pi pi-check",
                command:() => {
                  this.$confirm.require({
                    message: this.$t("common.confirmation"),
                    header: this.$t("common.confirm"),
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => {
                        this.saveSertificateTemplate()
                      }
                    })
                  }
                }
              ],
            
            template: { 
              name: "",
              params: [
                  {id: -1, name: "img", description:"common", isDeleted:false, value: { url: "https://smart.enu.kz:8081/serve?path=enu_logo/bg-orange.jpg", title: "background", rectelement: {z:0, x:0,y:0, w:840, h:593}}},
                  {id: -1, name: "txt", description:"common", active: false, isDeleted:false, value: { name: "organizer", title: "@сourseOrganizer", titlekz: "@курстыҰйымдастырушы", titleru: "@организаторКурса", rectelement: {z:1, x:0,y:80, w:840, h:30}, style:"font-weight:bold;text-align:center;font-size:14px;color:#007dbe;letter-spacing:0px"}},
                  {id: -1, name: "txt", description:"common", active: false, isDeleted:false, value: { name: "sertificate", title: "SERTIFICATE", titlekz: "СЕРТИФИКАТ", titleru: "CЕРТИФИКАТ", rectelement: { z:2,x:306,y:120, w:230, h:50}, style:"text-align:center;font-size:32px;color:#007dbe;letter-spacing:2px"}},
                  {id: -1, name: "img", description:"common", active: false, isDeleted:false, value: {url: "https://smart.enu.kz:8081/serve?path=enu_logo/qr.png", name: "qr", rectelement: {z:3, x:643,y:380, w:70, h:70}}},
                  {id: -1, name: "img", description:"common", active: false, isDeleted:false, value: {url: "https://smart.enu.kz:8081/serve?path=enu_logo/build.png", name: "build", rectelement: {z:4, x:585,y:470, w:170, h:70}}},
                  {id: -1, name: "txt", description:"common", active: false, isDeleted:false, value: { name: "mainText", title: "mainInfo", 
                  titlekz: "Тыңдаушы @тыңдаушыныңТолықАтыЖөні <br>@курстыңТолықАтауы онлайн курсын <br> @сағатСаны сағат көлемінде @оқығанКезеңі аралығында сәтті өтті.", 
                  titleru: "Слушатель @полноеИмяСлушателя <br> усепшно прошел(а) <br> онлайн курс @полноеНаименованиеКурса <br> @периодОбучения в объеме @количествоЧасов часов.", 
                  titleen: "Listener @listenerFullName <br> has succesfully completed the online course @fullNameOfCourse <br> @studyPeriod for @hoursCount hours.", 
                  rectelement: {z:5, x:90,y:190, w:660, h:180}, style:"text-align:center;font-size:22px;color:#000000;letter-spacing:0px"}},
                  {id: -1, name: "txt", description:"common",  value: { name: "number", title: "details", 
                  titlekz: "№ @sertficateNumber<br> @sertificateDate <br> Астана қаласы", 
                  titleru: "№ @sertficateNumber<br> @sertificateDate <br> город Астана", 
                  titleen: "№ @sertficateNumber<br> @sertificateDate <br> Astana city", 
                  rectelement: {z:6, x:90,y:490, w:160, h:60}, style:"font-size:10px;color:#000000;letter-spacing:0px"}},
                  {id: -1, name: "img", description:"kz", active: false, isDeleted:false,  value: {url:  "https://smart.enu.kz:8081/serve?path=enu_logo/logo-kz.png", title: "logo", rectelement: {z:7, x:340,y:15, w:163, h:60}}},
                  {id: -1, name: "img", description:"ru", active: false, isDeleted:false,  value:{url:  "https://smart.enu.kz:8081/serve?path=enu_logo/logo-en.png", title: "logo", rectelement: {z:8, x:349,y:15, w:144, h:60}}},
                  {id: -1, name: "img", description:"en", active: false, isDeleted:false,  value: {url: "https://smart.enu.kz:8081/serve?path=enu_logo/logo-en.png", title: "logo", rectelement: {z:9,x:349,y:15, w:144, h:60}}},
            ],
            },  
            activeElement: null,
            selectedElement: null,
            transform: null,
            svg:null,
            paperSize: {width: 842, height: 595},
            svgRoot: null,
        }
    },
    methods: {
        getJournal() {
          this.loading = true;

          this.service.getSertificateTemplateJournal(this.lazyParams).then(response =>{
            this.journal = response.data.templates;
            this.count = response.data.count;
            this.loading = false;
          })
          .catch(_=> {
            this.loading = false;
          })
        },
        onPage(event) {
          this.lazyParams = event;
          console.log(this.lazyParams);
          this.getJournal();
        }, 
       
        saveSertificateTemplate() {
          this.saving = true;
          this.service.saveSertificateTemplate(this.template).then(response => {
            this.template = response.data;
            this.$toast.add({
              severity: "success",
              summary: this.$t('common.success'),
              life: 3000,
            });
            if (this.closeDialogVisible) {
              this.closeTemplateEditor(false)
            }
            if (this.newTemplateDialogVisible) {
              this.newTemplateDialogVisible = false;
              this.templateEditorVisilble = true;
            }
            this.changed = false;
            this.saving = false;
          })
          .catch(_=> {
            this.saving = false;
          })
        
        },
        inittialNewTemplate() {
          this.template =  { 
              name: "",
              params: [
                  {id: -1, name: "img", description:"common", isDeleted:false, value: { url: "https://smart.enu.kz:8081/serve?path=enu_logo/bg-orange.jpg", title: "background", rectelement: {z:0, x:0,y:0, w:840, h:593}}},
                  {id: -1, name: "txt", description:"common", active: false, isDeleted:false, value: { name: "organizer", title: "@сourseOrganizer", titlekz: "@курстыҰйымдастырушы", titleru: "@организаторКурса", rectelement: {z:1, x:0,y:80, w:840, h:30}, style:"font-weight:bold;text-align:center;font-size:14px;color:#007dbe;letter-spacing:0px"}},
                  {id: -1, name: "txt", description:"common", active: false, isDeleted:false, value: { name: "sertificate", title: "SERTIFICATE", titlekz: "СЕРТИФИКАТ", titleru: "CЕРТИФИКАТ", rectelement: { z:2,x:306,y:120, w:230, h:50}, style:"text-align:center;font-size:32px;color:#007dbe;letter-spacing:2px"}},
                  {id: -1, name: "img", description:"common", active: false, isDeleted:false, value: {url: "https://smart.enu.kz:8081/serve?path=enu_logo/qr.png", name: "qr", rectelement: {z:3, x:643,y:380, w:70, h:70}}},
                  {id: -1, name: "img", description:"common", active: false, isDeleted:false, value: {url: "https://smart.enu.kz:8081/serve?path=enu_logo/build.png", name: "build", rectelement: {z:4, x:585,y:470, w:170, h:70}}},
                  {id: -1, name: "txt", description:"common", active: false, isDeleted:false, value: { name: "mainText", title: "mainInfo", 
                  titlekz: "Тыңдаушы @тыңдаушыныңТолықАтыЖөні <br>@курстыңТолықАтауы онлайн курсын <br> @сағатСаны сағат көлемінде @оқығанКезеңі аралығында сәтті өтті.", 
                  titleru: "Слушатель @полноеИмяСлушателя <br> усепшно прошел(а) <br> онлайн курс @полноеНаименованиеКурса <br> @периодОбучения в объеме @количествоЧасов часов.", 
                  titleen: "Listener @listenerFullName <br> has succesfully completed the online course @fullNameOfCourse <br> @studyPeriod for @hoursCount hours.", 
                  rectelement: {z:5, x:90,y:190, w:660, h:180}, style:"text-align:center;font-size:22px;color:#000000;letter-spacing:0px"}},
                  {id: -1, name: "txt", description:"common",  value: { name: "number", title: "details", 
                  titlekz: "№ @sertficateNumber<br> @sertificateDate <br> Астана қаласы", 
                  titleru: "№ @sertficateNumber<br> @sertificateDate <br> город Астана", 
                  titleen: "№ @sertficateNumber<br> @sertificateDate <br> Astana city", 
                  rectelement: {z:6, x:90,y:490, w:160, h:60}, style:"font-size:10px;color:#000000;letter-spacing:0px"}},
                  {id: -1, name: "img", description:"kz", active: false, isDeleted:false,  value: {url:  "https://smart.enu.kz:8081/serve?path=enu_logo/logo-kz.png", title: "logo", rectelement: {z:7, x:340,y:15, w:163, h:60}}},
                  {id: -1, name: "img", description:"ru", active: false, isDeleted:false,  value:{url:  "https://smart.enu.kz:8081/serve?path=enu_logo/logo-en.png", title: "logo", rectelement: {z:8, x:349,y:15, w:144, h:60}}},
                  {id: -1, name: "img", description:"en", active: false, isDeleted:false,  value: {url: "https://smart.enu.kz:8081/serve?path=enu_logo/logo-en.png", title: "logo", rectelement: {z:9,x:349,y:15, w:144, h:60}}},
            ],
            };  
        },
        initialNewElement(elType) {
          this.activeElement = {}
          this.activeElement.name = elType;
          this.activeElement.description = this.languages[this.activeIndex]
          this.activeElement.value = {
              id: -1, 
              rectelement: {z:this.getZ(), x:10,y:10, w:100, h:24}
            }
          if (elType === "txt") {
            this.activeElement.value['titleen'] = ""
            this.activeElement.value['titlekz'] = ""
            this.activeElement.value['titleru'] = ""
            this.activeElement.value['title'] = ""
            this.activeElement.active = true
            this.activeElement.value.style="font-size:14px;color:#000000;letter-spacing:0px"
            this.template.params.push(this.activeElement)

            this.$nextTick(() => {
              this.$refs[this.languages[this.activeIndex] + this.template.params.indexOf(this.activeElement)].active = true
              return
            })
            return
          }
          this.addPictureDialogVisible = true;
        },
        change() {
          this.changed=true;
        },
        closeTemplateEditor(checkForChange) {
          if (checkForChange) {
            this.templateEditorVisilble = this.closeDialogVisible = this.changed
          } else
          this.templateEditorVisilble = this.closeDialogVisible = this.changed = checkForChange

        },
        toggle(event, element) {
          this.activeElement = element;
          if (this.activeElement.name === 'txt') {
            let params = this.activeElement.value.style.split(";")
            params.map(param => {
              let [key, value] = param.split(':');
              switch (key) {
                case "font-size":
                  this.activeElement.FontSize = Number(value.slice(0,-2));
                  break;
                case "letter-spacing":
                  this.activeElement.letterSpacing = Number(value.slice(0,-2));
                  break;
                case "font-weight": 
                  this.activeElement.isBold = value === "bold";
                  break
                case "font-style":
                  this.activeElement.isItalic = value === "italic";
                  break
                case "text-decoration":
                  this.activeElement.isUnderlined = value === "underline";
                  break
                case "color":
                  this.activeElement.Color = value.replace("#","")
                  break;
                case "text-align":
                  this.activeElement.textAlign = value
                  break;
              }
            });
        }
        console.log(event)
          this.$refs.op.toggle(event);
        },
        getZ() {
          let max = 0;
          this.template.params.forEach(elem => {
              if (elem.value.rectelement.z > max) {
                max = elem.value.rectelement.z
              }
          });
          return max +1;
        },

        bringElementToFront() {
          this.change()
          if (!this.activeElement) {
            return
          }
          
          this.activeElement.value.rectelement.z = this.getZ()
        },
        calcStyle() {
          this.change()
          let style = "";
          if (!this.activeElement) {
            return 
          }
          if (this.activeElement.FontSize) {
            style = "font-size:" + this.activeElement.FontSize + "px;";
          }
          if (this.activeElement.isBold) {
            style += "font-weight:bold;"
          }
          if (this.activeElement.isItalic) {
            style += "font-style:italic;"
          }
          if (this.activeElement.isUnderlined) {
            style += "text-decoration:underline;"
          }
          if (this.activeElement.Color) {
            style += "color:#" + this.activeElement.Color + ";"
          }
          if (this.activeElement.letterSpacing) {
            style += "letter-spacing:" + this.activeElement.letterSpacing + "px;"
          }
          if (this.activeElement.textAlign) {
            style += "text-align:" + this.activeElement.textAlign +";"
          }
          this.activeElement.value.style = style
        },
        print(val) {
         
        },
        getCursorPosition()  {
          const selection = window.getSelection();
          const range = selection.getRangeAt(0);
          const start = range.startOffset;
          let node = range.startContainer;
          let row = 1;
          let col = start;
          while (node.previousSibling) {
            node = node.previousSibling;
            row++;
          }
          return { row, col };
        },
        setCursorPosition (row, col, paragraph) {
          const selection = window.getSelection();
          const range = document.createRange();
          range.setStart(paragraph.childNodes[row-1], col);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          paragraph.focus();
        },
        addLineBreak(event) {
          event.preventDefault();
          const paragraph = event.target
          const selection = window.getSelection();
          const range = selection.getRangeAt(0);
          var br = document.createElement("br");
          range.deleteContents();
          range.insertNode(br);
          range.collapse(false);
          br.parentNode.normalize();
          selection.removeAllRanges();
          selection.addRange(range);
          paragraph.focus();
        },
  
        setText(e, lang) {
          const position = this.getCursorPosition();
          if (lang === 'common') {
            this.activeElement.value['title'] = e.target.innerHTML;
          } else {
            this.activeElement.value['title' + lang] = e.target.innerHTML;
          }
          this.$nextTick(() => {
            this.setCursorPosition(position.row, position.col, e.target);
          });
        },
    
        selectElement(element, lang) {
          if(element) {
            this.activeElement = element;
            this.activeElement.lang = lang;
           
          }
        },
        
        removeElement(params, element) {
          this.$confirm.require({
                message: this.$t("common.confirmation"),
                header: this.$t("common.confirm"),
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                 if (this.activeElement.id >0) {
                  this.activeElement.isDeleted = true;
                 } else {
                  let index = this.template.params.indexOf(this.activeElement) 
                  if (index > -1) {
                    this.template.params.splice(index,1)
                  }
                 }
                },
            });
        }
    },
    created() {
      this.getJournal()
    },
    computed: {
      justifyOptions() { return [
        {icon: 'pi pi-align-left', value: 'Left', command: () => { this.activeElement.textAlign = "left"; this.calcStyle() }},
        {icon: 'pi pi-align-right', value: 'Right', command: () => { this.activeElement.textAlign = "right"; this.calcStyle() }},
        {icon: 'pi pi-align-center', value: 'Center', command: () => { this.activeElement.textAlign = "center"; this.calcStyle() }},
        {icon: 'pi pi-align-justify', value: 'Justify', command: () => { this.activeElement.textAlign = "justify"; this.calcStyle() }}
      ]}
    },
}
</script>
<style scoped>
    .parent {
      height: 595px;
      width: 842px;
      border: 1px solid #000;
      user-select: none;
      position:fixed;
    }

   
    .draggable {
        cursor: move;
    }
    .on {
        fill: pink;
        stroke: red;
        stroke-width: 2;
    }
</style>