<template>
   <div>
    <BlockUI :blocked="loading" :fullScreen="true">
    </BlockUI>
		<div class="col-12">
      <TitleBlock :title="$t('course.certificate.template')" />
			<div class="card">
        <ProgressBar v-if="loading" mode="indeterminate" style="height: .5em"/>

        <Toolbar>
          <template #end>
            <Button :label="$t('common.add')" @click="this.inittialNewTemplate();templateEditorVisilble=true;" icon="pi pi-plus" />
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
          <template #empty>{{
            this.$t("common.recordsNotFound")
          }}</template>
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
    <Sidebar v-model:visible="templateEditorVisilble" position="full" :showCloseIcon="false">
      <Certificate @closed="closeTemplateEditor" :modelValue="template"></Certificate>
    </Sidebar>
     <!-- Шаблон атауын беру диалогы -->
     <Dialog :header="$t('doctemplate.newTemplate') " v-model:visible="newTemplateDialogVisible" :modal="true"  :breakpoints="{'960px': '75vw', '640px': '90vw'}" :style="{width: '50vw'}">
      <div class="p-fluid">
        <label class="mb-1" style="width:100%" >{{ $t("common.name") }}</label>
				<InputText class="mt-1" style="width:100%" id="templateName" type="text" v-model="template.name" />
        <div style="width: 100%; text-align: center;">
          <ProgressSpinner v-if="saving" aria-label="Basic ProgressSpinner" />
        </div>
        </div>
      <template #footer>
        <div class="p-fluid">
          <Button :label="$t('common.save')" :disabled="!(template.name && template.name.trim() != '')" @click="saveCertificateTemplate" class="p-button-primary"/>
          <Button :label="$t('common.cancel')" @click="newTemplateDialogVisible=false"  class="mt-1 p-button-secondary p-button-outlined"/>
        </div> 
      </template>
    </Dialog>
    
	</div>
</template>
<script>

import {OnlineCourseService} from "@/service/onlinecourse.service";
import Certificate from './Certificate.vue';
import TitleBlock from "@/components/TitleBlock"
export default {
    name: "Templates",
    components: {Certificate},
    data() {
        return {
            journal: null,
            loading: true,
            count: 0,
            templateEditorVisilble: false,
            service: new OnlineCourseService(),
            template: null,
            lazyParams : {
              page: 0,
              rows: 10,
            },
        }
    },
    methods: {
        getJournal() {
          this.loading = true;
          this.lazyParams.docType = 7
          this.service.getCertificateTemplateJournal(this.lazyParams).then(response =>{
            this.journal = response.data.templates;
            this.count = response.data.count;
          })
          .catch((e)=> {
            console.log(e)
          })
          .finally(() => {
            this.loading = false;
          })
        },
        onPage(event) {
          this.lazyParams = event;
          this.getJournal();
        }, 
        closeTemplateEditor() {
          this.templateEditorVisilble = false;
          this.getJournal();
        },
        inittialNewTemplate() {
          this.template =  { 
              name: "",
              params: [
                  {id: -1, name: "img", description:"common", isDeleted:false, value: { url: "enu_logo/bg-orange.jpg", title: "background", rectelement: {z:0, x:0,y:0, w:840, h:593}}},
                  {id: -1, name: "txt", description:"common", active: false, isDeleted:false, value: { name: "organizer", title: "@сourseOrganizer", titlekz: "@курстыҰйымдастырушы", titleru: "@организаторКурса", rectelement: {z:1, x:0,y:80, w:840, h:30}, style:"font-weight:bold;text-align:center;font-size:14px;color:#007dbe;letter-spacing:0px"}},
                  {id: -1, name: "txt", description:"common", active: false, isDeleted:false, value: { name: "certificate", title: "СERTIFICATE", titlekz: "СЕРТИФИКАТ", titleru: "CЕРТИФИКАТ", rectelement: { z:2,x:306,y:120, w:230, h:50}, style:"text-align:center;font-size:32px;color:#007dbe;letter-spacing:2px"}},
                  {id: -1, name: "img", description:"common", active: false, isDeleted:false, value: {url: "enu_logo/qr.png", name: "qr", rectelement: {z:3, x:643,y:380, w:70, h:70}}},
                  {id: -1, name: "img", description:"common", active: false, isDeleted:false, value: {url: "enu_logo/build.png", name: "build", rectelement: {z:4, x:585,y:470, w:170, h:70}}},
                  {id: -1, name: "txt", description:"common", active: false, isDeleted:false, value: { name: "mainText", title: "mainInfo", 
                  titlekz: "Тыңдаушы @тыңдаушыныңТолықАтыЖөні <br>«@курстыңТолықАтауы» онлайн курсын <br> @сағатСаны сағат көлемінде @оқығанКезеңі аралығында<br> сәтті өтті.", 
                  titleru: "Слушатель @полноеИмяСлушателя <br> усепшно прошел(а) <br> онлайн курс «@полноеНаименованиеКурса» <br> @периодОбучения в объеме @количествоЧасов часов.", 
                  titleen: "Listener @listenerFullName <br> has succesfully completed<br> the online course «@fullNameOfCourse» <br> @studyPeriod for @hoursCount hours.", 
                  rectelement: {z:5, x:90,y:190, w:660, h:180}, style:"text-align:center;font-size:24px;color:#000000;letter-spacing:0px"}},
                  {id: -1, name: "txt", description:"common",  value: { name: "number", title: "details", 
                  titlekz: "№ @certificateNumber<br> @certificateDate <br> Астана қаласы", 
                  titleru: "№ @certificateNumber<br> @certificateDate <br> город Астана", 
                  titleen: "№ @certificateNumber<br> @certificateDate <br> Astana city", 
                  rectelement: {z:6, x:90,y:490, w:160, h:60}, style:"font-size:10px;color:#000000;letter-spacing:0px"}},
                  {id: -1, name: "img", description:"kz", active: false, isDeleted:false,  value: {url:  "enu_logo/logo-kz.png", title: "logo", rectelement: {z:7, x:340,y:15, w:163, h:60}}},
                  {id: -1, name: "img", description:"ru", active: false, isDeleted:false,  value:{url:  "enu_logo/logo-en.png", title: "logo", rectelement: {z:8, x:349,y:15, w:144, h:60}}},
                  {id: -1, name: "img", description:"en", active: false, isDeleted:false,  value: {url: "enu_logo/logo-en.png", title: "logo", rectelement: {z:9,x:349,y:15, w:144, h:60}}},
                  {id: -1, name: "text", description:"kz", active: false, isDeleted:false,  value: ""},
                  {id: -1, name: "text", description:"en", active: false, isDeleted:false,  value: ""},
                  {id: -1, name: "text", description:"ru", active: false, isDeleted:false,  value: ""},
                  
            ],
            };  
        },
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