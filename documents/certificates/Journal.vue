<template>
    <div>
     <BlockUI :blocked="loading" :fullScreen="true">
     </BlockUI>
         <div class="col-12">
           <TitleBlock :title="$t('course.certificate.title')" />
             <div class="card">
         <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>
         <Button  v-if="findRole(null,'student')" @click="getStudentCertificates()"
            :label="$t('common.downloadCertificate')"
            type="button"
            class="p-button-info" />
         <DataTable
         v-if="journal"
         selectionMode="single"
           v-model:selection="template"
           :lazy="true"
           :totalRecords="count"
           :value="journal"
           @page="onPage($event)"
           :paginator="true"
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
           <Column :field="'course.name' + $i18n.locale" :header="$t('common.nameIn')"></Column>
           <Column :field="'course.organizer.name' + $i18n.locale" :header="$t('course.organizers')"></Column>
           <Column field="number" :header="$t('common.number')"></Column>
           <Column :header="$t('course.certificate.issueDate')">
            <template #body="slotProps">
            {{ getShortDateString(slotProps.data.issueDate) }}
            </template>
           </Column>

           <Column headerStyle="width:60px;">
             <template #body="slotProps">
               <Button class="p-button-text p-1 mr-2"  @click="openCertificate(slotProps.data.uuid)">
                 <i class="fa-solid fa-eye fa-xl"></i>
               </Button>
             </template>
           </Column>
         </DataTable>
             </div>
         </div>
     </div>
 </template>
 <script>
 
 import Certificate from './Certificate.vue';
 
 import {OnlineCourseService} from "@/service/onlinecourse.service";
 import { smartEnuApi, fileRoute, findRole } from '../../../config/config';
 import { getShortDateString } from "@/helpers/helper";
 export default {
     name: "SertificateJournal",
    
     data() {
         return {
             imageUrl: smartEnuApi + fileRoute,
             closeDialogVisible: false,
             journal: null,
             loading: true,
             count: 0,
             templateEditorVisilble: false,
             saving: false,
             service: new OnlineCourseService(),
             smartEnuApi: smartEnuApi,
             fileRoute: fileRoute,
             activeIndex: 0,
             languages: ["kz", "ru", "en"],
             savedRange: null,
             html: {
               head : `<html><head><style>.vdr-container {position: absolute;} .p-button {visibility: hidden;}</style></head><body>`,
               foot: "</body></html>"
             },
             lazyParams : {
               page: 0,
               rows: 10,
             },
             
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
                         this.saveCertificateTemplate()
                       }
                     })
                   }
                 }
               ],
             
             template: null,  
             activeElement: null,
             selectedElement: null,
         }
     },
     methods: {
      getShortDateString: getShortDateString,
      findRole: findRole,
      getStudentCertificates() {
          this.loading = true
          this.service.getStudentCertificates().then(_ => {
          })
          .finally(()=> {
            this.getJournal()
            this.loading = false
          })
         },
         openCertificate(uuid) {
            let url = this.smartEnuApi +"/document?qrcode="+uuid;
            window.open(url, '_blank');
         },
         getJournal() {
           this.loading = true;
           this.lazyParams.docType = 8
           this.service.getCertificateJournal(this.lazyParams).then(response =>{
             this.journal = response.data.certificates;
             this.count = response.data.count;
             this.loading = false;
           })
           .catch(_=> {
             this.loading = false;
           })
         },
         
         onPage(event) {
           this.lazyParams = event;
           this.getJournal();
         }, 
         closeTemplateEditor() {
          this.templateEditorVisilble = false;
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
             this.change();
             this.$nextTick(() => {
               this.$refs[this.languages[this.activeIndex] + this.template.params.indexOf(this.activeElement)].active = true
               
               return
             })
             return
           }
           this.addPictureDialogVisible = true;
         },
     },
     created() {
       this.getJournal()
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
 
    
    
     .on {
         fill: pink;
         stroke: red;
         stroke-width: 2;
     }
 </style>