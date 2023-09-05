<template>
  <div>
    <div class="col-12">
      <Toolbar class="mb-4">
        <template #end>
          <Button v-if="findRole(null, 'dissertation_council_secretary')" isSecretary icon="pi pi-plus"
            class="p-button-success mr-2" @click="showAddCouncilDialog()" />
          <Button v-if="findRole(null, 'dissertation_council_secretary')"
            :disabled="(!selectedDoctoral || (selectedDoctoral && selectedDoctoral.meetingTime))" icon="pi pi-clock"
            class="p-button-warning mr-2" @click="showDialog(dialog.setMeetingTime)"
            v-tooltip.top="$t('dissertation.setMeetingTime')" />
          <Button v-if="selectedDoctoral && selectedDoctoral.meetingTime" icon="pi pi-shield"
            class="p-button-success mr-2" @click="showDefenseDialog()"
            v-tooltip.top="$t('dissertation.defenseConduct')" />
          <Button icon="pi pi-print" class="p-button-info mr-2" />
          <Button v-if="isSecretary" icon="pi pi-trash" class="p-button-danger" @click="deleteDissertation()"
            :disabled="!selectedDoctoral" />
        </template>
        <template #start>
          <h4>{{ $t("dissertation.doctorals") }}</h4>
        </template>
      </Toolbar>
      <DataTable selectionMode="single" v-model:selection="selectedDoctoral" style="font-size: smaller" :lazy="true"
        :totalRecords="doctoralCount" :value="DoctoralList" @page="reload($event)" :paginator="true"
        :rows="lazyParams.rows" dataKey="dissertation.id" :rowHover="true" :loading="loading"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 25, 50]" :currentPageReportTemplate="$t('common.showingRecordsCount', {
          first: '{first}',
          last: '{last}',
          totalRecords: '{totalRecords}',
        })
          " responsiveLayout="scroll" @sort="reload($event)" @filter="reload($event)">
        <Column field="speciality" :header="$t('dissertation.directionCode')">
          <template #body="slotProps">
            <span> {{ slotProps.data.speciality.trainingDirection.code + '-' +
              slotProps.data.speciality.trainingDirection.nameInKz }}</span>

          </template>
        </Column>
        <Column field="speciality" :header="$t('dissertation.specialityCode')">
          <template #body="slotProps">
            <span> {{ slotProps.data.speciality.code + '-' + slotProps.data.speciality.nameInKz }}</span>

          </template>
        </Column>
        <Column field="user.fullName" :header="$t('common.fullName')" :sortable="true"></Column>
        <Column field="user.organization.name" :header="$t('common.graduate')"></Column>
        <Column :header="$t('common.graduationyear')">
          <template #body="slotProps">
            {{ getShortDateString(slotProps.data.graduationYear) }}
          </template>
        </Column>
        <Column :header="$t('common.admissionyear')">
          <template #body="slotProps">
            {{ getShortDateString(slotProps.data.admissionYear) }}
          </template>
        </Column>
        <Column :field="'dissertation.name' + $i18n.locale" :header="$t('dissertation.disstitle')" :sortable="true">
        </Column>
        <Column field="meetingTime" :sortable="true" :header="$t('dissertation.meetingTime')">
          <template #body="slotProps">
            {{ (slotProps.data.meetingTime != null ? getLongDateString(slotProps.data.meetingTime) : "") }}
          </template>
        </Column>
        <Column field="dissertation.language" :header="$t('dissertation.defenseLang')">
          <template #body="slotProps">
            <span v-if="slotProps.data.dissertation.language == 1">{{ $t('common.language.kz') }}</span>
            <span v-else-if="slotProps.data.dissertation.language == 2">{{ $t('common.language.ru') }}</span>
            <span v-else-if="slotProps.data.dissertation.language == 3">{{ $t('common.language.en') }}</span>
          </template>
        </Column>
        <Column field="councilDecision" :header="$t('dissertation.councilDecision')">
          <template #body="slotProps">
            <span>{{ $t('dissertation.states.s' + slotProps.data.dissertation.state) }}</span>
          </template>
        </Column>
      </DataTable>
      <Dialog v-model:visible="dialog.addDoctoral.state" :style="{ width: '600px' }"
        :header="$t('dissertation.doctoralCard')" :modal="true" :maximizable="true" class="p-fluid">
        <div class="grid formgrid">
          <div class="col-12 mb-2 pb-2 lg:col-6 mb-lg-0">
            <label for="name">{{ $t("common.fullName") }}</label>
            <FindUser class="pt-1" v-model="selectedUsers" :max="1" :editMode="true" :user-type="0"></FindUser>
            <small class="p-error" v-if="submitted && validationErrors.user">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-6 mb-lg-0">
            <label for="name">{{ ($t("common.graduate") + ' (' + $t('common.hei') + ')') }}</label>
            <DepartmentList class="pt-1" :autoLoad="true" v-model="doctoral.hei" :orgType="1" :editMode="true"
              @changed="getDepartments($event, $refs.departmentList)"></DepartmentList>
            <small class="p-error" v-if="submitted && validationErrors.hei">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-6 mb-lg-0">
            <label for="name">{{ $t("common.faculty") }}</label>
            <DepartmentList class="pt-1" ref="departmentList" :orgType="2" v-model="selectedDepartment" :editMode="true"
              @changed="getDepartments($event, $refs.cafedraList)"></DepartmentList>
            <small class="p-error" v-if="submitted && validationErrors.faculty">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-6 mb-lg-0">
            <label for="name">{{ $t("common.cafedra") }}</label>
            <DepartmentList class="pt-1" ref="cafedraList" :orgType="3" v-model="doctoral.cafedra" :editMode="true">
            </DepartmentList>
            <small class="p-error" v-if="submitted && validationErrors.cafedra">{{ $t("common.requiredField") }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-6 mb-lg-0">
            <label for="speciality">{{ $t('dissertation.specialityCode') }}</label>
            <SpecialitySearch :style="'height:38px'" class="pt-1" :max="1"
              :educationLevel="Enums.EducationLevel.Doctorate" v-model="selectedSpecialities" id="speciality">
            </SpecialitySearch>
            <small class="p-error" v-if="(submitted && validationErrors.speciality)">{{
              $t('dissertation.validationErrors.selectSpeciality') }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-6 mb-lg-0">
            <label for="name">{{ $t('common.learnlang') }}</label>
            <SelectButton style="height:35px" v-model="doctoral.teachlang" :options="language" class="mt-1">
              <template #option="slotProps">
                <div v-if="slotProps.option == 1">{{ $t('common.language.kz') }}</div>
                <div v-else-if="slotProps.option == 2">{{ $t('common.language.ru') }}</div>
                <div v-else>{{ $t('common.language.en') }}</div>
              </template>
            </SelectButton>
            <small class="p-error" v-if="(submitted && validationErrors.teachlang)">{{ $t('common.requiredField')
            }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-6 mb-lg-0">
            <label for="name">{{ $t('common.graduationyear') }}</label>
            <PrimeCalendar :placeholder="$t('common.select')" style="height:33px" class="pt-1" id="graduationyear"
              v-model="doctoral.graduationYear" view="year" dateFormat="yy" />
            <small class="p-error" v-if="(submitted && validationErrors.graduationYear)">{{ $t('common.requiredField')
            }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-6 mb-lg-0">
            <label for="name">{{ $t('common.admissionyear') }}</label>
            <PrimeCalendar :placeholder="$t('common.select')" style="height:33px" class="pt-1" id="admissionyear"
              v-model="doctoral.admissionYear" view="year" dateFormat="yy" />
            <small class="p-error" v-if="(submitted && validationErrors.admissionYear)">{{ $t('common.requiredField')
            }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-12 mb-lg-0">
            <label for="namekz">{{ $t('dissertation.disstitle') + ' ' + $t('common.language.kz') }}</label>
            <InputText :placeholder="$t('common.enter')" class="pt-1" type="text" id="namekz"
              v-model="doctoral.dissertation.namekz" />
            <small class="p-error" v-if="(submitted && validationErrors.namekz)">{{ $t('common.requiredField') }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-12 mb-lg-0">
            <label for="nameru">{{ $t('dissertation.disstitle') + ' ' + $t('common.language.ru') }}</label>
            <InputText :placeholder="$t('common.enter')" class="pt-1" type="text" id="nameru"
              v-model="doctoral.dissertation.nameru" />
            <small class="p-error" v-if="(submitted && validationErrors.nameru)">{{ $t('common.requiredField') }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-12 md:col-6 mb-lg-0">
            <label for="nameen">{{ $t('dissertation.disstitle') + ' ' + $t('common.language.en') }}</label>
            <InputText :placeholder="$t('common.enter')" class="pt-1" type="text" id="nameen"
              v-model="doctoral.dissertation.nameen" />
            <small class="p-error" v-if="(submitted && validationErrors.nameen)">{{ $t('common.requiredField') }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-12 mb-lg-0">
            <label for="namekz">{{ $t('common.annotation') + ' ' + $t('common.language.kz') }}</label>
            <Textarea :placeholder="$t('common.enter')" class="pt-1" type="text" id="annotationkz"
              v-model="doctoral.dissertation.annotation.kz" />
            <small class="p-error" v-if="(submitted && validationErrors.annotationkz)">{{ $t('common.requiredField')
            }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-12 mb-lg-0">
            <label for="nameru">{{ $t('common.annotation') + ' ' + $t('common.language.ru') }}</label>
            <Textarea :placeholder="$t('common.enter')" class="pt-1" type="text" id="annotaionru"
              v-model="doctoral.dissertation.annotation.ru" />
            <small class="p-error" v-if="(submitted && validationErrors.annotationru)">{{ $t('common.requiredField')
            }}</small>
          </div>
          <div class="col-12 pb-2 lg:col-12 md:col-6 mb-lg-0">
            <label for="nameen">{{ $t('common.annotation') + ' ' + $t('common.language.en') }}</label>
            <Textarea :placeholder="$t('common.enter')" class="pt-1" type="text" id="annotationen"
              v-model="doctoral.dissertation.annotation.en" />
            <small class="p-error" v-if="(submitted && validationErrors.annotationen)">{{ $t('common.requiredField')
            }}</small>
          </div>
          <Fieldset :legend="'Файлы'" class="col-12" toggleable>
            <div class="field">
              <label for="abstractfile">{{ $t('dissertation.abstractFile') + ' ' + $t('common.docFormat') }}</label>
              <CustomFileUpload @upload="uploadFile($event, 'abstractFile')" v-model="abstractFile"
                :accept="'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'"
                :multiple="false" />
              <small class="p-error" v-if="(submitted && validationErrors.abstractFile)">{{ $t('common.requiredField')
              }}</small>
            </div>
            <div class="field">
              <label for="dissertationfile">{{ $t('dissertation.dissertationFile') + ' ' + $t('common.docFormat')
              }}</label>
              <CustomFileUpload @upload="uploadFile($event, 'dissertationFile')" v-model="dissertationFile"
                :accept="'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'"
                :multiple="false" />
              <small class="p-error" v-if="(submitted && validationErrors.dissertationFile)">{{ $t('common.requiredField')
              }}</small>
            </div>
            <div class="field">
              <label for="swList">{{ $t('dissertation.swList') + ' ' + $t('common.pdfFormat') }}</label>
              <CustomFileUpload @upload="uploadFile($event, 'swListFile')" v-model="swListFile"
                :accept="'application/pdf'" :multiple="false" />
              <small class="p-error" v-if="(submitted && validationErrors.swListFile)">{{ $t('common.requiredField')
              }}</small>
            </div>
            <div class="field">
              <label>{{ $t('dissertation.scientificConsultant') + ' ' + $t('common.pdfFormat') }}</label>
              <CustomFileUpload @upload="uploadFile($event, 'scientificConsultantFile')"
                v-model="scientificConsultantFile" :accept="'application/pdf'" :multiple="false" />
              <small class="p-error" v-if="(submitted && validationErrors.scientificConsultantFile)">{{
                $t('common.requiredField') }}</small>
            </div>
            <div class="field">
              <label>{{ $t('dissertation.foreignConsultant') + ' ' + $t('common.pdfFormat') }}</label>
              <CustomFileUpload @upload="uploadFile($event, 'foreignConsultantFile')" v-model="foreignConsultantFile"
                :accept="'application/pdf'" :multiple="false" />
              <small class="p-error" v-if="(submitted && validationErrors.foreignConsultantFile)">{{
                $t('common.requiredField') }}</small>
            </div>
            <div class="field">
              <label>{{ $t('dissertation.commissionConclusion') + ' ' + $t('common.pdfFormat') }}</label>
              <CustomFileUpload @upload="uploadFile($event, 'commissionConclusionFile')"
                v-model="commissionConclusionFile" :accept="'application/pdf'" :multiple="false" />
              <small class="p-error" v-if="(submitted && validationErrors.commissionConclusionFile)">{{
                $t('common.requiredField') }}</small>
            </div>
            <div class="field">
              <label>{{ $t('dissertation.reviewerComment') + ' ' + $t('common.pdfFormat') }}</label>
              <CustomFileUpload @upload="uploadFile($event, 'reviewer1CommentFile')" v-model="reviewer1CommentFile"
                :accept="'application/pdf'" :multiple="false" />
              <small class="p-error" v-if="(submitted && validationErrors.reviewer1CommentFile)">{{
                $t('common.requiredField') }}</small>
            </div>
            <div class="field">
              <label>{{ $t('dissertation.reviewerComment') + ' ' + $t('common.pdfFormat') }}</label>
              <CustomFileUpload @upload="uploadFile($event, 'reviewer2CommentFile')" v-model="reviewer2CommentFile"
                :accept="'application/pdf'" :multiple="false" />
              <small class="p-error" v-if="(submitted && validationErrors.reviewer2CommentFile)">{{
                $t('common.requiredField') }}</small>
            </div>
          </Fieldset>
        </div>
        <template #footer>
          <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text"
            @click="hideDialog(dialog.addDoctoral)" />
          <Button :label="$t('common.add')" icon="pi pi-check" class="p-button-text" @click="addDoctoral" />
        </template>
      </Dialog>
      <Dialog v-model:visible="dialog.setMeetingTime.state" :style="{ width: '600px' }"
        :header="$t('dissertation.setMeetingTime')" :modal="true" :maximizable="true" class="p-fluid">
        <div>
          <label for="doctoralName">{{ $t("common.fullName") }}</label>
          <InputText id="doctoralName" class="pt-2 mb-2" type="text" readonly="true"
            v-model="selectedDoctoral.user.fullName" />
        </div>
        <div>
          <label for="defenseLanguage">{{ $t("dissertation.defenseLang") }}</label>
          <SelectButton id="defenseLanguage" style="height:35px" v-model="selectedDoctoral.dissertation.language"
            :options="language" class="mt-1 mb-2">
            <template #option="slotProps">
              <div v-if="slotProps.option == 1">{{ $t('common.language.kz') }}</div>
              <div v-else-if="slotProps.option == 2">{{ $t('common.language.ru') }}</div>
              <div v-else-if="slotProps.option == 3">{{ $t('common.language.en') }}</div>
            </template>
          </SelectButton>
          <small class="p-error" v-if="(submitted && validationErrorsSetMeetingTime.defenseLanguage)">{{
            $t('common.requiredField') }}</small>
        </div>
        <div>
          <label for="meetingTime">{{ $t("dissertation.meetingTime") }}</label>
          <PrimeCalendar id="meetingTime" :placeholder="$t('common.select')" style="height:33px" class="pt-1"
            v-model="selectedDoctoral.meetingTime" :showTime="true" :showIcon="true" :stepMinute="10" :manualInput="true"
            dateFormat="dd.mm.yy" />
          <small class="p-error" v-if="(submitted && validationErrorsSetMeetingTime.meetingTime)">{{
            $t('common.requiredField') }}</small>
        </div>
        <div>
          <label for="meetingUrl">{{ $t("common.meetingUrl") }}</label>
          <InputText id="meetingUrl" class="pt-2 mb-2" type="text" v-model="selectedDoctoral.dissertation.meetingUrl" />
          <small class="p-error" v-if="(submitted && validationErrorsSetMeetingTime.meetingUrl)">{{
            $t('common.requiredField') }}</small>
        </div>
        <div>
          <label for="meetingPlace">{{ $t("common.meetingPlace") }}</label>
          <InputText id="meetingUrl" class="pt-2 mb-2" type="text" v-model="selectedDoctoral.dissertation.meetingPlace" />
          <small class="p-error" v-if="(submitted && validationErrorsSetMeetingTime.meetingPlace)">{{
            $t('common.requiredField') }}</small>
        </div>
        <div>
          <Button icon="pi pi-download" :label="$t('dissertation.dissertationFile')"
            @click="downloadFile(selectedDoctoral.dissertation.dissFile)" />
        </div>

        <template #footer>
          <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text"
            @click="hideDialog(dialog.setMeetingTime)" />
          <Button :label="$t('common.confirm')" icon="pi pi-check" class="p-button-text" @click="confirmSetMeetingTime" />
        </template>
      </Dialog>
      <Dialog v-model:visible="dialog.setMeetingTimeConfirm.state" :style="{ width: '600px' }"
        :header="$t('dissertation.setMeetingTime')" :modal="true" :maximizable="true" class="p-fluid">
        <div class="field">
          <Message :severity="'info'" icon="fa-solid fa-circle-info" :closable="false">
            {{ $t('dissertation.setMeetingTimeConfirmMsg', { btn: $t('common.yes') }) }}
          </Message>
        </div>
        <div class="field">
          <label><b>{{ $t('common.fullName') }}</b></label>
          <div>{{ selectedDoctoral.user.fullName }}</div>
        </div>
        <div class="field">
          <label><b>{{ $t('dissertation.disstitle') }}</b></label>
          <div>{{ selectedDoctoral.dissertation['name' + $i18n.locale] }}</div>
        </div>
        <div class="field">
          <label><b>{{ $t('common.cafedra') + '/' + $t('common.speciality') }}</b></label>
          <div>{{
            $t('common.cafedra') + ' ' + selectedDoctoral.cafedra['name' + upFirstLetter($i18n.locale)] + '/' +
            $t('common.speciality') + ' "' + selectedDoctoral.speciality['nameIn' + upFirstLetter($i18n.locale)] + '"'
          }}
          </div>
        </div>
        <div class="field">
          <label><b>{{ $t('dissertation.defenseLang') }}</b></label>
          <div>{{
            selectedDoctoral.dissertation.language === 1 ? $t('common.language.kz') :
            selectedDoctoral.dissertation.language === 2 ? $t('common.language.ru') : $t('common.language.en')
          }}
          </div>
        </div>
        <div class="field">
          <label><b>{{ $t('dissertation.reviewers') }}</b></label>
          <template v-if="memberList !== 0">
            <div v-for="(item, index) in initMembers('dissertation_council_reviewer')" :key="index">
              {{ item.fullName }}
            </div>
          </template>
          <div><small><a href="javascript:void(0)" @click="showDialog(dialog.addMember)">{{ $t('common.add')
          }}</a></small></div>
        </div>
        <div class="field">
          <label><b>{{ $t('dissertation.tempMember') }}</b></label>
          <template v-if="memberList !== 0">
            <div v-for="(item, index) in initMembers('dissertation_council_temporary_member')" :key="index">
              {{ item.fullName }}
            </div>
          </template>
          <div><small><a href="javascript:void(0)" @click="showDialog(dialog.addMember)">{{ $t('common.add')
          }}</a></small></div>
        </div>
        <div class="field">
          <label><b>{{ $t('dissertation.advisors') }}</b></label>
          <template v-if="memberList !== 0">
            <div v-for="(item, index) in initMembers('dissertation_council_consultant')" :key="index">
              {{ item.fullName }}
            </div>
          </template>
          <div><small><a href="javascript:void(0)" @click="showDialog(dialog.addMember)">{{ $t('common.add')
          }}</a></small></div>
        </div>
        <div class="field">
          <label><b>{{ $t('dissertation.meetingTime') }}</b></label>
          <div>{{ selectedDoctoral.meetingTime ? getLongDateString(selectedDoctoral.meetingTime) : "Нет данных" }}</div>
        </div>
        <div class="field">
          <label><b>{{ $t('common.meetingUrl') }}</b></label>
          <div>{{ selectedDoctoral.dissertation.meetingUrl || $t('common.noData') }}</div>
        </div>
        <div class="field">
          <label><b>{{ $t('common.address') }}</b></label>
          <div>{{ selectedDoctoral.dissertation.meetingPlace }}</div>
        </div>
        <template #footer>
          <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text"
            @click="hideDialog(dialog.setMeetingTimeConfirm)" />
          <Button :label="$t('common.yes')" icon="pi pi-check" class="p-button-text" @click="setMeetingTime" />
        </template>
      </Dialog>
      <Dialog v-model:visible="dialog.defenseConduct.state" :style="{ width: '600px' }"
        :header="$t('dissertation.defenseConduct')" :modal="true" :maximizable="true" class="p-fluid">

        <div
          v-if="!(selectedDoctoral && selectedDoctoral.dissertation.state == dissertationState.VotingFinished) && !(isDissertationMember && ((currentMemberState === memberState.Registered && selectedDoctoral.dissertation.state === dissertationState.VotingStarted) || (currentMemberState === memberState.Voted && selectedDoctoral.dissertation.state === dissertationState.VotingRestarted)))">
          <div>
            <label for="doctoralName">{{ $t("common.fullName") }}</label>
            <InputText id="doctoralName" class="pt-2 mb-2" type="text" readonly="true"
              v-model="selectedDoctoral.user.fullName" />
          </div>

          <div>
            <label for="meetingTime">{{ $t("dissertation.meetingTime") }}</label>
            <PrimeCalendar id="meetingTime" :placeholder="$t('common.select')" style="height:33px" class="pt-1"
              v-model="selectedDoctoral.meetingTime" :showTime="true" :showIcon="true" :stepMinute="10"
              :manualInput="true" dateFormat="dd.mm.yy" />
            <small class="p-error" v-if="(submitted && validationErrorsSetMeetingTime.meetingTime)">{{
              $t('common.requiredField') }}</small>
          </div>
          <div class="pt-2">
            <label for="meetingUrl">{{ $t("common.meetingUrl") }}</label>
            <InputText id="meetingUrl" class="pt-2 mb-2" type="text" v-model="selectedDoctoral.dissertation.meetingUrl" />
            <small class="p-error" v-if="(submitted && validationErrorsSetMeetingTime.meetingUrl)">{{
              $t('common.requiredField') }}</small>
          </div>
          <div v-if="memberList && !regInfoDetail">
            <b>{{ $t('dissertation.members') }}</b>
            <DataTable class="pt-2" v-if="memberList && !regInfoDetail" :loading="loading" :value="memberList"
              showGridlines responsiveLayout="scroll">
              <Column field="fullName" :header="$t('common.fullName')"></Column>
              <!-- <Column field="state" :header="$t('common.state')">
                <template #body="slotProps">
                  <span v-if="slotProps.data.state == 0" class="p-tag p-tag-warning">{{ $t('common.states.notRegistered')
                  }}</span>
                  <span v-else class="p-tag p-tag-success">{{ $t('common.states.registered') }}</span>

                </template>
              </Column> -->
              <Column field="remove">
                <template #body="slotProps">
                  <Button type="button" icon="pi pi-trash p-button-icon" class="p-button-sm p-button-danger"
                    @click="deleteMember(slotProps.data.memberID)" />

                </template>
              </Column>

            </DataTable>


          </div>

          <div class="pt-2">
            <Button icon="pi pi-download" :label="$t('dissertation.dissertationFile')"
              @click="downloadFile(selectedDoctoral.dissertation.dissFile)" />
          </div>
        </div>

        <div class="pt-2"
          v-if="regInfo && (selectedDoctoral.dissertation.state == dissertationState.ReadyToRegister || selectedDoctoral.dissertation.state == dissertationState.RegistrationFinished)">
          <a href="javascript:void(0)" @click="startNewRegistration">{{ $t('dissertation.addMemeberToDisCouncil') }}</a>
          <div class="pt-2"></div>
          <ProgressBar v-if="progress < 100" :value="progress"></ProgressBar>
        </div>

        <div class="pt-2"></div>
        <DataTable
          v-if="regInfo && (selectedDoctoral.dissertation.state == dissertationState.ReadyToRegister || selectedDoctoral.dissertation.state == dissertationState.RegistrationFinished)"
          :loading="loading" :value="regInfo" showGridlines responsiveLayout="scroll">
          <Column field="voterType" :header="$t('dissertation.members')">
            <template #body="slotProps">
              {{
                slotProps.data.voterType == 0 ? $t('dissertation.permanentMember') : slotProps.data.voterType == 1 ?
                $t('dissertation.tempMember') : $t('dissertation.reviewers')
              }}
            </template>
          </Column>
          <Column field="total" :header="$t('common.total')"></Column>
          <Column field="registered" :header="$t('common.registered')"></Column>
        </DataTable>
        <div class="pt-2"></div>
        <DataTable
          v-if="regInfoDetail && isSecretary && selectedDoctoral.dissertation.state == dissertationState.ReadyToRegister"
          :loading="loading" :value="regInfoDetail" showGridlines responsiveLayout="scroll">
          <Column field="fullName" :header="$t('common.fullName')"></Column>
          <Column field="state" :header="$t('common.state')">
            <template #body="slotProps">
              <span v-if="slotProps.data.state == 0" class="p-tag p-tag-warning">{{ $t('common.states.notRegistered')
              }}</span>
              <span v-else class="p-tag p-tag-success">{{ $t('common.states.registered') }}</span>

            </template>
          </Column>

        </DataTable>
        <DataTable
          v-if="regInfoDetail && isSecretary && (selectedDoctoral.dissertation.state == dissertationState.VotingStarted || selectedDoctoral.dissertation.state == dissertationState.VotingFinished)"
          :loading="loading" :value="regInfoDetail" showGridlines responsiveLayout="scroll">
          <Column field="fullName" :header="$t('common.fullName')"></Column>
          <Column field="vote" :header="$t('common.state')">
            <template #body="slotProps">
              <span v-if="slotProps.data.voted == 0" class="p-tag p-tag-warning">{{ $t('common.states.notVoted') }}</span>
              <span v-else class="p-tag p-tag-success">{{ $t('common.states.voted') }}</span>
            </template>
          </Column>
        </DataTable>

        <div v-if="voteInfo">
          <h3>{{ $t('common.voting') }}</h3>
          <p>
            <span>{{ $t('common.registered') }}</span>: {{ voteInfo.total }}
          </p>
          <p>
            <span>{{ $t('common.voted') }}</span>:
            {{ (selectedDoctoral.dissertation.state === dissertationState.VotingRestarted ? voteInfo.voted2 :
              voteInfo.voted) }}
          </p>
          <ProgressBar
            :value="(Math.floor(((selectedDoctoral.dissertation.state === dissertationState.VotingRestarted ? voteInfo.voted2 : voteInfo.voted) / voteInfo.total) * 100))" />
          <div
            v-if="voteInfo && (selectedDoctoral.dissertation.state > dissertationState.VotingStarted && selectedDoctoral.dissertation.state != dissertationState.VotingRestarted)">
            <div ref="report">

              <div v-if="isDissertationAdmin" :style="printStyle">
                <h4>{{ $t('dissertation.protocol') }}</h4>
                <p style="text-align:left">
                  <b>{{ $t('common.fullName') }}:</b>&nbsp;{{ selectedDoctoral.user.fullName }}<br />
                  <b>{{ $t('dissertation.directionCode') }}:&nbsp;</b>{{
                    selectedDoctoral.speciality.trainingDirection.code + '-' +
                    selectedDoctoral.speciality.trainingDirection.nameInKz
                  }}<br />
                  <b>{{ $t('dissertation.specialityCode') }}:&nbsp;</b>{{
                    selectedDoctoral.speciality.code + '-' + selectedDoctoral.speciality.nameInKz
                  }}<br />
                  <b>{{ $t('dissertation.disstitle') }}:&nbsp;</b>{{ selectedDoctoral.dissertation['name' + $i18n.locale]
                  }}<br />
                  <b>{{ $t('dissertation.meetingTime') }}:&nbsp;</b>{{
                    selectedDoctoral.meetingTime.replace('T', ' ').substring(0, selectedDoctoral.meetingTime.length - 4)
                  }}<br />
                  <b>{{ $t('dissertation.defenseLang') }}:&nbsp;</b>{{ $t('common.language.ln' +
                    selectedDoctoral.dissertation.language) }}<br />
                  <br />
                </p>

              </div>
              <DataTable ref="voteReport" :loading="loading" :value="voteInfo.votes" showGridlines
                responsiveLayout="scroll">

                <Column>
                  <template #body="slotProps">
                    {{ $t('dissertation.vote.v' + slotProps.data.type) }}
                  </template>
                </Column>
                <Column field="count" :header="$t('common.voted')"></Column>
              </DataTable>
            </div>
            <Button v-if="isDissertationAdmin" :label="$t('common.protocol')" icon="pi pi-download"
              @click="exportReport" />
          </div>
        </div>
        <h4
          v-if="(selectedDoctoral.dissertation.state == dissertationState.Accepted || selectedDoctoral.dissertation.state == dissertationState.Revision || selectedDoctoral.dissertation.state == dissertationState.ReDefense || selectedDoctoral.dissertation.state == dissertationState.Reject) == true">
          {{
            $t('common.votedFor', {
              result: (
                selectedDoctoral.dissertation.state == dissertationState.Accepted ? $t('dissertation.vote.v1') :
                  selectedDoctoral.dissertation.state == dissertationState.Revision ? $t('dissertation.vote.v2') :
                    selectedDoctoral.dissertation.state == dissertationState.ReDefense ? $t('dissertation.vote.v3') :
                      $t('dissertation.vote.v4')),
            })
          }}
        </h4>
        <div
          v-if="(isDissertationMember || isSecretary) && ((currentMemberState === memberState.Registered && selectedDoctoral.dissertation.state === dissertationState.VotingStarted) || (currentMemberState === memberState.Voted && selectedDoctoral.dissertation.state === dissertationState.VotingRestarted))">
          <h3 v-if="selectedDoctoral.dissertation.state === dissertationState.VotingRestarted" class="p-error">
            {{ $t('dissertation.message.votingRestarted') }}</h3>

          <div id="keyword">
            <p ref="content" style="border: 1px solid blue;margin-top:5px;padding: 5px;">{{ $t("common.voteKeyword")
            }}:&nbsp;<span style="text-decoration: underline;font-weight: bold;">{{ password }}</span>
              <br><small class="p-error">{{ $t('dissertation.message.saveKey') }}</small>

            </p>
            <Button :label="$t('common.downloadPassword')" class="p-button-text" @click="download()" />
          </div>
          <div class="field-radiobutton"
            v-if="(isDissertationMember || isSecretary) && currentMemberState === memberState.Registered && selectedDoctoral.dissertation.state === dissertationState.VotingStarted">
            <RadioButton id="vote1" name="vote" value="1" v-model="currentMemberVote" />
            <label for="city1">{{ $t('dissertation.vote.v1') }}</label>
          </div>
          <div class="field-radiobutton">
            <RadioButton id="vote2" name="vote" value="2" v-model="currentMemberVote" />
            <label for="city2">{{ $t('dissertation.vote.v2') }}</label>
          </div>
          <div class="field-radiobutton">
            <RadioButton id="vote3" name="vote" value="3" v-model="currentMemberVote" />
            <label for="city3">{{ $t('dissertation.vote.v3') }}</label>
          </div>
          <div class="field-radiobutton"
            v-if="(isDissertationMember || isSecretary) && currentMemberState === memberState.Registered && selectedDoctoral.dissertation.state === dissertationState.VotingStarted">
            <RadioButton id="vote4" name="vote" value="4" v-model="currentMemberVote" />
            <label for="city4">{{ $t('dissertation.vote.v4') }}</label>
          </div>
        </div>
        <Inplace :closable="true" class="mt-3"
          v-if="(isDissertationMember || isSecretary) && (selectedDoctoral.dissertation.state >= dissertationState.VotingFinished && selectedDoctoral.dissertation.state !== dissertationState.VotingRestarted)">
          <template #display>
            <Button :label="$t('common.checkMyVoice')" class="p-button-text" />
          </template>
          <template #content>
            <div class="p-inputgroup">
              <Button icon="pi pi-check" class="p-button-success" @click="checkMyVoice" />
              <InputText :placeholder="$t('dissertation.message.enterKey')" type="text" id="inputgroup"
                v-model="checkPassword" />
            </div>
          </template>
        </Inplace>
        <Message v-if="errorRegMessage" severity="warn" :closable="false">{{ $t('dissertation.meetingDateMessage') }}

        </Message>
        <template #footer>

          <Button :label="$t('common.close')" icon="pi pi-times" class="p-button-text"
            @click="hideDialog(dialog.defenseConduct)" />

          <Button
            v-if="findRole(null, 'dissertation_council_secretary') && selectedDoctoral.dissertation.state === dissertationState.DefenseDate"
            :label="$t('dissertation.startRegistration')" class="p-button-text" @click="startRegistration" />
          <Button
            v-if="findRole(null, 'dissertation_council_secretary') && selectedDoctoral.dissertation.state === dissertationState.ReadyToRegister"
            :label="$t('dissertation.finishRegistration')" icon="pi pi-check" class="p-button-text"
            @click="ChangeDissertationState(dissertationState.RegistrationFinished)" />
          <Button
            v-if="findRole(null, 'dissertation_council_secretary') && selectedDoctoral.dissertation.state === dissertationState.RegistrationFinished"
            :label="$t('dissertation.startVoting')" class="p-button-text"
            @click="ChangeDissertationState(dissertationState.VotingStarted)" />
          <Button
            v-if="isSecretary && !isDissertationMember && selectedDoctoral.dissertation.state === dissertationState.VotingStarted"
            :label="$t('dissertation.finishVoting')" class="p-button-text"
            @click="ChangeDissertationState(dissertationState.VotingFinished)" />
          <Button
            v-if="isSecretary && !isDissertationMember && selectedDoctoral.dissertation.state === dissertationState.VotingRestarted"
            :label="$t('dissertation.finishVoting')" class="p-button-text"
            @click="ChangeDissertationState(dissertationState.VotingRestarted)" />

          <Button
            v-if="isDissertationMember && !isSecretary && currentMemberState === memberState.NotRegistered && selectedDoctoral.dissertation.state === dissertationState.ReadyToRegister"
            :label="$t('common.register')" class="p-button-text" @click="memberRegister()" />
          <Button
            v-if="(isDissertationMember || isSecretary) && ((currentMemberState === memberState.Registered && selectedDoctoral.dissertation.state === dissertationState.VotingStarted) || (currentMemberState === memberState.Voted && selectedDoctoral.dissertation.state === dissertationState.VotingRestarted))"
            :label="$t('common.vote')" class="p-button-text" @click="vote()" />
          <Button v-if="(isSecretary && selectedDoctoral.dissertation.state === dissertationState.VotingFinished)"
            :label="$t('common.revote')" class="p-button-text"
            @click="ChangeDissertationState(dissertationState.VotingRestarted)" />


          <div
            v-if="isDissertationMember && ((currentMemberState === memberState.NotRegistered && selectedDoctoral.dissertation.state === dissertationState.VotingStarted) || (currentMemberState === memberState.Voted && selectedDoctoral.dissertation.state === dissertationState.VotingRestarted))">
            <small class="p-error">{{ $t('dissertation.message.notRegistered') }}</small>
          </div>


        </template>
      </Dialog>
    </div>
  </div>
  <Sidebar v-model:visible="addMemberVisible" position="right" class="p-sidebar-md " style="overflow-y: scroll">
    <AddMember :councilID="councilID"></AddMember>
  </Sidebar>
  <AddMemberDialog v-if="dialog.addMember.state" :show="dialog.addMember.state" :councilID="selectedDoctoral.councilID"
    :members="memberList" @afterAddMember="hideDialog(dialog.addMember)" @hide="hideDialog(dialog.addMember)" />
</template>
<script>
import { mapState } from "vuex";
import Enums from "@/enum/docstates/index";
import axios from "axios";
import html2pdf from "html2pdf.js";

import { getHeader, findRole, smartEnuApi, downloadFile } from "@/config/config";
import DepartmentList from '../smartenu/DepartmentList.vue';
import SpecialitySearch from "../smartenu/speciality/specialitysearch/SpecialitySearch.vue";
import html2canvas from "html2canvas";
import * as jsPDF from "jspdf";
import { getShortDateString, getLongDateString } from "@/helpers/helper";
import CustomFileUpload from "@/components/CustomFileUpload.vue";
import { upFirstLetter } from "../../helpers/HelperUtil";
import { DissertationService } from "@/service/dissertation.service";
import AddMemberDialog from "@/components/dissertation/AddMemberDialog.vue";
import { locale } from "moment";

export default {
  components: { AddMemberDialog, DepartmentList, SpecialitySearch, CustomFileUpload },
  data() {
    return {
      addMemberVisible: false,
      printStyle: 'display:none;text-align:center',
      heiID: -1,
      councilID: -1,
      currentMemberState: -1,
      currentMemberVote: null,
      checkedVoice: null,
      doctoralCount: -1,
      progress: 0,
      progressBarVisible: true,
      doctoral: {
        cafedra: null,
        hei: null,
        speciality: null,
        user: null,
        admissionYear: null,
        graduationYear: null,
        teachlang: null,
        dissertation: {
          namekz: null,
          nameru: null,
          nameen: null,
          annotation: {
            kz: null,
            ru: null,
            en: null,
          },
        }
      },
      dissertationState: {
        Added: 0,
        DefenseDate: 1,
        ReadyToRegister: 2,
        RegistrationFinished: 3,
        VotingStarted: 4,
        VotingFinished: 5,
        Accepted: 6,
        Revision: 7,
        VotingRestarted: 8,
        ReDefense: 9,
        Reject: 10,
        VotinsFinishedSecondStep: 11,
      },
      memberState: {
        NotRegistered: 0,
        Registered: 1,
        Voted: 2,
        ReVoted: 3,
      },
      abstractFile: null,
      dissertationFile: null,
      swListFile: null,
      scientificConsultantFile: null,
      foreignConsultantFile: null,
      commissionConclusionFile: null,
      reviewer1CommentFile: null,
      reviewer2CommentFile: null,
      language: [1, 2, 3],
      dialog: {
        addDoctoral: {
          state: false,
        },
        deleteDissertation: {
          state: false,
        },
        setMeetingTime: {
          state: false,
        },
        setMeetingTimeConfirm: {
          state: false,
        },
        defenseConduct: {
          state: false,
        },
        addMember: {
          state: false,
        }
      },
      isDissertationMember: false,
      isSecretary: false,
      password: null,
      checkPassword: null,
      regInfo: null,
      regInfoDetail: null,
      errorRegMessage: null,
      voteInfo: null,
      selectedUsers: null,
      selectedDepartment: null,
      selectedDoctoral: null,
      selectedRole: null,
      selectedSpecialities: null,
      selectedMembers: null,
      selectedMember: null,
      Enums: Enums,
      DoctoralList: [],
      DissertationCouncilRoles: [],
      membersCount: 10,
      submitted: false,
      validationErrors: {
        user: false,
        hei: false,
        faculty: false,
        cafedra: false,
        speciality: false,
        admissionYear: false,
        graduationYear: false,
        teachlang: false,
        nameru: false,
        namekz: false,
        nameen: false,
        annotationkz: false,
        annotationru: false,
        annotationen: false,
        abstractFile: false,
        dissertationFile: false,
        swListFile: false,
        scientificConsultantFile: false,
        foreignConsultantFile: false,
        commissionConclusionFile: false,
        reviewer1CommentFile: false,
        reviewer2CommentFile: false,
      },
      validationErrorsSetMeetingTime: {
        defenseLanguage: false,
        meetingPlace: false,
        meetingUrl: false,
      },
      loading: false,
      lazyParams: {
        page: 0,
        rows: 10,
      },
      dissertationService: new DissertationService(),
      memberList: []
    };
  },
  created() {
    this.councilID = Number(this.$route.params.id);
    this.getDoctorals();

    var generator = require("generate-password");


    this.password = generator.generate({
      length: 10,
      numbers: true,
    });
  },
  mounted() {
    this.getDissertationMember();
    this.getSecretary();

  },


  methods: {
    showMemberVisible() {
      this.addMemberVisible = true;
    },
    upFirstLetter,
    findRole: findRole,
    downloadFile: downloadFile,
    getLongDateString: getLongDateString,
    getShortDateString: getShortDateString,
    deleteMember(memeberId) {
      this.$confirm.require({
        message: this.$t("common.confirmation"),
        header: this.$t("common.confirm"),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          axios.post(smartEnuApi + "/dissertation/deleteCouncilMember",
            { id: memeberId }, { headers: getHeader(), }).then((response) => {
              this.loadCouncil();
            }).catch((error) => {
              if (error.response.status == 401) {
                this.$store.dispatch("logLout");
              }
            });
        }
      });
    },
    exportCSV() {
      this.$refs.voteReport.exportCSV();
    },
    async exportReport() {
      this.printStyle = 'text-align:center';
      var opt = {
        margin: 1,
        filename: this.selectedDoctoral.user.fullName + '.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      const pdfContent = this.$refs.report;

      // New Promise-based usage:
      await html2pdf().set(opt).from(pdfContent).save();
      this.printStyle = 'display:none;text-align:center';
    },
    getDissertationMember() {
      this.isDissertationMember = (
        (this.findRole(null, 'dissertation_council_permanent_member')
          || this.findRole(null, 'dissertation_council_temporary_member')
          || this.findRole(null, 'dissertation_council_reviewer')
          || this.findRole(null, 'dissertation_council_chief'))

      )
    },
    getSecretary() {
      this.isSecretary = this.findRole(null, 'dissertation_council_secretary')
    },
    getDepartments(event, departmentList) {
      departmentList.getDepartments(event.value.id);
    },
    isDissertationAdmin() {
      if (this.myDetails && this.myDetails.status)
        this.myDetails.status = this.statuses.indexOf(this.myDetails.status);
    },
    download() {
      this.backcolor = "background-color: white";
      var element = document.getElementById("keyword");
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
    },
    memberRegister() {
      axios
        .post(
          smartEnuApi + "/dissertation/memberregister",
          {
            userID: this.$store.state.loginedUser.userID,
            dissertationID: this.selectedDoctoral.dissertation.id
          },
          {
            headers: getHeader()
          }
        )
        .then(response => {
          this.currentMemberState = response.data
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    getMemberState() {
      axios
        .post(
          smartEnuApi + "/dissertation/getMemberState",
          {
            userID: this.$store.state.loginedUser.userID,
            dissertationID: this.selectedDoctoral.dissertation.id
          },
          {
            headers: getHeader()
          }
        )
        .then(response => {
          this.currentMemberState = response.data.memberState
          this.selectedDoctoral.dissertation.state = response.data.dissertationState
          if (this.selectedDoctoral.dissertation.state < this.dissertationState.VotingStarted) {
            this.voteInfo = null;
          }
          if (this.selectedDoctoral.dissertation.state < this.dissertationState.ReadyToRegister) {
            this.regInfo = null;
            this.regInfoDetail = null;
          }
          if (this.dialog.defenseConduct) {
            setTimeout(() => {
              this.getMemberState()
            }, 5000);
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    deleteDissertation(data) {
      if (data !== undefined) {
        this.selectedDoctoral = data;
      }
      this.$confirm.require({
        message: this.$t("common.confirmation"),
        header: this.$t("common.confirm"),
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          axios
            .post(
              smartEnuApi + "/dissertation/deleteDissertation",
              { id: this.selectedDoctoral.dissertation.id },
              {
                headers: getHeader(),
              }
            )
            .then((response) => {
              this.DoctoralList.splice(
                this.DoctoralList.indexOf(this.selectedDoctoral),
                1
              );
            })
            .catch((error) => {
              if (error.response.status == 401) {
                this.$store.dispatch("logLout");
              }
            });
        },
      });
    },

    showAddCouncilDialog() {
      this.selectedUsers = null;
      this.selectedRole = null;
      this.dialog.addDoctoral.state = true;
    },
    showDefenseDialog() {
      this.loadCouncil()
      this.councilID = this.selectedDoctoral.councilID;
      this.getMemberState()
      if (this.selectedDoctoral && (this.selectedDoctoral.dissertation.state == this.dissertationState.ReadyToRegister || this.selectedDoctoral.dissertation.state == this.dissertationState.RegistrationFinished || this.selectedDoctoral.dissertation.state == this.dissertationState.VotingStarted || this.selectedDoctoral.dissertation.state == this.dissertationState.VotingFinished)) {

        this.getRegistrationInfo()

      }

      if (this.selectedDoctoral && (
        this.selectedDoctoral.dissertation.state > this.dissertationState.VotingStarted

      )) {
        this.getVotingInfo()
      }

      this.dialog.defenseConduct.state = true;
    },
    showDialog(dialog) {
      dialog.state = true;
    },
    hideDialog(dialog) {
      dialog.state = false;
      this.errorRegMessage = null;
    },
    uploadFile(files, ufile) {
      this[ufile] = files;
    },
    uploadDissertationNote(event) {
      this.dissertationFile = event.files[0];
    },
    reload(event) {
      console.log(event)
      //this.lazyParams = event;
      this.lazyParams = event;
      this.getDoctorals();
    },
    getDoctorals() {
      this.loading = true;
      this.lazyParams.userID = this.$store.state.loginedUser.userID
      //this.lazyParams.countMode = null;
      axios.post(smartEnuApi + "/dissertation/getdoctorals", this.lazyParams, { headers: getHeader() }).then((response) => {
        this.DoctoralList = response.data;
        if (this.DoctoralList.length > 0 && this.doctoralCount < 0) {
          this.doctoralCount = this.DoctoralList[0].count
        }
        this.loading = false;
      }).catch((error) => {
        if (error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
      });
    },
    startRegistration() {
      var req = {
        councilID: this.selectedDoctoral.councilID,
        dissertationID: this.selectedDoctoral.dissertation.id
      }
      axios
        .post(
          smartEnuApi + "/dissertation/startRegistration",
          req,
          { headers: getHeader() }
        )
        .then(response => {
          this.regInfo = response.data
          console.log(this.regInfo)
          if (this.regInfo.length > 0) {
            this.regInfoDetail = this.regInfo[0].members
          }
          this.selectedDoctoral.dissertation.state = this.dissertationState.ReadyToRegister
          if (this.dialog.defenseConduct.state) {
            setTimeout(() => {
              this.getRegistrationInfo()
            }, 2000);
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          } else if (error.response.data && error.response.data.error) {
            if (error.response.data.error == "dissertationMeetingDateError") {
              this.errorRegMessage = "dissertationMeetingDateError";

            }


          }
        });

    },
    async startNewRegistration() {
      const req = {
        councilID: this.selectedDoctoral.councilID,
        dissertationID: this.selectedDoctoral.dissertation.id,
      };

      try {
        const response = await axios.post(
          `${smartEnuApi}/dissertation/newStartRegistration`,
          req,
          { headers: getHeader() }
        );

        this.regInfo = response.data;
        console.log(this.regInfo);

        if (this.regInfo.length > 0) {
          this.regInfoDetail = this.regInfo[0].members;
        }

        this.selectedDoctoral.dissertation.state = this.dissertationState.ReadyToRegister;

        // Simulate progress (adjust this logic)
        for (let i = 0; i <= 100; i += 10) {
          this.progress = i;
          await this.delay(500); // Simulate a delay between progress updates
        }
        this.progressBarVisible = false;

        if (this.dialog.defenseConduct.state) {
          setTimeout(() => {
            this.getRegistrationInfo();
          }, 2000);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        }
      }
    },
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    ChangeDissertationState(state) {
      var req = {
        dissertationID: this.selectedDoctoral.dissertation.id,
        state: state
      }
      axios
        .post(
          smartEnuApi + "/dissertation/changeDissertationState",
          req,
          { headers: getHeader() }
        )
        .then(() => {
          this.selectedDoctoral.dissertation.state = state
          if (state == this.dissertationState.VotingStarted ||
            state == this.dissertationState.VotingFinished ||
            state == this.dissertationState.VotingRestarted ||
            state == this.dissertationState.VotinsFinishedSecondStep) {
            this.getVotingInfo()
          }


        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    vote() {
      if (!this.currentMemberVote) {
        this.$toast.add({
          severity: "warn",
          summary: this.$t('common.message.selectVariant'),
          life: 3000,
        });
        return
      }
      var req = {
        dissertationID: this.selectedDoctoral.dissertation.id,
        userID: this.$store.state.loginedUser.userID,
        step: this.selectedDoctoral.dissertation.state == this.dissertationState.VotingRestarted ? 2 : 1,
        password: this.password,
        vote: Number(this.currentMemberVote)
      }
      axios
        .post(
          smartEnuApi + "/dissertation/vote",
          req,
          { headers: getHeader() }
        )
        .then(() => {
          this.currentMemberState = this.memberState.Voted
          this.getVotingInfo()
          this.currentMemberVote = null
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
            this.$toast.add({
              severity: "error",
              summary: error,
              life: 3000,
            });
          }
        });

    },
    checkMyVoice() {
      var req = {
        dissertationID: this.selectedDoctoral.dissertation.id,
        userID: this.$store.state.loginedUser.userID,
        step: this.selectedDoctoral.dissertation.state == this.dissertationState.VotingRestarted ? 2 : 1,
        password: this.checkPassword,
      }
      axios
        .post(
          smartEnuApi + "/dissertation/checkMyVoice",
          req,
          { headers: getHeader() }
        )
        .then((res) => {
          if (!res.data || (res.data !== "1" && res.data !== "2" && res.data !== "3" && res.data != "4")) {
            this.$toast.add({
              severity: "error",
              summary: this.$t('common.message.invalidkey'),
              life: 3000,
            });
            return
          }
          this.checkedVoice = this.$t('dissertation.vote.v' + res.data)
          this.$toast.add({
            severity: "success",
            summary: this.$t('common.yourVoice') + this.checkedVoice,
            life: 3000,
          });
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
          this.$toast.add({
            severity: "error",
            summary: this.$t('common.message.invalidkey'),
            life: 3000,
          });
        });

    },
    getVotingInfo() {
      var req = {
        dissertationID: this.selectedDoctoral.dissertation.id,
        short: this.selectedDoctoral.dissertation.state == this.dissertationState.VotingStarted || this.selectedDoctoral.dissertation.state == this.dissertationState.VotingRestarted,
        step: this.selectedDoctoral.dissertation.state == this.dissertationState.Accepted || this.selectedDoctoral.dissertation.state == this.dissertationState.Reject ? 1 : 2,

      }
      axios
        .post(
          smartEnuApi + "/dissertation/getVoteInformation",
          req,
          { headers: getHeader() }
        )
        .then(response => {
          this.voteInfo = response.data
          if (this.voteInfo) {
            this.selectedDoctoral.dissertation.state = this.voteInfo.dissertationState
          }
          this.loading = false
          var short = this.selectedDoctoral.dissertation.state == this.dissertationState.VotingStarted || this.selectedDoctoral.dissertation.state == this.dissertationState.VotingRestarted;
          if (short && this.dialog.defenseConduct.state && this.selectedDoctoral && (this.selectedDoctoral.dissertation.state === this.dissertationState.VotingRestarted || this.selectedDoctoral.dissertation.state === this.dissertationState.VotingStarted)) {
            setTimeout(() => {
              this.getVotingInfo()
            }, 5000);
          }

        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    getRegistrationInfo() {
      this.loading = true
      var req = {
        dissertationID: this.selectedDoctoral.dissertation.id
      }
      axios
        .post(
          smartEnuApi + "/dissertation/getRegistrationInfo",
          req,
          { headers: getHeader() }
        )
        .then(response => {
          this.regInfo = response.data
          if (this.regInfo && this.regInfo.length > 0) {
            this.selectedDoctoral.dissertation.state = this.regInfo[0].dissertationState
            this.regInfoDetail = this.regInfo[0].members
          }
          this.loading = false
          if ((this.dialog.defenseConduct.state && this.selectedDoctoral && this.selectedDoctoral.dissertation.state === this.dissertationState.ReadyToRegister) ||
            (this.isDissertationMember && this.dialog.defenseConduct.state && this.selectedDoctoral && this.selectedDoctoral.dissertation.state === this.dissertationState.RegistrationFinished) ||
            (this.isDissertationAdmin && this.selectedDoctoral && this.dialog.defenseConduct.state)) {
            setTimeout(() => {
              this.getRegistrationInfo()
            }, 5000);
          }

        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.$store.dispatch("logLout");
          }
        });
    },
    confirmSetMeetingTime() {
      this.submitted = true;
      if (!this.validateSetMeetingTimeForm()) return;
      this.loadCouncil();
      this.submitted = false;
      this.dialog.setMeetingTimeConfirm.state = true;
    },
    setMeetingTime() {
      this.submitted = true;
      if (this.validateSetMeetingTimeForm()) {
        var request = {
          id: this.selectedDoctoral.dissertation.id,
          url: this.selectedDoctoral.dissertation.url,
          meetingUrl: this.selectedDoctoral.dissertation.meetingUrl,
          meetingPlace: this.selectedDoctoral.dissertation.meetingPlace,
          meetingTime: this.selectedDoctoral.meetingTime,
          language: this.selectedDoctoral.dissertation.language
        }
        axios
          .post(
            smartEnuApi + "/dissertation/setMeetingTime",
            request,
            {
              headers: getHeader(),
            }
          )
          .then((res) => {
            this.submitted = false;
            this.selectedDoctoral.dissertation.state = this.dissertationState.DefenseDate
            this.hideDialog(this.dialog.setMeetingTimeConfirm)
            this.hideDialog(this.dialog.setMeetingTime)
            this.$toast.add({ severity: "success", summary: "Хабарландыру сәтті құрылды", life: 3000 });
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: "dissertationSetMeetingTimeError\n" + error,
                life: 3000,
              });
            }
          });

      }
    },
    validateSetMeetingTimeForm() {
      this.validationErrorsSetMeetingTime.defenseLanguage = !this.selectedDoctoral.dissertation.language;
      this.validationErrorsSetMeetingTime.meetingPlace = !this.selectedDoctoral.dissertation.meetingPlace;
      this.validationErrorsSetMeetingTime.meetingTime = !this.selectedDoctoral.meetingTime;
      this.validationErrorsSetMeetingTime.meetingUrl = !this.selectedDoctoral.dissertation.meetingUrl;
      let result = true
      for (var key of Object.keys(this.validationErrorsSetMeetingTime)) {
        result = result && !this.validationErrorsSetMeetingTime[key]
      }
      return result
    },
    addDoctoral() {
      this.submitted = true;

      if (this.validateAddDoctoralForm()) {
        let data = new FormData()
        data.append("abstractFile", this.abstractFile);
        data.append("dissertationFile", this.dissertationFile)
        data.append("swListFile", this.swListFile)
        data.append("scientificConsultantFile", this.scientificConsultantFile)
        data.append("foreignConsultantFile", this.foreignConsultantFile)
        data.append("commissionConclusionFile", this.commissionConclusionFile)
        data.append("reviewer1CommentFile", this.reviewer1CommentFile)
        data.append("reviewer2CommentFile", this.reviewer2CommentFile)
        this.doctoral.user = this.selectedUsers[0]
        this.doctoral.speciality = this.selectedSpecialities[0]
        data.append("doctoral", JSON.stringify(this.doctoral))

        axios
          .post(
            smartEnuApi + "/dissertation/addDoctoral",
            data,
            {
              headers: getHeader(),
            }
          )
          .then((res) => {
            this.submitted = false;
            this.DoctoralList.push(res.data)
            this.hideDialog(this.dialog.addDoctoral)
          })
          .catch((error) => {
            if (error.response.status == 401) {
              this.$store.dispatch("logLout");
            } else {
              this.$toast.add({
                severity: "error",
                summary: "dissertationNewCouncilError\n" + error,
                life: 3000,
              });
            }
          });
      }
    },
    loadCouncil() {
      this.lazyParams.id = this.selectedDoctoral.councilID;
      axios.post(smartEnuApi + "/dissertation/getcouncilmembers", this.lazyParams, { headers: getHeader() }).then((response) => {
        console.log(response.data)
        this.memberList = response.data;
      }).catch((error) => {
        if (error && error.response && error.response.status == 401) {
          this.$store.dispatch("logLout");
        }
      });
    },
    initMembers(roleName) {
      if (this.memberList.length === 0) return;
      return this.memberList.filter(x => x.roles.some(q => q.name === roleName))
    },
    validateAddDoctoralForm() {
      this.validationErrors.user = !this.selectedUsers;
      this.validationErrors.hei = !this.doctoral.hei;
      this.validationErrors.faculty = !this.selectedDepartment;
      this.validationErrors.cafedra = !this.doctoral.cafedra;
      this.validationErrors.speciality = !this.selectedSpecialities;
      this.validationErrors.teachlang = !this.doctoral.teachlang;
      this.validationErrors.namekz = !this.doctoral.dissertation.namekz;
      this.validationErrors.nameru = !this.doctoral.dissertation.nameru;
      this.validationErrors.nameen = !this.doctoral.dissertation.nameen;
      this.validationErrors.admissionYear = !this.doctoral.admissionYear
      this.validationErrors.graduationYear = !this.doctoral.graduationYear;
      this.validationErrors.annotationkz = !this.doctoral.dissertation.annotation.kz
      this.validationErrors.annotationru = !this.doctoral.dissertation.annotation.ru
      this.validationErrors.annotationen = !this.doctoral.dissertation.annotation.en
      this.validationErrors.abstractFile = !this.abstractFile
      this.validationErrors.dissertationFile = !this.dissertationFile
      this.validationErrors.swListFile = !this.swListFile
      this.validationErrors.scientificConsultantFile = !this.scientificConsultantFile
      this.validationErrors.foreignConsultantFile = !this.foreignConsultantFile
      this.validationErrors.commissionConclusionFile = !this.commissionConclusionFile
      this.validationErrors.reviewer1CommentFile = !this.reviewer1CommentFile
      this.validationErrors.reviewer2CommentFile = !this.reviewer2CommentFile

      let result = true
      for (var key of Object.keys(this.validationErrors)) {
        result = result && !this.validationErrors[key]
      }
      return result

    },
    getRoleName(role) {
      //alert("Hello");
      switch (this.$i18n.locale) {
        case "kz":
          return role.kz;
        case "en":
          return role.en;
        case "ru":
          return role.ru;
      }
    },
  },
  computed: {
    ...mapState(["loginedUser"]),
  },
};
</script>
<style scoped>
.rowclass {
  font-size: 13pt;
}
</style>