<template>
  <ConfirmPopup group="deleteResult"></ConfirmPopup>
  <vue-element-loading :active="isBlockUI" is-full-screen color="#FFF" size="80" :text="$t('common.loading')" backgroundColor="rgba(0, 0, 0, 0.4)"/>
  <div class="col-12" v-if="plan && event">
    <div>
      <div v-if="!resultId" @click="navigateToBack" class="inline-block"><i class="fa-solid fa-arrow-left mr-3" style="font-size: 16px;cursor: pointer"></i>
      </div>
      <div class="mb-0 mt-0 inline-block" style="font-size: 24px"> {{ $t('common.result') }}</div>
    </div>
     <div class="text-right" style="margin-top:-30px;padding-bottom: 3px;" v-if="plan && isPlanCreator || plan && isAdmin">
      <Button type="button" icon="fa-solid fa-filter" :label="$t('common.filter')"
                        @click="toggle('global-filter', $event)" aria:haspopup="true" aria-controls="overlay_panel"
                        class="p-button-outlined mr-2" />
                <OverlayPanel ref="global-filter" class="overlay-panel" style="max-width: 50vw;">
                  <div class="p-fluid">
                    <div class="field">
                      <label>{{ $t('cafedra.responsible') }}</label>
                      <FindUser v-model="resultFilter.responsiveUser" :max="1" searchMode="local" :user-type="3" editMode="true"/>
                    </div>
                    </div>
                    <div v-if="isOperPlan || isStandartPlan" class="field p-fluid">
                      <label>{{ $t('dissertation.dissQuarter') }}</label>
                      <Dropdown v-model="resultFilter.quarter" :options="quarters" :optionLabel="('quarter_'+$i18n.locale)" :placeholder="$t('common.select')" class="w-full" optionValue="value"/>
                    </div>
                    <div class="p-fluid">
                        <div class="field">
                            <br />
                            <Button icon="pi pi-trash" class="ml-1" @click="clearResultFilter()"
                                    :label="$t('common.clear')" outlined />
                        </div>
                        <div class="field">
                            <Button icon="pi pi-search" :label="$t('common.search')" class="ml-1" @click="getData()" />
                        </div>
                    </div>
                </OverlayPanel>
              
      </div>
    <div>
      <TabView v-model:activeIndex="activeIndex" @tab-change="changeTab">
        <TabPanel :header="$t('common.properties')">
          <div v-if="isVisibleWritableField || isPlanCreator">
            <div :style="{ 'z-index': 9999, 'position': 'relative' }"
                v-if="(event &&
                (isCurrentUserApproval && (event.status.work_plan_event_status_id === 1 || event.status.work_plan_event_status_id === 4 || event.status.work_plan_event_status_id === 6))) || (event && isPlanCreator)">
              <Menubar :model="userMenuItems" :key="active" class="userMenu"></Menubar>
            </div>
          </div>

          <div v-if="isPlanCreator && event && event.status.work_plan_event_status_id === 5">
            <Menubar :model="verifyMenu" :key="active" style="height: 36px;margin-top: -7px;margin-left: -14px;margin-right: -14px;"></Menubar>
          </div>
          <div class="grid mt-3" v-if="plan && resultData && (new Date(plan.create_date).getFullYear() < new Date().getFullYear())">
            <div class="p-sm-12 md:col-12 lg:col-12 p-xl-6">

              <div class="field" v-if="event && isOperPlan">
                <label class="bold">{{ $t('common.fact') }}: </label>
                <div>{{ event.fact }}</div>
              </div>
              <div class="field" v-if="plan && resultData && !isSciencePlan">
                <label class="bold">{{ $t('common.result') }}</label>
                <div v-if="resultData[0].event_result" class="mb-2">
                  <Divider align="left">
                    <i class="fa-solid fa-user mr-1"></i><b>{{ item.user.fullName }}</b>
                  </Divider>
                  <p v-html="resultData[0].event_result"></p>
                </div>
                <div v-else v-for="(item, index) of resultData[0].result_text" :key="index" class="mb-2">
                  <Divider align="left">
                    <i class="fa-solid fa-user mr-1"></i><b>{{ item.user.fullName }}</b>
                  </Divider>
                  <p v-html="item.text"></p>
                </div>
              </div>
              <div class="field" v-if="resultData && resultData[0].result_files">
                <label class="bold">{{ $t('workPlan.attachments') }}</label>
                <div ref="content" class="p-fileupload-content">
                  <div class="p-fileupload-files">
                    <div class="p-fileupload-row" v-for="(file, index) of resultData[0].result_files" :key="index">
                      <span class="mr-3" style="cursor: pointer;" @click="downloadFile(file)"><i
                          class="fa-solid fa-file-arrow-down fa-2x color-success"></i></span>
                      <span @click="downloadFile(file)"
                            style="cursor: pointer;">{{
                          file.file_name ? file.file_name : file.event_result_file
                        }}</span>
                      <span class="ml-5" v-if="file.user_id && file.user_id === loginedUserId"><Button
                          icon="pi pi-times" class="p-button-rounded p-button-text"
                          v-if="event && (event.status.work_plan_event_status_id !== 5 && event.status.work_plan_event_status_id !== 2)"
                          @click="deleteFileConfirm($event, file.id)"/></span>
                    </div>
                  </div>
                  <div class="p-fileupload-empty" v-if="files.length === 0">
                    <slot name="empty"></slot>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid mt-3" v-else>
            <div class="p-fluid" v-if="(!isPlanCreator && (isPlanCreatorApproval || !isPlanCreator) &&
              event.status.work_plan_event_status_id !== 5 &&
              event.status.work_plan_event_status_id !== 2 && event.status.work_plan_event_status_id !== 6) || (isRespUser && isPlanCreator && (isPlanCreatorApproval || !isPlanCreator) &&
              event.status.work_plan_event_status_id !== 5 &&
              event.status.work_plan_event_status_id !== 2 && event.status.work_plan_event_status_id !== 6)">
              <div class="field">
                <label>{{ $t('workPlan.eventName') }}</label>
                <InputText v-model="event.event_name" disabled/>
              </div>
              <div class="field" v-if="(plan && isOperPlan && isSummaryDepartmentUser)">
                <label>{{ $t('common.fact') }}</label>
                  <InputText v-model="event.fact" @input="factChange"/>

              </div>
              <div class="field" v-if="isVisibleWritableField && isRespUser && (isOperPlan || isStandartPlan)">
                <Dropdown v-model="selectedQuarter" :options="filteredQuarters" :optionLabel="('quarter_'+$i18n.locale)" :placeholder="$t('common.select')" class="w-full md:w-14rem" required @change="validate"/>
                <small class="p-error" v-if="validation.quarter">{{$t('common.requiredField')}}</small>
              </div>
              <div class="field" v-if="!hasResultToApprove">
                <label>{{ $t('common.result') }}</label>
                  <div v-if="isVisibleWritableField">
                      <TinyEditor v-if="plan && isRespUser && !isOperPlan" v-model="result" :min-word="wordLimit" @wordCount="initWordCount" :height="300"
                                :style="{ height: '100%', width: '100%' }"
                                @selectionChange="editorChange"/>
                    <TinyEditor v-if="plan && isRespUser && isOperPlan" :min-word="wordLimit" @wordCount="initWordCount" v-model="newResult" :height="300" @selectionChange="editorChange"/>
                    <small v-if="isSciencePlan && submitted && (inputWordCount < wordLimit)" class="p-error">{{ $t('workPlan.minWordCount') }}</small>
                </div>
              </div>
              <div class="field" v-if="isVisibleWritableField && isRespUser">
                <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadFile($event)" :auto="true" :multiple="true" :chooseLabel="$t('smartenu.chooseAdditionalFile')"></FileUpload>
              </div>
              <div class="field">
                <div ref="content" class="p-fileupload-content">
                  <div class="p-fileupload-files">
                    <div class="p-fileupload-row" v-for="(file, index) of files" :key="index">
                      <span class="mr-3"><i class="pi pi-paperclip"></i></span>
                      <span>{{ file.name }}</span>
                      <span class="ml-5">
                        <Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="removeFile(index)"/>
                      </span>
                    </div>
                  </div>
                  <div class="p-fileupload-empty" v-if="files.length === 0">
                    <slot name="empty"></slot>
                  </div>
                </div>
              </div>
            </div>
            <div class="p-sm-12 md:col-12 lg:col-12 p-xl-6">
              <div class="field" v-if="(plan && plan.plan_type.code === 'oper' && isSummaryDepartmentUser)">
                <label class="bold">{{ $t('common.fact') }}: </label><strong>{{ " " + event.fact }}</strong>
              </div>
              <!-- Start Editing -->
              <div class="field" v-if="plan && resultData">
                <div v-for="(item, index) of resultData" :key="index" class="mb-2">
                  <Divider align="left">
                    <div class="flex justify-content-center align-items-center">
                      <div class="flex flex-column justify-content-center align-items-start">
                        <span class="pb-2"><i class="fa-solid fa-user mr-1"></i><b>{{ item.user.thirdName + " " + item.user.firstName }}</b></span>
                        <span class="pb-2"><strong>{{ getQuarter(item.result_text[0].quarter) }}</strong> | {{ formatDateMoment(item.plan_event_result_history[0].create_date) }}</span>
                      </div>
                      <div class="ml-3" v-if="item?.plan_event_result_history[0]?.state_id !== 9">
                        <span :class="'customer-badge status-' + item.plan_event_result_history[0].state_id">
                          {{ getResultStatus(item.plan_event_result_history[0].state_id) }}</span>
                        <span style="float: right; margin-top: 0px;">
                          <Button v-if="item.plan_event_result_history[0]?.state_id === 6" class="p-button p-component p-button-icon-only p-button-text" style="height: 20px;font-size: 16px;" @click="showRejectMessageSidebar" icon="fa-solid fa-eye" link />
                        </span>
                      </div>
                    </div>
                  </Divider>
                  <Inplace v-if="(item.result_text && (loginedUserId === item.result_text[0].user.userID) && event &&
                    (item.plan_event_result_history && item.plan_event_result_history[0].state_id === 6)) || (item.result_text && isPlanCreator && event &&
                    (item.plan_event_result_history && item.plan_event_result_history[0].state_id === 5) && isSciencePlan)" :active="item.isActive" @open="openInplace(item)">
                    <template #display>
                      <div>
                        <span class="mr-1" style="float:left;"><i class="fa-solid fa-pen color-success"></i></span>
                        <p class="p-0 m-0" v-html="item.result_text[0].text"></p>
                      </div>
                    </template>
                    <template #content>
                      <div class="py-2"
                           v-if="((item.plan_event_result_history[0].state_id === 6) && (loginedUserId === item.result_text[0].user.userID)) || (isPlanCreator && isSciencePlan && (item.plan_event_result_history[0].state_id === 5))">
                        <Button :label="$t('common.save')" icon="pi pi-check" class="p-button p-button-success" @click="saveEditResult(item)"
                                :loading="loading"/>
                        <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button ml-1" @click="cancelEdit(item)"/>
                        <Button :label="$t('common.delete')" icon="pi pi-trash" class="p-button p-button-danger ml-1" @click="deleteConfirmItem($event, item)" />
                      </div>
                      <div class="field">
                        <TinyEditor v-model="item.result_text[0].text" :height="300" :style="{ height: '100%', width: '100%' }"/>
                      </div>
                      <!--Edit jaslaganda-->
                      <div class="field">
                        <FileUpload ref="form" mode="basic" :customUpload="true" @uploader="uploadFile($event)" :auto="true" :multiple="true" :chooseLabel="$t('smartenu.chooseAdditionalFile')"></FileUpload>
                      </div>
                      <div class="field">
                        <div ref="content" class="p-fileupload-content">
                          <div class="p-fileupload-files">
                            <div class="p-fileupload-row" v-for="(file, index) of files" :key="index">
                              <span class="mr-3"><i class="pi pi-paperclip"></i></span>
                              <span>{{ file.name }}</span>
                              <span class="ml-5">
                                <Button icon="pi pi-times" class="p-button-rounded p-button-text" @click="removeFile(index)"/>
                              </span>
                            </div>
                          </div>
                          <div class="p-fileupload-empty" v-if="files.length === 0">
                            <slot name="empty"></slot>
                          </div>
                        </div>
                      </div>
                      <div class="p-fileupload-files">
                        <div class="p-fileupload-row" v-for="(file, index) of item.result_files" :key="index">
                          <span class="mr-3" style="cursor: pointer;" @click="downloadFile(file)">
                            <i class="fa-solid fa-file-arrow-down fa-lg color-success"></i></span>
                          <span @click="downloadFile(file)" style="cursor: pointer;">{{ file.file_name ? file.file_name : file.event_result_file }}</span>
                          <span class="ml-5" v-if="file.user_id && file.user_id === loginedUserId">
                            <Button icon="pi pi-times" class="p-button-rounded p-button-text" v-if="event && item.plan_event_result_history[0].state_id === 6" @click="deleteFileConfirm($event, file.id)"/>
                          </span>
                        </div>
                      </div>
                      <div class="p-fileupload-empty" v-if="files.length === 0">
                        <slot name="empty"></slot>
                      </div>
                      <!--End Edit jaslaganda-->
                    </template>
                  </Inplace>
                  <div v-else class="p-0">
                    <p v-html="item.result_text[0].text"></p>
                  </div>
                  <br/>
                  <div class="" v-if="resultData && item.result_files">
                    <label class="bold"><strong>{{ $t('workPlan.attachments') }}</strong></label>
                    <div ref="content" class="p-fileupload-content" style="padding-top: 7px;">
                      <div class="p-fileupload-files">
                        <div class="p-fileupload-row" v-for="(file, index) of item.result_files" :key="index">
                          <span class="mr-3" style="cursor: pointer;" @click="downloadFile(file)">
                            <i class="fa-solid fa-file-arrow-down fa-lg color-success"></i></span>
                          <span @click="downloadFile(file)" style="cursor: pointer;">{{ file.file_name ? file.file_name : file.event_result_file }}</span>
                        </div>
                      </div>
                      <div class="p-fileupload-empty" v-if="files.length === 0">
                        <slot name="empty"></slot>
                      </div>
                    </div>
                  </div>
                  <div style="margin-left: -12px;" v-if="isPlanCreator || findRole(null, 'main_administrator')">
                    <Button v-if="(item.plan_event_result_history[0].state_id === 5)" icon="pi pi-fw pi-check" class="p-button-rounded p-button-text"
                            @click="confirmToInspected(isInspected, item.user.userID, item.event_result_id)" :label="$t('common.action.accept')"></Button>
                    <Button v-if="(item.plan_event_result_history[0].state_id === 5)" icon="pi pi-fw pi-times" class="p-button-rounded p-button-text"
                            @click="showToCorrectSidebarNew(item.user.userID, item.event_result_id)" :label="$t('workPlan.toCorrect')"></Button>
                    <Button v-if="findRole(null, 'main_administrator')" :label="$t('common.delete')" icon="pi pi-trash" class="p-button p-button-danger ml-1" @click="deleteConfirmItem($event, item)" />
                    <br/><br/>
                  </div>

                  <div v-else class="p-0">
                    <span style="float:right;margin-top: -7px;" v-if="isPlanCreator">
                      <Button icon="pi pi-fw pi-check" class="p-button-rounded p-button-text" @click="verify(true)" :label="$t('common.action.accept')"></Button>
                      <Button icon="pi pi-fw pi-times" class="p-button-rounded p-button-text" @click="showToCorrectSidebar()" :label="$t('workPlan.toCorrect')"></Button>
                    </span>
                  </div>
                </div>
              </div>
              <div v-else>
                {{ $t('common.noData') }}
              </div>
              <!-- End Editing -->
              <div class="field" v-if="resultData && resultData.result_files">
                <label class="bold">{{ $t('workPlan.attachments') }}</label>
                <div ref="content" class="p-fileupload-content">
                  <div class="p-fileupload-files">
                    <div class="p-fileupload-row" v-for="(file, index) of resultData.result_files" :key="index">
                      <span class="mr-3" style="cursor: pointer;" @click="downloadFile(file)">
                        <i class="fa-solid fa-file-arrow-down fa-2x color-success"></i></span>
                      <span @click="downloadFile(file)" style="cursor: pointer;">{{ file.file_name ? file.file_name : file.event_result_file }}</span>
                      <span class="ml-5" v-if="file.user_id && file.user_id === loginedUserId">
                        <Button icon="pi pi-times" class="p-button-rounded p-button-text" v-if="event && (event.status.work_plan_event_status_id !== 5 && event.status.work_plan_event_status_id !== 2)" @click="deleteFileConfirm($event, file.id)"/>
                      </span>
                    </div>
                  </div>
                  <div class="p-fileupload-empty" v-if="files.length === 0">
                    <slot name="empty"></slot>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel :header="$t('common.history')">
          <div>
          <DataTable :value="history" class="p-datatable-sm" responsiveLayout="scroll" v-if="history && history.length > 0">
            <Column field="id" header="ID"></Column>
            <Column :header="$t('common.date')">
              <template #body="{ data }">
                {{ formatDateMoment(data.modi_date) }}
              </template>
            </Column>
            <Column field="user" :header="$t('common.user')">
              <template #body="{ data }">
                {{ data.modi_user.fullName }}
              </template>
            </Column>
            <Column field="state" :header="$t('common.actionTitle')">
              <template #body="{ data }">
                <!-- {{ data.state ? $t(`common.states.${data.state}`) : "" }} -->
                <span :class="'customer-badge status-' + data.state_id">
                  {{ data.state ? getResultStatus(data.state_id) : "" }}
                </span>
              </template>
            </Column>
            <Column field="user" :header="$t('common.comment')">
              <template #body="{ data }">
                <div v-if="data?.state_id == 9">
                  <Button icon="pi pi-eye" @click="openModiPersonHistory(data)" severity="secondary" alt-text="Resp Person"/>
                </div>
              </template>
            </Column>
          </DataTable>
          <div v-else>
            {{ $t('common.recordsNotFound') }}
          </div>
        </div>
        </TabPanel>
      </TabView>
    </div>
  </div>

  <Sidebar v-model:visible="toCorrectSidebar" position="right" class="p-sidebar-lg " style="overflow-y: scroll">
    <h3>{{ $t('workPlan.toCorrect') }}</h3>
    <div class="field">
      <div>
        <Button icon="pi pi-fw pi-check" class="p-button-outlined" @click="confirmToRevision()" :label="$t('common.send')"></Button>
      </div>
    </div>
    <div class="p-col p-fluid">
      <div class="field">
        <label>{{ $t('common.comment') }}</label>
        <TinyEditor v-model="rejectComment" :height="500"></TinyEditor>
      </div>
    </div>
  </Sidebar>

  <Sidebar v-model:visible="rejectMessageSidebar" position="right" :header="$t('workPlan.rejectionMessage')" style="width: 30%;" >
    <div v-for="item in rejectHistory" :key="item.event_result_id">
      <div v-if="item?.plan_event_result_history[0]?.state_id === 6 && item?.user?.userID === loginedUserId">
        <div class="p-fluid">
          <div v-if="item?.reject_history?.user">
            <label><b>{{ $t('contracts.assigner') }}:</b></label> {{ item?.reject_history?.user?.fullName }}
          </div>
          <div v-if="item?.reject_history?.created_date" class="mt-1">
          <label><b>{{ $t('common.date') }}:</b></label> {{ formatDateMoment(item?.reject_history.created_date) }}
        </div>
          <div class="mt-3" v-if="item?.reject_history?.message">
            <label><b>{{ $t('common.comment') }}:</b></label>
            <div style="margin-top: -10px;">
              <Message :closable="false" severity="info"><span v-html="item?.reject_history?.message"></span></Message>
            </div>
          </div>
        </div>
      </div>
    </div>
</Sidebar>
<Dialog v-model:visible="modifiedHistory" :header="$t('workPlan.editRespUser')" :position="position" modal :style="{ width: '400px' }" class="p-fluid" :breakpoints="{ '960px': '75vw', '640px': '90vw' }">
  <div class="dialog-content">
      <div class="field">
        <label class="bold">{{  $t('queue.time') + ":" }}</label>
        <span class="value">{{ formatDateMoment(modiDialogData?.modi_date) }}</span>
      </div>
      <div class="field">
        <label class="bold">{{ $t('workPlan.modifiedPerson') + ":" }}</label>
        <span class="value">{{ modiDialogData?.modi_user?.fullName }}</span>
      </div>
      <div class="field">
        <label class="bold">{{ $t('common.comment') + ":"}}</label>
        <div v-if="commentParseJson?.comment !== ''">
          <p class="value" v-if="commentParseJson?.comment && commentParseJson?.comment?.length > 0">{{ commentParseJson?.comment }}</p>
        </div>
        <div v-else>{{ $t('common.noComment') }}</div>
        
       
      </div>
      <div class="field" v-if="commentParseJson?.summary_department">
        <label class="bold">{{ $t('workPlan.operationalPlan') + ":"}}</label>
        <p>{{ $t('workPlan.summaryDepartment') }}</p>
        <Timeline :value="commentParseJson?.summary_department?.modified" class="timeline_wp_history">
              <template #opposite="slotProps">
                  <div v-if='$i18n.locale === "kz"'>
                    <div v-for="(item, index) in slotProps.item" :key="index" style="text-align:right; min-width: 80px;">
                      <div v-if="item.kz.before">{{ item.kz.before }}</div>
                      <div v-if="item.kz.after">{{ item.kz.after }}</div>
                      <div v-if="item.kz.added">{{ item.kz.added }}</div>
                      <div v-if="item.kz.removed">{{ item.kz.removed }}</div>
                    </div>
                  </div>
                  <div v-if='$i18n.locale === "ru"'>
                    <div v-for="(item, index) in slotProps.item" :key="index" style="text-align:right; min-width: 80px;">
                      <div v-if="item.ru.before">{{ item.ru.before }}</div>
                      <div v-if="item.ru.after">{{ item.ru.after }}</div>
                      <div v-if="item.ru.added">{{ item.ru.added }}</div>
                      <div v-if="item.ru.removed">{{ item.ru.removed }}</div>
                    </div>
                  </div>
                  <div v-if='$i18n.locale === "en"'>
                    <div v-for="(item, index) in slotProps.item" :key="index" style="text-align:right; min-width: 80px;">
                      <div v-if="item.en.before">{{ item.en.before }}</div>
                      <div v-if="item.en.after">{{ item.en.after }}</div>
                      <div v-if="item.en.added">{{ item.en.added }}</div>
                      <div v-if="item.en.removed">{{ item.en.removed }}</div>
                    </div>
                  </div>
              </template>

              <template #content="slotProps">
                <div v-if='$i18n.locale === "kz"'>
                  <div v-if="slotProps?.item?.status?.kz?.user" style="text-align: left;margin-bottom: 15px;">{{ slotProps?.item?.status?.kz?.user }}</div>
                </div>
                <div v-if='$i18n.locale === "ru"'>
                  <div v-if="slotProps?.item?.status?.ru?.user">{{ slotProps?.item?.status?.ru?.user }}</div>
                </div>
                <div v-if='$i18n.locale === "en"'>
                  <div v-if="slotProps?.item?.status?.en?.user">{{ slotProps?.item?.status?.en?.user }}</div>
                </div>
              </template>
            </Timeline>
      </div>
      <div class="field">
        <label class="bold">{{ $t('dissertation.dissReportActions') + ":"}}</label>
        <div>
          <Timeline :value="commentParseJson?.responsive_users?.modified" class="timeline_wp_history">
              <template #opposite="slotProps">
                  <div v-if='$i18n.locale === "kz"'>
                    <div v-for="(item, index) in slotProps.item" :key="index" style="text-align:right; min-width: 80px;">
                      <div v-if="item.kz.before">{{ item.kz.before }}</div>
                      <div v-if="item.kz.after">{{ item.kz.after }}</div>
                      <div v-if="item.kz.added">{{ item.kz.added }}</div>
                      <div v-if="item.kz.removed">{{ item.kz.removed }}</div>
                    </div>
                  </div>
                  <div v-if='$i18n.locale === "ru"'>
                    <div v-for="(item, index) in slotProps.item" :key="index" style="text-align:right; min-width: 80px;">
                      <div v-if="item.ru.before">{{ item.ru.before }}</div>
                      <div v-if="item.ru.after">{{ item.ru.after }}</div>
                      <div v-if="item.ru.added">{{ item.ru.added }}</div>
                      <div v-if="item.ru.removed">{{ item.ru.removed }}</div>
                    </div>
                  </div>
                  <div v-if='$i18n.locale === "en"'>
                    <div v-for="(item, index) in slotProps.item" :key="index" style="text-align:right; min-width: 80px;">
                      <div v-if="item.en.before">{{ item.en.before }}</div>
                      <div v-if="item.en.after">{{ item.en.after }}</div>
                      <div v-if="item.en.added">{{ item.en.added }}</div>
                      <div v-if="item.en.removed">{{ item.en.removed }}</div>
                    </div>
                  </div>
                  
                
              </template>

              <template #content="slotProps">
                <div v-if='$i18n.locale === "kz"'>
                  <div v-if="slotProps?.item?.status?.kz?.users" style="text-align: left;margin-bottom: 15px;">{{ slotProps?.item?.status?.kz?.users }}</div>
                </div>
                <div v-if='$i18n.locale === "ru"'>
                  <div v-if="slotProps?.item?.status?.ru?.users">{{ slotProps?.item?.status?.ru?.users }}</div>
                </div>
                <div v-if='$i18n.locale === "en"'>
                  <div v-if="slotProps?.item?.status?.en?.users">{{ slotProps?.item?.status?.en?.users }}</div>
                </div>
              </template>
            </Timeline>
            
        </div>
      </div>
    </div>
</Dialog>

</template>

<script>
import {findRole, getHeader, smartEnuApi} from "@/config/config";
import moment from "moment";
import {WorkPlanService} from '../../service/work.plan.service'
import Enum from "@/enum/workplan/index"
import FindUser from "@/helpers/FindUser";
import { log } from "qrcode/lib/core/galois-field";


export default {
  name: "WorkPlanEventResult",
  components: {
    FindUser
  },
  props: ['resultId'],
  data() {
    return {
      event: null,
      plan: null,
      result: null,
      file: null,
      isDisabled: true,
      active: null,
      menu: null,
      resultData: null,
      files: [],
      newResult: null,
      fact: null,
      //newFact: null,
      event_id: this.resultId,
      user_id: JSON.parse(localStorage.getItem("loginedUser")).userID,
      isAdmin: false,
      activeIndex: 0,
      history: null,
      toCorrectSidebar: false,
      rejectMessageSidebar: false,
      rejectComment: null,
      loginedUserId: JSON.parse(localStorage.getItem("loginedUser")).userID,
      itemActive: false,
      isFactChanged: false,
      loading: false,
      uploadPercent: 0,
      isBlockUI: false,
      authUser: JSON.parse(localStorage.getItem("loginedUser")),
      quill: null,
      isPlanCreator: false,
      isPlanCreatorApproval: false,
      isCurrentUserApproval: false,
      planService: new WorkPlanService(),
      resultStatus: [
        {name_kz: "Тексерілуде", name_ru: "На проверке", name_en: "On inspection", id: 5},
        {name_kz: "Түзетуде", name_ru: "На доработке", name_en: "Under revision", id: 6},
        {name_kz: "Тексерілді", name_ru: "Проверено", name_en: "Inspected", id: 7},
        {name_kz: "Өшірілді", name_ru: "Удалено", name_en: "Deleted", id: 3},
        {name_kz: "Өзгертілген", name_ru: "Измененный", name_en: "Modified", id: 9},

      ],
      historyStatus: [
        {name_kz: "Жоспарланды", name_ru: "Запланировано", name_en: "Planned", id: 1},
        {name_kz: "Орындалды", name_ru: "Выполнено", name_en: "Done", id: 2},
        {name_kz: "Орындалмады", name_ru: "Не выполнено", name_en: "Not done", id: 3},
        {name_kz: "Жартылай орындалды", name_ru: "Частично выполнено", name_en: "Partially completed", id: 4},
        {name_kz: "Тексерілуде", name_ru: "На проверке", name_en: "On inspection", id: 5},
        {name_kz: "Түзетуде", name_ru: "На доработке", name_en: "Under revision", id: 6},
        {name_kz: "Тексерілді", name_ru: "Проверено", name_en: "Inspected", id: 7},
        {name_kz: "Өзгертілген", name_ru: "Измененный", name_en: "Modified", id: 9},
        

      ],
      isInspected: true,
      submitted: false,
      resultUserId: null,
      eventResultId: null,
      Enum: Enum,
      wordLimit: 50,
      wordMaxLimit: 250,
      hasResultToApprove: false,
      formData: null,
      resultFilter: {
        responsiveUser: null,
        quarter: null
      },
      givenDate:null,
      selectedQuarter: null,
      quarters: [
        { quarter_kz: 'I тоқсан', quarter_ru: 'I квартал', quarter_en: 'I quarter', value: 1 },
        { quarter_kz: 'II тоқсан', quarter_ru: 'II квартал', quarter_en: 'II quarter', value: 2 },
        { quarter_kz: 'III тоқсан', quarter_ru: 'III квартал', quarter_en: 'III quarter', value: 3 },
        { quarter_kz: 'IV тоқсан', quarter_ru: 'IV квартал', quarter_en: 'IV quarter', value: 4 }
      ],
      isQuarterValid: true,
      validation:{
        quarter: false
      },
      inputWordCount: 0,
      modifiedHistory:false,
      modiDialogData: null,
      position: 'topright',
      commentParseJson: null

    }
  },

  computed: {
    getFilteredData(){
      return userID => this.resultData.filter(item => item.user_id === userID)
    },
    userMenuItems() {
      return this.initMenu();
    },
    verifyMenu() {
      return [
        {
          label: this.$t('common.action.accept'),
          icon: "pi pi-fw pi-check",
          visible: this.plan && this.plan.is_oper === true,
          command: () => {
            this.verify(true);
          },
        },
        {
          label: this.$t('workPlan.toCorrect'),
          icon: "pi pi-fw pi-times",
          command: () => {
            this.showToCorrectSidebar();
          },
        },
      ];
    },
    rejectMenu() {
      return [
        {
          label: this.$t('common.save'),
          icon: "pi pi-fw pi-check",
          command: () => {
            this.verify(false);
          },
        }
      ];
    },
    isSciencePlan() {
      return this.plan && this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Science
    },
    isOperPlan() {
      return this.plan && ((this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Oper) || this.plan.is_oper)
    },
    isStandartPlan() {
      return this.plan && this.plan.plan_type && this.plan.plan_type.code === Enum.WorkPlanTypes.Standart
    },
    isRespUser() {
      return this.event && this.respUserExists(this.loginedUserId)
    },
    isSummaryDepartmentUser(){
      return this.event && this.summaryDepartmentExists(this.loginedUserId);
    },
    currentDate() {
      return new Date();
    },
    isVisibleWritableField(){
      if (!this.resultData) {
        return true
      }

      let userResults = this.resultData
      if (this.isPlanCreator) {
        userResults = this.resultData.filter(x => x.user_id === this.loginedUserId)
      }
      let userData = !userResults.some(x => x.plan_event_result_history?.every(x => x.modi_user_id === this.loginedUserId && (x.state_id === 5 || x.state_id === 6)))
      return userData
    },
    shouldShowRejectSidebar() {
      const event = this.event;
      const resultData = this.resultData;

      return (
        resultData &&
        resultData[0].plan_event_result_history[0].state_id === 6 &&
        ((this.loginedUserId === resultData[0].result_text[0].user.userID && event) ||
          (this.isAdmin && event) || (this.isPlanCreator && event))
      );
    },
    rejectHistory() {
      return this.resultData || {};
    },
    filteredQuarters() {
      return this.filterQuarters();
    }
  },
  mounted() {
    this.isAdmin = this.findRole(null, 'main_administrator')
    if (!this.event_id) {
      this.event_id = this.$route.params.id;
    }
    this.getEvent();

  },

  methods: {
    findRole: findRole,
    openModiPersonHistory(data) {
            this.modiDialogData = data;
            if(this.modiDialogData?.text?.length > 0){
              this.commentParseJson = JSON.parse(this.modiDialogData.text);
            }
            
            this.modifiedHistory = true;
    },
    getFirstMonthOfQuarter() {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; //1-12
      let firstMonthOfQuarter;

      if (currentMonth >= 1 && currentMonth <= 3) { // 1, 2, 3
        firstMonthOfQuarter = 1;
      } else if (currentMonth >= 4 && currentMonth <= 6) { // 4, 5, 6
        firstMonthOfQuarter = 4;
      } else if (currentMonth >= 7 && currentMonth <= 9) { // 7, 8, 9
        firstMonthOfQuarter = 7;
      } else if (currentMonth >= 10 && currentMonth <= 12) { // 10, 11, 12
        firstMonthOfQuarter = 10;
      }

      return firstMonthOfQuarter;
    },
    filterQuarters() {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentQuarter = Math.ceil(currentMonth / 3);
      const currentDay = currentDate.getDate();
      if (currentDay <= 15 && currentMonth === this.getFirstMonthOfQuarter()) {
        // Agymdagy ai agymdagy toqsannyng birinshi aiy bolsa aldyngy toqsanga natije toltyra alady
        return this.quarters.filter(quarter => quarter.value >= currentQuarter - 1 && quarter.value <= currentQuarter);
      } else {
        // Tek agymdagy toqsandy korsetu
        return this.quarters.filter(quarter => quarter.value === currentQuarter);
      }
    },
    getQuarter(quarterValue){
      const selectedLangKey = 'quarter_' + this.$i18n.locale;
      const quarter = this.quarters.find(quarter => quarter.value === quarterValue && quarter[selectedLangKey]);
      return quarter ? quarter[selectedLangKey] : '';
    },
    validate(){
      this.validation.quarter = !this.selectedQuarter
      return this.validation.quarter
    },
    toggle(ref, event) {
      this.$refs[ref].toggle(event);
    },
    toggleHistory(ref, data) {
      this.$refs[ref].toggle(data);
    },
    clearResultFilter(){
      this.resultFilter.responsiveUser = null;
      this.resultFilter.quarter = null;
      this.getData()
    },
    initWordCount(count) {
      this.inputWordCount = count
    },
    respUserExists(id) {
      return this.event.user.some(user => user.id === id)
    },
    summaryDepartmentExists(id){
      return this.event.user.some(user => user.id === id && user.is_summary_department)
    },
    getEvent() {
      this.planService.getEventById(this.event_id).then(res => {
        if (res.data) {
          this.event = res.data.event;
          this.plan = res.data.plan;
          this.givenDate = this.event.created_date;
          if (this.plan && this.plan.user.id === this.loginedUserId) {
            this.isPlanCreator = true;
          } else {
            this.isPlanCreator = false;
          }
          if (this.event && this.event.user) {
            this.isPlanCreatorApproval = this.event.user.find(e => e.id === this.loginedUserId) !== null && this.isPlanCreator;
            this.isCurrentUserApproval = this.event.user.find(e => e.id === this.loginedUserId);
          }
          this.getData();
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    getData() {
      const data = {
        event_id : this.event.work_plan_event_id,
        result_filter: JSON.parse(JSON.stringify(this.resultFilter))
      }

      if (data.result_filter.responsiveUser) {
        data.result_filter.responsiveUser = data.result_filter.responsiveUser[0]
      }

      this.planService.getEventResult(data).then(res => {
        if (res.data) {
          this.resultData = res.data;
          let factData = this.resultData[0].fact
          this.fact = factData

          if (this.resultData.result_text != null) {
            this.resultData.result_text.map(e => {
              e.isActive = false;
            });
          }
          if (this.resultData.result_text === null) {
            this.resultData.result_text.map(e => {
              e.isActive = true;
            });
          }
          this.fact = this.resultData.fact;
          this.resultData.forEach(e => {
            if (e.plan_event_result_history && e.plan_event_result_history.some(x => (x.state_id === 5 || x.state_id === 6))) {
              this.hasResultToApprove = !this.isPlanCreator && e.plan_event_result_history.some(x => (x.state_id === 5 || x.state_id === 6))
            }
          })
        }else if(res.data === null){
          this.resultData = res.data;
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        }else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });

    },
    initMenu() {
      const createConfirmationDialog = (status_code) => {
        return {
          message: this.$t("common.confirmation"),
          header: this.$t("common.confirm"),
          icon: "pi pi-exclamation-triangle",
          rejectClass: "p-button-secondary p-button-outlined",
          rejectLabel: this.$t("common.cancel"),
          acceptLabel: this.$t("common.continue"),
          accept: () => {
            let params = {
              event_id: this.event.work_plan_event_id || null,
              status_code: status_code || null,
            };
            this.planService
              .updateEventStatus(params)
              .then((res) => {
                this.$toast.add({
                  severity: "success",
                  detail: this.$t("common.success"),
                  life: 3000,
                });
                //this.getEventsTree();
                this.getEvent();
              })
              .catch((error) => {
                this.$toast.add({
                  severity: "error",
                  summary: error.message || this.$t('workPlan.errorUpdatingStatus'),
                  life: 3000,
                });
              });
          },
          reject: () => {
            this.$toast.add({
              severity: "info",
              summary: this.$t('common.cancel'),
              detail: this.$t('workPlan.operationCanceled'),
              life: 3000,
            });
          },
        };
      };
      return [
        {
          label: "",
          icon: "pi pi-fw pi-refresh",
          command: () => {
            this.getEvent();
            this.$toast.add({severity: 'success', detail: this.$t('common.success'), life: 3000});
          },
        },
        {
          label: this.$t("common.send"),
          icon: "fa-regular fa-paper-plane",
          disabled: this.isDisabled,
          command: () => {
            this.saveResult();
          },
        },
        {
        label: this.$t('common.action.accept'),
        icon: 'pi pi-check',
        visible: this.isPlanCreator && (this.isOperPlan || this.isStandartPlan),
        items: [
        {
          label: this.$t("common.done"),
          icon: "pi pi-verified",
          command: () => {
            this.$confirm.require(createConfirmationDialog(2));
          },
        },
        {
          label: this.$t("workPlan.partiallyCompleted"),
          icon: "pi pi-chart-pie",
          command: () => {
            this.$confirm.require(createConfirmationDialog(4));
          },
        },
        {
          label: this.$t("common.notDone"),
          icon: "pi pi-times-circle",
          command: () => {
            this.$confirm.require(createConfirmationDialog(3));
          },
        },
        ]
        },
      ];
    },
    saveResult() {
      if ((!this.isOperPlan && this.result === null) || (this.isOperPlan && this.newResult === null)) {
        this.$toast.add({severity: 'error', detail: this.$t('common.message.fillError'), life: 3000});
        this.isDisabled = true;
        setTimeout(() => {
          window.location.reload();
        }, 10000);

        return
      }

      if ((this.isOperPlan || this.isStandartPlan) && this.validate()) {
        this.$toast.add({severity: 'error', detail: this.$t('common.message.fillError'), life: 3000});
        return
      }
      this.submitted = true
      this.isBlockUI = true;

      const fd = new FormData();
      if (this.isOperPlan){
        this.wordLimit = 0
      }
      if (!this.isStandartPlan && (this.inputWordCount > this.wordMaxLimit || this.inputWordCount < this.wordLimit)) {
        this.$toast.add({severity: 'warn', detail: this.$t('workPlan.maxWordCount', this.wordMaxLimit), life: 3000})
        this.isBlockUI = false;
        return;
      }

      fd.append('work_plan_event_id', this.event.work_plan_event_id);
      fd.append('result', this.isOperPlan ? this.newResult ? this.newResult : "" : this.result);
      if (this.plan && this.isOperPlan) {
        fd.append("quarter", this.selectedQuarter.value);
        fd.append("is_partially", true);
      }

      if (this.authUser?.mainPosition?.department &&
        !this.authUser.mainPosition.department.isFaculty &&
        this.isOperPlan) {
        fd.append("fact", this.event.fact);
      }

      if (this.plan && this.isOperPlan && this.resultData)
        fd.append("result_id", this.resultData.event_result_id);
      if (this.files.length > 0) {
        let fullName = this.authUser.thirdName + ' ' + this.authUser.firstName

        if (this.authUser.lastName && this.authUser.lastName.length > 0) {
          fullName += ' ' + this.authUser.lastName
        }

        for (let file of this.files) {
          fd.append('files', file, fullName.replace(/ /g, '_') + "_" + file.name)
        }
      }
      this.planService.saveEventResult(fd).then(res => {
        if (res.data.is_success || res.data.is_fact_success) {
          this.getEvent();
          this.clearModel();
          this.isBlockUI = false;
        }
        this.files = [];
        this.submitted = false
        this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
      }).catch(error => {
        this.isBlockUI = false;
        this.submitted = false
        this.$toast.add({severity: "error", summary: error, life: 3000});
      });
    },
    sendResultForVerification() {
      let data = {
        event_id: parseInt(this.event.work_plan_event_id),
        result_id: parseInt(this.resultData.event_result_id)
      }
      this.planService.sendResultToVerify(data).then(res => {
        if (res.data.is_success) {
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
          this.getEvent();
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    getResultHistory() {
      let data = {
        event_id : this.event.work_plan_event_id
      }
      this.planService.getEventResultHistory(data).then(res => {
        if (res.data) {
          this.history = res.data;
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    showToCorrectSidebar() {
      this.toCorrectSidebar = true;
    },
    showToCorrectSidebarNew(resultUserID, resultID) {
      this.toCorrectSidebar = true;
      this.isInspected = false;
      this.resultUserId = parseInt(resultUserID)
      this.eventResultId = parseInt(resultID)
    },
    verify(status) {
      const data = {};
      data.is_success = status;
      data.event_id = this.event.work_plan_event_id;
      if (!status) {
        data.comment = this.rejectComment;
        data.result_id = this.resultData.event_result_id;
      }

      this.planService.verifyEventResult(data).then(res => {
        if (res.data && res.data.is_success) {
          this.toCorrectSidebar = false;
          this.$toast.add({
            severity: 'success',
            summary: this.$t('common.success'),
            life: 3000,
          });
          this.getEvent();
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    verifyHistory(isInspected, userId, resultId) {
      let comment = "";
      comment = this.rejectComment

      this.planService.verifyEventResultHistory(this.isInspected, comment, this.resultUserId, this.user_id, this.eventResultId).then(res => {
        if (res.data) {
          this.$toast.add({
            severity: 'success',
            summary: this.$t('common.success'),
            life: 3000,
          });
          this.getEvent();
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    confirmToInspected(isInspected, userId, resultId) {
      this.isInspected = true;
      this.resultUserId = userId;
      this.eventResultId = resultId;
      this.$confirm.require({
        target: event.currentTarget,
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        group: 'deleteResult',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.verifyHistory(this.isInspected, null, this.resultUserId, this.user_id, this.eventResultId);
        }
      });
    },
    confirmToRevision() {
      this.isInspected = false;
      this.$confirm.require({
        target: event.currentTarget,
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        group: 'deleteResult',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.verifyHistory(this.isInspected, null, this.resultUserId, this.user_id, this.eventResultId);
          this.toCorrectSidebar = false;
        }
      });

    },
    changeTab() {
      if (this.activeIndex === 1) {
        this.getResultHistory();
      }
    },
    editorChange(event) {
      if ((this.result != null && this.result.length > 0) || (this.newResult != null && this.newResult.length > 0)) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    },
    resultInput(e) {
      if (e.target.value.length > 0) {
        this.initMenu()[1].disabled = false;
      } else {
        this.initMenu()[1].disabled = true;
      }
      this.resizeArea();
    },
    clearModel() {
      this.event_name = null;
      this.parentId = null;
      this.quarter = null;
      this.result = null;
      this.newResult = null;
      this.selectedUsers = null;
    },
    navigateToBack() {
      this.$router.push({name: 'WorkPlanEvent', params: {id: this.plan.work_plan_id}});
    },
    uploadFile(event) {
      if (event.files.length > 10) {
        this.$toast.add({
          severity: "info",
          summary: this.$t('workPlan.message.maxFileUploadSize'),
          life: 3000,
        });
        this.clearFiles();
        return;
      }
      for (let file of event.files) {
        this.files.push(file);
      }
      this.clearFiles();
      this.isDisabled = false;

    },
    resizeArea() {
      this.$nextTick(() => {
        const textarea = this.$refs.resultContainer.$el;
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    },
    factChange(event) {
      this.isDisabled = false;
      this.isFactChanged = true;
    },
    removeFile(index) {
      let removedFile = this.files.splice(index, 1)[0];
      this.files = [...this.files];
      this.$emit('remove', {
        file: removedFile,
        files: this.files
      });

    },
    openInplace(item) {
      this.fact = item.fact
      this.selectedQuarter = item.result_text[0].quarter
      item.isActive = true;
    },
    saveEditResult(item) {
      if ((this.isOperPlan || this.isStandartPlan) && this.validate()) {
        this.$toast.add({severity: 'error', detail: this.$t('common.message.fillError'), life: 3000});
        return
      }

      this.loading = true;
      const fd = new FormData();
      fd.append("result_id", item.event_result_id)
      fd.append("result_text_id", item.result_text[0].id)
      fd.append("work_plan_event_id", item.work_plan_event_id)
      fd.append("quarter", item.result_text[0].quarter);


      if (this.isFactChanged)
        fd.append("fact", this.event.fact)
      fd.append("text", item.result_text[0].text)
      if (this.files.length > 0) {
        for (let file of this.files) {
          fd.append('files', file, this.authUser.fullName.replace(/ /g, '_') + "_" + file.name)
        }
      }
      this.planService.editEventResult(fd).then(res => {
        if (res.data.is_success) {
          this.getEvent();
          this.files = [];
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
          item.isActive = false;
          this.loading = false;
        }
      }).catch((error) => {
        this.loading = false;
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    cancelEdit(item) {
      item.isActive = false;
    },
    deleteConfirmItem(event, item) {
      this.$confirm.require({
        target: event.currentTarget,
        group: 'deleteResult',
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.deleteItem(item);

        }
      });
    },
    deleteItem(item) {
      if (!item.result_text || !item.result_text[0] || !item.result_text[0].id || !item.event_result_id) {
        console.error('Invalid item');
        return;
      }
      const data = {
        result_text_id : item.result_text[0].id,
        event_result_id : item.event_result_id
      }
      this.planService.deleteEventResult(data).then(res => {
        if (res.data.is_success) {
          this.getEvent();
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
        }
      }).catch((error) => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    deleteFileConfirm(event, id) {
      this.$confirm.require({
        target: event.currentTarget,
        message: this.$t('common.confirmation'),
        header: this.$t('common.confirm'),
        group: 'deleteResult',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-rounded p-button-success',
        rejectClass: 'p-button-rounded p-button-danger',
        accept: () => {
          this.deleteFile(id);
        }
      });
    },
    deleteFile(id) {
      this.planService.deleteResultFile(id).then(res => {
        if (res.data.is_success) {
          this.getEvent();
          this.$toast.add({severity: 'success', detail: this.$t('common.done'), life: 3000});
        }
      }).catch((error) => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
      });
    },
    formatDateMoment(date) {
      return moment(new Date(date)).utc().format("DD.MM.YYYY HH:mm:ss")
    },
    formatDate(value) {
      let result = "";
      if (value == null) {
        return result;
      }
      let date = new Date(value);
      result = date.toLocaleDateString("kk-KZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return result == "Invalid Date" ? "" : result;
    },
    clearFiles() {
      this.$refs.form.clear();
      this.$refs.form.uploadedFileCount = 0;
    },
    downloadFile(file) {
      this.isBlockUI = true;
      let url = `${smartEnuApi}/serve?path=${file.event_result_file}`
      fetch(url, {
        method: 'GET',
        headers: getHeader()
      })
          .then(response => response.blob())
          .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = file.file_name;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove();
            this.isBlockUI = false;
          }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch("logLout");
        } else {
          this.$toast.add({
            severity: "error",
            summary: error,
            life: 3000,
          });
        }
        this.isBlockUI = false;
      });
    },
    getResultStatus(code) {
      const foundStatus = this.resultStatus.find(status => status.id === code);

      if (foundStatus) {
        switch (this.$i18n.locale) {
          case "kz":
            return foundStatus.name_kz;
          case "ru":
            return foundStatus.name_ru;
          case "en":
            return foundStatus.name_en;
          default:
            return null;
        }
      } else {
        return null;
      }
    },
    getHistoryStatus(code) {
      const foundStatus = this.historyStatus.find(status => status.id === code);

      if (foundStatus) {
        switch (this.$i18n.locale) {
          case "kz":
            return foundStatus.name_kz;
          case "ru":
            return foundStatus.name_ru;
          case "en":
            return foundStatus.name_en;
          default:
            return null;
        }
      } else {
        return null;
      }
    },
    showRejectMessageSidebar() {
      this.rejectMessageSidebar = true;
    },
  }
}
</script>

<style scoped lang="scss">
.p-fileupload-content {
  position: relative;
}

.p-fileupload-row {
  display: flex;
  align-items: center;
  padding: 5px;
}

.p-fileupload-row > div {
  flex: 1 1 auto;
  width: 25%;
}

.p-fileupload-row > div:last-child {
  text-align: right;
}

.p-fileupload-content .p-progressbar {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.p-button.p-fileupload-choose input[type=file] {
  display: none;
}

.p-fileupload-choose.p-fileupload-choose-selected input[type=file] {
  display: none;
}

.p-fileupload-filename {
  word-break: break-all;
}

.p-fluid .p-fileupload .p-button {
  width: auto;
}

.color-success {
  color: #689F38;
}


.customer-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;
  display: inline-block;
  text-align: center;
  &.status-9 {
    background: #cc33ff;
    color: #fff;
  }

  &.status-7 {
    background: #10b981;
    color: #fff;
  }

  &.status-6 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-5 {
    background: #f1c21b;
    color: #fff;
  }

  &.status-4 {
    background: #d9873e;
    color: #ffffff;
  }

  &.status-3 {
    background: #FFCDD2;
    color: #C63737;
  }

  &.status-2 {
    background: #C8E6C9;
    color: #256029;
  }
}

::v-deep(.p-inplace-display) {
  padding: 0;
}

::v-deep(.velmld-overlay) {
  background-color: rgba(0, 0, 0, 0.4) !important;
}

::v-deep(.p-divider-solid.p-divider-horizontal:before) {
  border-top-style: solid !important;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.userMenu {
  height: 36px;
  margin: -7px -14px 10px;
  z-index: 9999;
}

.customer-badge.value-1 {
  background-color: #007bff;
  color: #ffffff;
}

.customer-badge.value-2 {
  background-color: #b30077;
  color: #ffffff;
}

.customer-badge.value-3 {
  background-color: #6666ff;
  color: #ffffff;
}

.customer-badge.value-4 {
  background-color: #cc33ff;
  color: #ffffff;
}
@media screen and (max-width: 768px) {
  .overlay-panel {
    max-width: 90vw; /* Adjust the percentage as needed */
  }
}
.dialog-content {
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.field {
  margin-bottom: 1rem;
}

.bold {
  font-weight: bold;
  color: #333;
}

.value {
  display: block;
  margin-top: 0.25rem;
  color: #555;
  font-size: 1rem;
}

p.value {
  margin: 0;
}
.input-group-wrapper {
  margin-top: 0.5rem; /* Space between fields and input group */
}

.input-group-addon {
  margin-left: 1rem; /* Space between individual input group addons */
}

</style>
