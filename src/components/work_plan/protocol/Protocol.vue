<template>
  <div class="col-12">
    <div v-if="protocolDocInfo?.docType === Enum.DocType.WorkPlanProtocolExtract">
      <TitleBlock :title="$t('contracts.menu.registerProtocolExtracts')" :show-back-button="true"/>
    </div>
    <div v-else>
      <TitleBlock :title="$t('common.protocol')" :show-back-button="true"/>
    </div>
    <ToolbarMenu :data="protocolMenu" :filter="true"/>
    <ProgressBar v-if="saveLoading" class="mb-3" mode="indeterminate" style="height: .5em"/>
    <TabView>
      <TabPanel :header="$t('common.params')">
        <div class="content" v-if="isProtocolDoc">
          <div class="w-full md:w-5">
            <div class="fluid">
              <div class="field">
                <label for="status">{{ $t('common.status') }}{{ ": " }}</label>
                <span :class="'status-badge status-' + protocolDocInfo?.docHistory?.stateId">
                  {{
                    $i18n.locale === "kz" ? protocolDocInfo?.docHistory?.stateKaz : $i18n.locale === "ru" ?
                        protocolDocInfo?.docHistory?.stateRus : protocolDocInfo?.docHistory?.stateEn
                  }}
                </span>
              </div>
              <!-- v-if="plan.reject_history.user" -->
              <div v-if="isRejected">
                <div class="field">
                  <label>{{ $t('contracts.assigner') }}:</label>
                  &nbsp;<b>{{ revisionSetterFullName }}</b>
                </div>
                <div class="field" v-if="protocolDocInfo?.docHistory?.setDate">
                  <label>{{ $t('common.date') }}:</label>
                  &nbsp;<b>{{ formatDateMoment(protocolDocInfo?.docHistory?.setDate, true) }}</b>
                </div>
                <div class="field">
                  <label>{{ $t('common.comment') }}:</label>
                  <div>
                    <Message :closable="false" severity="warn"><span
                        v-html="protocolDocInfo?.docHistory?.comment"></span></Message>
                  </div>
                </div>
              </div>

            </div>
            <div class="p-fluid mt-4 block mb-2">
              <label for="number" class="block mb-1">{{ $t('common.number') }}</label>
              <InputText id="number" class="mt-2" v-model="protocolNumber" :disabled="true"
                         :placeholder="$t('workPlan.protocol.autogenerate')"/>
            </div>
            <div class="p-fluid mt-3">
              <label for="createdDate" class="block mb-1">{{ $t('workPlan.protocol.createdDate') }}</label>
              <InputText id="createdDate" class="mt-2" v-model="protocolCreatedDate" :disabled="true"
                         :placeholder="$t('workPlan.protocol.autogenerate')"/>
            </div>
            <div class="p-fluid mt-3">
              <label for="meetingTime" class="block mb-1">{{ $t('workPlan.protocol.meetingTime') }}</label>
              <PrimeCalendar v-model="data[0].meeting_date" showIcon :showOnFocus="false" inputId="buttondisplay"
                             showTime hourFormat="24" :disabled="isInApprove || isApproved"/>
                             <small class="p-error" v-if="validation.meeting_date">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="p-fluid mt-3">
              <label for="meetingPlace" class="block mb-1">{{ $t('workPlan.protocol.meetingPlace') }}{{ "*" }}</label>
              <Textarea id="meetingPlace" v-model="data[0].meeting_place" class="mt-2" rows="3"
                        :disabled="isInApprove || isApproved"/>
                        <small class="p-error" v-if="validation.meeting_venue">{{ $t("common.requiredField") }}</small>

            </div>
            <div class="p-fluid mt-3">
              <label for="participatedMembers" class="block mb-1">{{
                  $t('workPlan.protocol.participatedMembers')
                }}{{ "*" }}</label>
              <FindUser class="mt-2" v-model="participatedBoardMembers" :editMode="true" :user-type="3"
                        :disabled="isInApprove || isApproved"/>
                        <small class="p-error" v-if="validation.participated_members">{{ $t("common.requiredField") }}</small>

            </div>
            <div class="p-fluid mt-3">
              <div :class="{ 'inactiveMode': isApproved }">
                <Panel :header="$t('workPlan.protocol.absentMembers')" toggleable :collapsed="isCollapsedAbsent"
                       @toggle="onToggleAbsent">
                  <template #togglericon="{ collapsed }">
                    <i :class="collapsed ? 'pi pi-angle-down' : 'pi pi-angle-up'"
                       class="custom-toggler-icon border-round-xl"></i>
                  </template>
                  <template #header>
                    <div class="flex justify-between items-center">
                      <span>{{ $t('workPlan.protocol.absentMembers') }}{{ "&nbsp;&nbsp;&nbsp;" }}</span>
                    </div>
                  </template>

                  <p v-if="data[0]?.absent_members?.length > 0" class="m-0">
                    <DataTable :lazy="true" :value="data[0]?.absent_members" :dataKey="'member.userID'"
                               :loading="loading" responsiveLayout="scroll">
                      <Column header="#"></Column>
                      <Column :header="$t('common.fullName')">
                        <template #body="{ data }">
                          {{ data?.member && data.member?.full_name }}
                        </template>
                      </Column>
                      <Column field="reason" :header="$t('workPlan.protocol.reasonAbsence')">
                        <template #body="{ data }">
                          {{ data?.reason }}
                        </template>
                      </Column>
                      <Column field="delete">
                        <template #body="{ data }">
                          <div v-if="!isInApprove && !isApproved">
                            <Button icon="pi pi-trash" @click="deleteAbsentMember(data)"
                                    :disabled="isInApprove || isApproved"/>
                          </div>

                        </template>
                      </Column>
                    </DataTable>
                  </p>
                  <p v-else>
                    {{ $t('common.noData') }}
                  </p>
                </Panel>
              </div>
            </div>
            <div class="p-fluid mt-3" v-if="!isInApprove && !isApproved">
              <Button icon="pi pi-plus" class="primary" :label="$t('workPlan.protocol.absentMembers')"
                      @click="addAbsentMember" :disabled="isInApprove || isApproved"></Button>
            </div>
            <div class="p-fluid mt-3">
              <label for="quorumInfo" class="block mb-1">{{ $t('workPlan.protocol.quorumInfo') }}</label>
              <Textarea id="quorumInfo" v-model="data[0].quorum_info" class="mt-2" rows="3"
                        :disabled="isInApprove || isApproved"/>

            </div>
            <div class="p-fluid mt-3">
              <label for="invitedPersons" class="block mb-1">{{ $t('workPlan.protocol.invitedPersons') }}{{
                  "*"
                }}</label>
              <FindUser class="mt-2" v-model="invitedBoardMembers" :editMode="true" :user-type="3"
                        :disabled="isInApprove || isApproved"/>
                        <small class="p-error" v-if="validation.invited_persons">{{ $t("common.requiredField") }}</small>
            </div>
            <div class="p-fluid mt-3" v-if="!isInApprove">
              <Panel :header="$t('workPlan.protocol.agendas')" toggleable :collapsed="isCollapsed" @toggle="onToggle">
                <template #togglericon="{ collapsed }">
                  <i :class="collapsed ? 'pi pi-angle-down' : 'pi pi-angle-up'"
                     class="custom-toggler-icon border-round-xl"></i>
                </template>
                <template #header>
                  <div class="flex justify-between items-center">
                    <span>{{ $t('workPlan.protocol.agendas') }}{{ "&nbsp;&nbsp;&nbsp;" }}</span>
                  </div>
                </template>

                <div class="border-round mb-3" style="border:1px solid #dee2e6;padding: 1rem;" v-for="item in events"
                     :key="item?.event_id">

                  <p class="mb-2 text-right" v-if="isApproved">
                    <a @click="createProtocolExtractConfirm(item?.event_id)"
                       style="border-bottom: 1px solid #777; padding-bottom: 1px;color:#666;cursor: pointer;"><i>{{
                        $t('workPlan.protocol.generateDocStatement')
                      }}</i></a>
                  </p>
                  <p class="m-0" @click="handlePtagClick(item?.event_id)"
                     :style="{ cursor: isInApprove || isApproved ? 'not-allowed' : 'pointer' }">
                    <a :class="{ disabled: isInApprove || isApproved }"
                       :style="{ color: isInApprove || isApproved ? 'gray' : '', cursor: isInApprove || isApproved ? 'not-allowed' : '', pointerEvents: isInApprove || isApproved ? 'none' : '' }">{{
                        item?.event_name
                      }}</a>
                  </p>
                </div>

                <div class="p-fluid mt-3 surface-ground pt-3 pb-1 pl-3 pr-3 rounded">
                  <label for="votingResults" class="block mb-1">{{ $t('workPlan.protocol.votingResults') }}{{
                      "*"
                    }}</label>

                  <div class="grid mt-3">
                    <div class="col-6">
                      <div class="grid">
                        <div class="col-6">
                          <div class=""><label for="aye" class="w-5">{{ $t('workPlan.protocol.aye') }}{{
                              " - "
                            }}</label></div>
                        </div>
                        <div class="col-4">
                          <div class="">
                            <InputText id="aye" type="number" v-model="votingResults.vote_aye" class="w-9"
                                       :disabled="isInApprove || isApproved"/>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="grid">
                        <div class="col-6">
                          <div class=""><label for="abstained" class="w-5">{{
                              $t('workPlan.protocol.abstained')
                            }}{{ " - " }}</label></div>
                        </div>
                        <div class="col-4">
                          <div class="">
                            <InputText id="abstained" type="number" v-model="votingResults.vote_abstained" class="w-9"
                                       :disabled="isInApprove || isApproved"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="grid">
                    <div class="col-6">
                      <div class="grid">
                        <div class="col-6">
                          <div class=""><label for="con" class="w-5">{{ $t('workPlan.protocol.con') }}{{
                              " - "
                            }}</label></div>
                        </div>
                        <div class="col-4">
                          <div class="">
                            <InputText id="con" type="number" v-model="votingResults.vote_con" class="w-9"
                                       :disabled="isInApprove || isApproved"/>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="grid">
                        <div class="col-6">
                          <div class=""><label for="decisionAccepted" class="w-5">{{
                              $t('workPlan.protocol.decisionAccepted')
                            }}{{
                              " - "
                            }}</label></div>
                        </div>
                        <div class="col-4">
                          <div class="">
                            <InputText id="decisionAccepted" type="number" v-model="votingResults.vote_total_decisions"
                                       class="w-9" :disabled="isInApprove || isApproved"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-fluid mt-3">
                  <label for="closingTimeMeeting" class="block mb-1">{{
                      $t('workPlan.protocol.closingTimeMeeting')
                    }}</label>
                  <PrimeCalendar v-model="data[0].session_closed_time" showIcon :showOnFocus="false"
                                 inputId="buttondisplay" showTime hourFormat="12" :timeOnly="true"
                                 :disabled="isInApprove || isApproved"/>
                </div>
              </Panel>
            </div>
          </div>
        </div>
        <div class="content" v-if="isProtocolExtractDoc">
          <div class="w-full md:w-5">
            <div class="fluid">
              <div class="field">
                <label for="status">{{ $t('common.status') }}{{ ": " }}</label>
                <span :class="'status-badge status-' + protocolDocInfo?.docHistory?.stateId">
                  {{
                    $i18n.locale === "kz" ? protocolDocInfo?.docHistory?.stateKaz : $i18n.locale === "ru" ?
                        protocolDocInfo?.docHistory?.stateRus : protocolDocInfo?.docHistory?.stateEn
                  }}
                </span>
              </div>
              <div v-if="isRejected">
                <div class="field">
                  <label>{{ $t('contracts.assigner') }}:</label>
                  &nbsp;<b>{{ revisionSetterFullName }}</b>
                </div>
                <div class="field" v-if="protocolDocInfo?.docHistory?.setDate">
                  <label>{{ $t('common.date') }}:</label>
                  &nbsp;<b>{{ formatDateMoment(protocolDocInfo?.docHistory?.setDate, true) }}</b>
                </div>
                <div class="field">
                  <label>{{ $t('common.comment') }}:</label>
                  <div>
                    <Message :closable="false" severity="warn"><span
                        v-html="protocolDocInfo?.docHistory?.comment"></span>
                    </Message>
                  </div>
                </div>
              </div>
            </div>
            <div class="p-fluid mt-4 block mb-2">
              <label for="number" class="block mb-1">{{ $t('common.number') }}</label>
              <InputText id="number" class="mt-2" v-model="protocolNumber" :disabled="extractEditDisabled"
                         :placeholder="$t('workPlan.protocol.autogenerate')"/>
            </div>
            <div class="p-fluid mt-3">
              <label for="createdDate" class="block mb-1">{{ $t('workPlan.protocol.createdDate') }}</label>
              <InputText id="createdDate" class="mt-2" v-model="protocolDocInfo.params[0].value.created_date"
                         :disabled="true" :placeholder="$t('workPlan.protocol.autogenerate')"/>
            </div>
            <div class="p-fluid mt-3">
              <label for="createdDate" class="block mb-1">{{ $t('workPlan.protocol.presentDateTime') }}</label>
              <InputText id="presentDate" class="mt-2" v-model="protocolCreatedDate" :disabled="extractEditDisabled"
                         :placeholder="$t('workPlan.protocol.autogenerate')"/>
            </div>
            <div class="p-fluid mt-3">
              <label for="agendas" class="block mb-1">{{ $t('workPlan.protocol.agendas') }}{{ "*" }}</label>
              <Textarea id="agendas" v-model="selectedAgenda.agenda" class="mt-2" rows="5" :disabled="true"/>
            </div>
            <div class="p-fluid mt-3">
              <label for="listened" class="block mb-1">{{ $t('workPlan.protocol.listened') }}{{ "*" }}</label>
              <FindUser class="mt-2" v-model="boardDecisionSpeaker" :max="1" :editMode="true" :user-type="3"
                        :disabled="isInApprove || isApproved || extractEditDisabled"/>
              <Textarea id="agendas" v-model="selectedAgenda.agenda" class="mt-2" rows="5"
                        :disabled="isInApprove || isApproved || extractEditDisabled"/>
            </div>
            <div class="p-fluid mt-3">
              <label for="boardDecisions" class="block mb-1">{{ $t('workPlan.protocol.boardDecision') }}{{
                  "*"
                }}</label>
              <div v-for="(decision, index) in selectedAgenda.board_decisions" :key="decision.id" class="mt-2">
                <TinyEditor :id="'decision-' + index" v-model="decision.board_decision"
                            @input="updateBoardDecision(index, decision.board_decision)" :height="300"
                            :disabled="isInApprove || isApproved || extractEditDisabled"/>
              </div>
            </div>
            <div class="p-fluid mt-3">
              <label for="listened" class="block mb-1">{{ $t('workPlan.protocol.responsivePerson') }}{{ "*" }}</label>
              <FindUser class="mt-2" v-model="responsivePerson" :max="1" :editMode="true" :user-type="3"
                        :disabled="isInApprove || isApproved || extractEditDisabled"/>
            </div>
            <div class="p-fluid mt-3">
              <label for="listened" class="block mb-1">{{ $t('workPlan.protocol.deadline') }}{{ "*" }}</label>
              <PrimeCalendar v-model="selectedAgenda.board_decisions[0].deadline" showIcon :showOnFocus="false"
                             inputId="buttondisplay" showTime hourFormat="24"
                             :disabled="isInApprove || isApproved || extractEditDisabled"/>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel :header="$t('common.show')">
        <div class="content">
          <ProgressBar v-if="!sourceb64" mode="indeterminate" style="height: .5em"/>
          <embed :src="sourceb64" style="width: 100%; height: 1000px" v-if="sourceb64" type="application/pdf"/>
        </div>
      </TabPanel>
    </TabView>
    <Dialog :header="$t('workPlan.protocol.addAbsentMembers')" v-model:visible="addNonParticipateMemberModal"
            :style="{ width: '600px' }" :close-on-escape="true" @hide="handleHide">
      <div class="p-fluid mt-3">
        <label for="absentMember" class="block mb-1">{{ $t('workPlan.protocol.absentMembers') }}{{ "*" }}</label>
        <FindUser class="mt-2" v-model="absentBoardMembers" :editMode="true" :max="1" :user-type="3"
                  :disabled="isInApprove"/>
      </div>
      <div class="p-fluid mt-3">

        <label for="reason" class="block mb-1">{{ $t('workPlan.protocol.reasonAbsence') }}{{ "*" }}</label>
        <Textarea id="reasonAbsence" v-model="selectedAbsentMember[0].reason" class="mt-2" rows="3"
                  :disabled="isInApprove"/>
      </div>
      <template #footer>
        <div>
          <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                  @click="emitHide" :disabled="isInApprove"/>
          <Button :label="$t('common.add')" icon="pi pi-check" class="ml-2 p-button-rounded p-button-success mr-2"
                  @click="addAbsentMembers" :disabled="isInApprove"/>
        </div>
      </template>
    </Dialog>
    <Sidebar v-model:visible="agendasModalVisible" :header="$t('workPlan.protocol.agendas')" class="surface-100"
             position="right" :style="{ width: '700px' }">
      <ToolbarMenu :data="agendasMenu" :filter="true"/>
      <div class="content bg-white pl-4 pr-4 pt-2 pb-4">
        <div class="p-fluid mt-3">
          <label for="agendas" class="block mb-1">{{ $t('workPlan.protocol.agendas') }}{{ "*" }}</label>
          <Textarea id="agendas" v-model="agendaData.agenda" class="mt-2" rows="5" :disabled="isInApprove"/>
        </div>
        <div class="p-fluid mt-3">
          <label for="speaker" class="block mb-1">{{ $t('workPlan.protocol.speaker') }}{{ "*" }}</label>
          <FindUser class="mt-2" v-model="boardAgendaSpeaker" :editMode="true" :user-type="3" :disabled="isInApprove"/>
        </div>
        <div class="p-fluid mt-3 surface-ground pt-3 pb-1 pl-3 pr-3 rounded">
          <label for="votingResults" class="block mb-1">{{ $t('workPlan.protocol.votingResults') }}{{ "*" }}</label>
          <div class="grid mt-3">
            <div class="col-6">
              <div class="grid">
                <div class="col-6">
                  <div class=""><label for="aye" class="w-5">{{ $t('workPlan.protocol.aye') }}{{ " - " }}</label></div>
                </div>
                <div class="col-4">
                  <div class="">
                    <InputText id="aye" v-model="agendaVotingResults.vote_aye" class="w-7" :disabled="isInApprove"/>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="grid">
                <div class="col-6">
                  <div class=""><label for="aye" class="w-5">{{ $t('workPlan.protocol.abstained') }}{{ " - " }}</label>
                  </div>
                </div>
                <div class="col-4">
                  <div class="">
                    <InputText id="aye" v-model="agendaVotingResults.vote_abstained" class="w-7"
                               :disabled="isInApprove"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid">
            <div class="col-6">
              <div class="grid">
                <div class="col-6">
                  <div class=""><label for="aye" class="w-5">{{ $t('workPlan.protocol.con') }}{{ " - " }}</label></div>
                </div>
                <div class="col-4">
                  <div class="">
                    <InputText id="aye" v-model="agendaVotingResults.vote_con" class="w-7" :disabled="isInApprove"/>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="grid">
                <div class="col-6">
                  <div class=""><label for="aye" class="w-5">{{ $t('workPlan.protocol.decisionAccepted') }}{{
                      " - "
                    }}</label></div>
                </div>
                <div class="col-4">
                  <div class="">
                    <InputText id="aye" v-model="agendaVotingResults.vote_total_decisions" class="w-7"
                               :disabled="isInApprove"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-fluid mt-3">
          <label for="reporter" class="block mb-1">{{ $t('workPlan.protocol.reported') }}{{ "*" }}</label>
          <FindUser class="mt-2" v-model="boardAgendaReporter" :editMode="true" :user-type="3"
                    :disabled="isInApprove"/>
        </div>
        <div class="p-fluid mt-3">
          <label for="innerRules" class="block mb-1">{{ $t('workPlan.protocol.innerRule') }}{{ "*" }}</label>
          <Textarea id="innerRule" v-model="agendaData.inner_rule" class="mt-2" rows="3" :disabled="isInApprove"/>
        </div>
        <div class="p-fluid mt-3">
          <label for="boardDecision" class="block mb-1">{{ $t('workPlan.protocol.boardDecision') }}{{ "*" }}</label>
          <TinyEditor v-model="agendaData.board_decisions[0].board_decision" :height="300" :disabled="isInApprove"/>
        </div>
        <div class="p-fluid mt-3">
          <label for="responsivePerson" class="block mb-1">{{ $t('workPlan.protocol.responsivePerson') }}{{
              "*"
            }}</label>
          <FindUser class="mt-2" v-model="boardAgendaResponsivePerson" :editMode="true" :max="1" :user-type="3"
                    :disabled="isInApprove"/>
        </div>
        <div class="p-fluid mt-3">
          <label for="deadline" class="block mb-1">{{ $t('workPlan.protocol.deadline') }}{{ "*" }}</label>
          <PrimeCalendar v-model="agendaData.board_decisions[0].deadline" showIcon :showOnFocus="false"
                         inputId="buttondisplay" :disabled="isInApprove"/>
        </div>
      </div>
    </Sidebar>

    <Sidebar v-model:visible="visibility.documentInfoSidebar" position="right" class="p-sidebar-lg">
      <DocSignaturesInfo :docIdParam="protocolDocInfo?.uuid"></DocSignaturesInfo>
    </Sidebar>
    <Dialog :header="$t('workPlan.protocol.agendas')" v-model:visible="addDecisionModalVisible"
            :style="{ width: '600px' }" :close-on-escape="true" @hide="handleHide">
      <div class="p-fluid mt-3">
        <label for="boardDecision" class="block mb-1">{{ $t('workPlan.protocol.boardDecision') }}{{ "*" }}</label>
        <TinyEditor v-model="addDecision.board_decision" :height="300" :disabled="isInApprove"/>
      </div>
      <div class="p-fluid mt-3">
        <label for="responsivePerson" class="block mb-1">{{ $t('workPlan.protocol.responsivePerson') }}{{ "*" }}</label>
        <FindUser class="mt-2" v-model="addBoardAgendaResponsiveMember" :editMode="true" :user-type="3"
                  :disabled="isInApprove"/>
      </div>
      <div class="p-fluid mt-3">
        <label for="deadline" class="block mb-1">{{ $t('workPlan.protocol.deadline') }}{{ "*" }}</label>
        <PrimeCalendar v-model="addDecision.deadline" showIcon :showOnFocus="false" inputId="buttondisplay"
                       :disabled="isInApprove"/>
      </div>
      <template #footer>
        <div>
          <Button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-rounded p-button-danger"
                  @click="emitHide" :disabled="isInApprove"/>
          <Button :label="$t('common.add')" icon="pi pi-check" class="ml-2 p-button-rounded p-button-success mr-2"
                  @click="addBoardDecision" :disabled="isInApprove"/>
        </div>
      </template>
    </Dialog>
    <Dialog :header="$t('workPlan.protocol.viewDecision')" v-model:visible="agendasDecisionModalVisible"
            :style="{ width: '600px' }" :close-on-escape="true" @hide="handleHide">
      <p v-if="agendaData?.board_decisions.slice(1)[0]?.responsive_person && Object.keys(agendaData?.board_decisions.slice(1)[0]?.responsive_person).length > 0"
         class="m-0">
        <DataTable :lazy="true" :value="agendaData?.board_decisions.slice(1)" :dataKey="'responsive_person.user_id'"
                   :loading="loading" responsiveLayout="scroll">
          <Column :header="$t('workPlan.protocol.responsivePerson')">
            <template #body="{ data }">
              <ul>
                <li v-for="item in data?.responsive_person" :key="item.user_id">
                  {{ item.full_name }}
                </li>
              </ul>
            </template>
          </Column>
          <Column field="reason" :header="$t('workPlan.protocol.boardDecision')">
            <template #body="{ data }">
              <div v-html="data.board_decision"></div>
            </template>
          </Column>
          <Column field="delete">
            <template #body="{ data }">
              <Button icon="pi pi-trash" @click="deleteBoardDecision(data?.responsive_person?.user_id)"
                      :disabled="isInApprove"></Button>
            </template>
          </Column>
        </DataTable>
      </p>
      <p v-else>
        {{ $t('common.noData') }}
      </p>
  
    </Dialog>
    <Dialog :header="t('common.action.sendToApprove')" v-model:visible="showSendToApproveModal"
            :style="{ width: '50vw' }">
      <ProgressBar v-if="approving" mode="indeterminate" style="height: .5em"/>
      <div v-if="protocolDocInfo?.docType === Enum.DocType.WorkPlanProtocolExtract">
        <div class="p-fluid" v-if="approval_user_secretary">
          <ApprovalUsers :approving="loading" v-model="approval_user_secretary"
                         @closed="close('showSendToApproveModal')" @approve="SendProtocolToApprove()"
                         :stages="approval_user_secretary" mode="standard">
          </ApprovalUsers>
        </div>
      </div>
      <div v-if="protocolDocInfo?.docType === Enum.DocType.WorkPlanProtocol">
        <div class="p-fluid" v-if="approval_users">
          <ApprovalUsers :approving="loading" v-model="approval_users" @closed="close('showSendToApproveModal')"
                         @approve="SendProtocolToApprove()" :stages="approval_users" mode="standard">
          </ApprovalUsers>
        </div>
      </div>

    </Dialog>
  </div>
</template>

<script setup>
import ToolbarMenu from "@/components/ToolbarMenu.vue";
import {AlignAction} from "quill-blot-formatter";
import {useRoute, useRouter} from "vue-router";
import {ref, computed, onMounted, watch} from 'vue';
import {useI18n} from "vue-i18n";
import {useStore} from 'vuex';
import {useToast} from 'primevue/usetoast';
import {WorkPlanService} from "@/service/work.plan.service";
import {DocService} from "@/service/doc.service";
import moment from "moment";
import ApprovalUsers from "@/components/ncasigner/ApprovalUsers/ApprovalUsers";
import DocSignaturesInfo from "@/components/DocSignaturesInfo.vue";
import api from '@/service/api';
import {ContragentService} from "@/service/contragent.service";
import docState from "@/enum/docstates/index";
import {getHeader} from "@/config/config";
import Enum from "@/enum/docstates/index";
import {useConfirm} from 'primevue/useconfirm';

const workPlanService = new WorkPlanService();
const docService = new DocService();
const contragentService = new ContragentService();

const route = useRoute();
const router = useRouter();
const {t, locale} = useI18n();
const confirm = useConfirm();
const docType = ref(null)
// const participatedMembers = ref([]);
const addNonParticipateMemberModal = ref(false);
const agendasModalVisible = ref(false);
const agendasDecisionModalVisible = ref(false);
const addDecisionModalVisible = ref(false);
const isCollapsed = ref(false);
const isCollapsedAbsent = ref(false);
const source = ref('');
const sourceb64 = ref(null);
const pdfDocument = ref('');
const store = useStore();
const toast = useToast();
const protocolDocInfo = ref(null);
const protocolNumber = ref(null);
const protocolCreatedDate = ref(null);
const unformatedCreatedDate = ref(null);
const events = ref(null);
const member = ref([]);
const reason = ref('');
const currentProtocolUUID = ref(null)
const participatedBoardMembers = ref([])
const absentBoardMembers = ref([])
const invitedBoardMembers = ref([])
const boardAgendaSpeaker = ref([])
const boardAgendaReporter = ref([])
const boardAgendaResponsivePerson = ref([])
const addBoardAgendaResponsiveMember = ref([])

const workPlanID = route.params.workPlanId;
const protocolId = route.params.protocolId;
const selectedEvent = ref(null)

const showSendToApproveModal = ref(false)
const approving = ref(false)
const loading = ref(false)
const saveLoading = ref(false)
const isInApprove = ref(false)
const isApproved = ref(false)
const isRejected = ref(false)
const extractEditDisabled = ref(true)
const revisionSetterFullName = ref(null)
const responsivePerson = ref([])
const boardDecisionSpeaker = ref([])

const validation = ref({
  meeting_date: false,
  meeting_venue: false,
  participated_members: false,
  invited_persons: false
})


const votingResults = ref({
  vote_aye: null,
  vote_con: null,
  vote_abstained: null,
  vote_total_decisions: null,
});

const agendaVotingResults = ref({
  vote_aye: null,
  vote_con: null,
  vote_abstained: null,
  vote_total_decisions: null,
});

const selectedAgenda = ref({
  agenda: null,
  speaker: [],
  voting_result: parsedAgendaVotingResults,
  reporter: [],
  inner_rule: null,
  board_decisions: [
    {
      board_decision: null,
      responsive_person: [],
      deadline: null

    }
  ]
})
const docLang = computed(() => {
  switch (locale.value) {
    case 'kz':
      return 1;
    case 'ru':
      return 2;
    default:
      return 1; 
  }
});
const parsedAgendaVotingResults = computed(() => ({
  vote_aye: parseInt(agendaVotingResults.value.vote_aye, 10) || null,
  vote_con: parseInt(agendaVotingResults.value.vote_con, 10) || null,
  vote_abstained: parseInt(agendaVotingResults.value.vote_abstained, 10) || null,
  vote_total_decisions: parseInt(agendaVotingResults.value.vote_total_decisions, 10) || null,
}));

const parsedVotingResults = computed(() => ({
  vote_aye: parseInt(votingResults.value.vote_aye, 10) || null,
  vote_con: parseInt(votingResults.value.vote_con, 10) || null,
  vote_abstained: parseInt(votingResults.value.vote_abstained, 10) || null,
  vote_total_decisions: parseInt(votingResults.value.vote_total_decisions, 10) || null,
}));

const data = ref([{
  protocol_id: protocolNumber,
  protocol_number: protocolDocInfo?.value?.params[0]?.name,
  created_date: unformatedCreatedDate,
  extract_created_date: protocolCreatedDate.value || null,
  meeting_date: null,
  meeting_place: '',
  participated_board_members: [],
  absent_members: [],
  quorum_info: '',
  invited_persons: [],
  protocol_issues: [],
  voting_results: parsedVotingResults.value,
  session_closed_time: null,
  lang: docLang.value
}]);

// watch(locale, (newLocale) => {
//   data.value[0].lang = (newLocale === "ru") ? 1 : 2;
// });

const addDecision = ref({
  board_decision: null,
  responsive_person: [],
  deadline: null
});

const handlePtagClick = (eventID) => {
  if (!isInApprove.value && !isApproved.value) {
    agendasModalView(eventID);
  }
}

const isProtocolDoc = computed(() => docType.value === Enum.DocType.WorkPlanProtocol);
const isProtocolExtractDoc = computed(() => docType.value === Enum.DocType.WorkPlanProtocolExtract);

const getSelectedAgendaData = () => {
  if (isProtocolExtractDoc.value) {
    const foundEvent = data.value[0].protocol_issues.find(issue => issue.event_id === parseInt(data?.value[0]?.protocol_number));
    if (foundEvent && foundEvent.protocol_agenda) {
      selectedAgenda.value = foundEvent.protocol_agenda;
    }

  }
}

const createProtocolExtractConfirm = (eventID) => {
  confirm.require({
    target: event.currentTarget,
    message: t('common.confirmation'),
    header: t('common.confirm'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-rounded p-button-success',
    rejectClass: 'p-button-rounded p-button-danger',
    accept: () => {
      createProtocolExtract(eventID);
    }
  });
};

const agendaData = ref({
  agenda: null,
  speaker: [],
  voting_result: parsedAgendaVotingResults,
  reporter: [],
  inner_rule: null,
  board_decisions: [
    {
      board_decision: null,
      responsive_person: [],
      deadline: null

    }
  ]
});

const validateForm = () => {
        validation.value.meeting_date = !data.value[0].meeting_date || data.value[0].meeting_date == "";
        validation.value.meeting_venue = !data.value[0].meeting_place || data.value[0].meeting_place == "";
        validation.value.participated_members = !data.value[0].participated_board_members || data.value[0].participated_board_members == "" || data.value[0].participated_board_members.length <= 0;
        validation.value.invited_persons = !data.value[0].invited_persons || data.value[0].invited_persons == "" || data.value[0].invited_persons.length <= 0;
        

        return (
            !validation.value.meeting_date  &&
            !validation.value.meeting_venue  &&
            !validation.value.participated_members  &&
            !validation.value.invited_persons 
        )
}

const updateBoardDecision = (index, value) => {
  selectedAgenda.value.board_decisions[index].board_decision = value;
};

const selectedAbsentMember = ref([
  {
    member: absentBoardMembers.value.length > 0 ? absentBoardMembers.value[0] : {
      user_id: '',
      full_name: '',
      main_position: {name_kz: '', name_ru: ''}
    },
    reason: null,
  }
])

watch(votingResults, (newValue) => {
  data.value[0].voting_results = {
    vote_aye: parseInt(newValue.vote_aye, 10) || null,
    vote_con: parseInt(newValue.vote_con, 10) || null,
    vote_abstained: parseInt(newValue.vote_abstained, 10) || null,
    vote_total_decisions: parseInt(newValue.vote_total_decisions, 10) || null,
  };
}, {deep: true});

watch(agendaVotingResults, (newValue) => {
  agendaData.value.voting_result = {
    vote_aye: parseInt(newValue.vote_aye, 10) || null,
    vote_con: parseInt(newValue.vote_con, 10) || null,
    vote_abstained: parseInt(newValue.vote_abstained, 10) || null,
    vote_total_decisions: parseInt(newValue.vote_total_decisions, 10) || null,
  };
}, {deep: true});

watch(absentBoardMembers, (newVal) => {
  if (newVal.length > 0) {
    selectedAbsentMember.value = [
      {
        member: {
          user_id: newVal[0].userID,
          full_name: newVal[0].fullName,
          main_position: {
            name_kz: newVal[0]?.mainPosition?.namekz || '',
            name_ru: newVal[0]?.mainPosition?.nameru || '',
          }
        },
        reason: null,
      }
    ];
  }
});

const visibility = ref({
  sendToApproveDialog: false,
  documentInfoSidebar: false,
});

const close = () => {
  showSendToApproveModal.value = false;
};

const updateProtocolAgenda = () => {
  if (selectedEvent.value) {
    selectedEvent.value.protocol_agenda = agendaData.value;
    const eventToUpdate = data.value[0].protocol_issues.find(issue => issue.event_id === selectedEvent.value.event_id);
    if (eventToUpdate) {
      eventToUpdate.protocol_agenda = agendaData.value;

      toast.add({
        severity: 'success',
        summary: t('smartenu.saveSuccess'),
        detail: t('workPlan.protocol.agendas'),
        life: 3000,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: t('workPlan.protocol.messages.eventNotSelected'),
        life: 3000,
      });
    }
  } else {
    toast.add({
      severity: 'warn',
      summary: t('workPlan.protocol.messages.eventNotSelected'),
      life: 3000,
    });
  }
};

const agendasModalView = (eventId) => {
  boardAgendaReporter.value = []
  boardAgendaSpeaker.value = []
  boardAgendaResponsivePerson.value = []
  selectedEvent.value = null;
  agendaVotingResults.value = {
    vote_aye: null,
    vote_con: null,
    vote_abstained: null,
    vote_total_decisions: null,
  }

  agendaData.value = {
    agenda: '',
    speaker: [],
    voting_result: {
      vote_aye: null,
      vote_con: null,
      vote_abstained: null,
      vote_total_decisions: null,
    },
    reporter: [],
    inner_rule: null,
    board_decisions: [
      {
        board_decision: null,
        responsive_person: [],
        deadline: null

      }
    ]

  };

  const foundEvent = data.value[0].protocol_issues.find(issue => issue.event_id === eventId);
  if (foundEvent) {
    selectedEvent.value = foundEvent;
    agendaData.value.agenda = foundEvent.protocol_agenda?.agenda || '';
    agendaData.value.speaker = foundEvent.protocol_agenda?.speaker || [];
    if (agendaData.value.speaker && agendaData.value.speaker.length > 0) {
      boardAgendaSpeaker.value = []
      agendaData?.value?.speaker.forEach(member => {
        contragentService.getPersons({
          "filter": {
            "userIDs": [member.user_id],
          }
        }).then(res => {
          if (res.data.foundUsers && res.data.foundUsers.length > 0) {
            const foundUser = res.data.foundUsers[0];

            const exists = boardAgendaSpeaker.value.some(existingMember =>
                existingMember?.userID === member.user_id
            );

            if (!exists) {
              boardAgendaSpeaker.value.push(foundUser);
            }
          }
        }).catch(err => {
          console.error("Error fetching user data:", err);
        });
      });

    }
    agendaData.value.voting_result = foundEvent.protocol_agenda?.voting_result || {
      vote_aye: null,
      vote_con: null,
      vote_abstained: null,
      vote_total_decisions: null,
    };

    if (foundEvent.protocol_agenda?.voting_result) {
      agendaVotingResults.value = {
        vote_aye: foundEvent.protocol_agenda?.voting_result.vote_aye || null,
        vote_con: foundEvent.protocol_agenda?.voting_result.vote_con || null,
        vote_abstained: foundEvent.protocol_agenda?.voting_result.vote_abstained || null,
        vote_total_decisions: foundEvent.protocol_agenda?.voting_result.vote_total_decisions || null,
      }

    }
    agendaData.value.reporter = foundEvent.protocol_agenda?.reporter || [];
    agendaData.value.inner_rule = foundEvent.protocol_agenda?.inner_rule || null;
    if (agendaData.value.reporter && agendaData.value.reporter.length > 0) {
      boardAgendaReporter.value = []
      agendaData?.value?.reporter.forEach(member => {
        contragentService.getPersons({
          "filter": {
            "userIDs": [member.user_id],
          }
        }).then(res => {
          if (res.data.foundUsers && res.data.foundUsers.length > 0) {
            const foundUser = res.data.foundUsers[0];

            const exists = boardAgendaReporter.value.some(existingMember =>
                existingMember.userID === member.user_id
            );

            if (!exists) {
              boardAgendaReporter.value.push(foundUser);
            }
          }
        }).catch(err => {
          console.error("Error fetching user data:", err);
        });
      });

    }
    agendaData.value.board_decisions = foundEvent.protocol_agenda?.board_decisions || [{
      board_decision: null,
      responsive_person: [],
      deadline: null
    }];

    if (agendaData.value.board_decisions[0].responsive_person && agendaData.value.board_decisions[0].responsive_person.length > 0) {

      agendaData?.value?.board_decisions[0]?.responsive_person.forEach(member => {
        contragentService.getPersons({
          "filter": {
            "userIDs": [member.user_id],
          }
        }).then(res => {
          if (res.data.foundUsers && res.data.foundUsers.length > 0) {
            const foundUser = res.data.foundUsers[0];

            const exists = boardAgendaResponsivePerson.value.some(existingMember =>
                existingMember.userID === member.user_id
            );

            if (!exists) {
              boardAgendaResponsivePerson.value.push(foundUser);
            }
          }
        }).catch(err => {
          console.error("Error fetching user data:", err);
        });
      });

    }
  } else {
    selectedEvent.value = null;
  }
  agendasModalVisible.value = true;
}


onMounted(async () => {
  await loadProtocolData();
  GetUser();
  GetSpeakerUser();
  await generatePdf();
  getSelectedAgendaData();

});

//AddMembers
const addMembers = (source, target, key) => {
  const newMembers = source.value
      .filter(member =>
          !target[key].some(existingMember => existingMember.user_id === member.userID)
      )
      .map(member => ({
        user_id: member.userID,
        full_name: member.fullName,
        main_position: {
          name_kz: member.mainPosition?.namekz || '',
          name_ru: member.mainPosition?.nameru || '',
        },
      }));

  target[key].push(...newMembers);
};

//RemoveMembers
const removeMembers = (source, target, key) => {
  target[key] = target[key].filter(existingMember =>
      source.value.some(member => member.userID === existingMember.user_id)
  );
};

const addBoardAgendaRespMember = () => addMembers(addBoardAgendaResponsiveMember, addDecision.value, 'responsive_person');
const removeBoardAgendaRespMember = () => removeMembers(addBoardAgendaResponsiveMember, addDecision.value, 'responsive_person');

const addBoardAgendaResponsivePerson = () => addMembers(boardAgendaResponsivePerson, agendaData.value.board_decisions[0], 'responsive_person');
const removeBoardAgendaResponsivePerson = () => removeMembers(boardAgendaResponsivePerson, agendaData.value.board_decisions[0], 'responsive_person');

const addBoardAgendaReporter = () => addMembers(boardAgendaReporter, agendaData.value, 'reporter');
const removeBoardAgendaReporter = () => removeMembers(boardAgendaReporter, agendaData.value, 'reporter');

const addBoardAgendaSpeaker = () => addMembers(boardAgendaSpeaker, agendaData.value, 'speaker');
const removeBoardAgendaSpeaker = () => removeMembers(boardAgendaSpeaker, agendaData.value, 'speaker');

const addParticipatedMembers = () => addMembers(participatedBoardMembers, data.value[0], 'participated_board_members');
const removeParticipatedMembers = () => removeMembers(participatedBoardMembers, data.value[0], 'participated_board_members');

const addInvitedMembers = () => addMembers(invitedBoardMembers, data.value[0], 'invited_persons');
const removeInvitedMembers = () => removeMembers(invitedBoardMembers, data.value[0], 'invited_persons');

const addProtocolIssues = () => {
  if (events.value && events.value.length > 0) {
    events.value.forEach(event => {
      const newEvent = {
        event_id: event.event_id,
        event_name: event.event_name,
        protocol_agenda: null
      };
      const exists = data.value[0].protocol_issues.some(
          issue => issue.event_id === event.event_id
      );

      if (!exists) {
        data.value[0].protocol_issues.push(newEvent);
      }
    });
  }
};

const watchItems = [
  {target: addBoardAgendaResponsiveMember, add: addBoardAgendaRespMember, remove: removeBoardAgendaRespMember},
  {target: boardAgendaResponsivePerson, add: addBoardAgendaResponsivePerson, remove: removeBoardAgendaResponsivePerson},
  {target: boardAgendaReporter, add: addBoardAgendaReporter, remove: removeBoardAgendaReporter},
  {target: boardAgendaSpeaker, add: addBoardAgendaSpeaker, remove: removeBoardAgendaSpeaker},
  {target: participatedBoardMembers, add: addParticipatedMembers, remove: removeParticipatedMembers},
  {target: invitedBoardMembers, add: addInvitedMembers, remove: removeInvitedMembers},
];

watchItems.forEach(({target, add, remove}) => {
  watch(target, () => {
    add();
    remove();
  }, {deep: true});
});

watch(events, (newEvents) => {
  if (newEvents && newEvents.length > 0) {
    addProtocolIssues();
  }
});

watch(
    () => selectedAgenda.value.board_decisions[0]?.responsive_person,
    async (newResponsivePerson) => {
      if (newResponsivePerson && newResponsivePerson.length > 0) {
        GetUser();
      }
    },
    {immediate: true, deep: true}
);

watch(
    () => selectedAgenda.value.speaker,
    async (newResponsivePerson) => {
      if (newResponsivePerson && newResponsivePerson.length > 0) {
        GetSpeakerUser();
      }
    },
    {immediate: true, deep: true}
);

const DowloadProtocolFile = () => {
  const protocolFileBlob = b64toBlobPdf(pdfDocument.value, "application/pdf");
  const link = document.createElement("a");
  const url = URL.createObjectURL(protocolFileBlob);

  link.href = url;
  link.download = "protocol.pdf";
  link.click();

  URL.revokeObjectURL(url);
}

const SendProtocolToApprove = async () => {
  const data = new FormData();
  data.append("doc_uuid", protocolDocInfo.value.uuid);
  data.append("data_type", JSON.stringify(protocolDocInfo?.value?.docType))
  if (protocolDocInfo?.value?.docType === Enum.DocType.WorkPlanProtocol) {
    data.append("approval_users", JSON.stringify(approval_users.value));

  }
  if (protocolDocInfo?.value?.docType === Enum.DocType.WorkPlanProtocolExtract) {
    data.append("approval_user_secretary", JSON.stringify(approval_user_secretary.value));
  }
  //data.append("approval_users", JSON.stringify(approval_users.value));
  try {
    const protocolFileBlob = b64toBlobPdf(pdfDocument.value, "application/pdf");
    if (protocolFileBlob instanceof Blob) {
      data.append("protocol_file", protocolFileBlob, "protocol.pdf");
    } else {
      throw new Error("Failed to create Blob from base64 data.");
    }
  } catch (error) {
    console.error("Error creating Blob:", error);
    return;
  }

  loading.value = true;
  approving.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    close();
    const response = await workPlanService.sendProtocolToApprove(data);
    loading.value = true
    if (response.data.is_success) {
      loading.value = false
      approving.value = false
      showSendToApproveModal.value = false;
      location.reload()
    } else {
      loading.value = false;
      console.error("Failed to send protocol for approval:", response.data);
    }


  } catch (error) {
    console.error("Error sending file:", error);
    loading.value = false;
    if (error.response && error.response.status == 401) {
      store.dispatch("logLout")
    } else if (error.response && error.response.data && error.response.data.localized) {
      showMessage('error', t(err.response.data.localizedPath), null)
    }
  }
}

const generatePdf = async () => {
  const workPlanIdNumber = parseInt(workPlanID, 10);
  if (isProtocolExtractDoc.value && selectedAgenda.value) {
    if (responsivePerson.value !== null && responsivePerson.value.length > 0) {
      const user = responsivePerson.value
      let userData = {
        user_id: user[0]?.userID,
        full_name: user[0]?.fullName,
        main_position: {
          name_kz: user[0]?.mainPosition?.namekz || '',
          name_ru: user[0]?.mainPosition?.nameru || '',
        }
      }
      if (userData !== null) {
        const foundEvent = data.value[0].protocol_issues.find(issue => issue.event_id === parseInt(data?.value[0]?.protocol_number));
        foundEvent.protocol_agenda.board_decisions[0].responsive_person[0] = userData
        data.value[0].protocol_issues[0] = foundEvent

      }
    }
    if (boardDecisionSpeaker.value !== null && boardDecisionSpeaker.value.length > 0) {
      const user = boardDecisionSpeaker.value
      let userData = {
        user_id: user[0]?.userID,
        full_name: user[0]?.fullName,
        main_position: {
          name_kz: user[0]?.mainPosition?.namekz || '',
          name_ru: user[0]?.mainPosition?.nameru || '',
        }
      }
      if (userData !== null) {
        const foundEvent = data.value[0].protocol_issues.find(issue => issue.event_id === parseInt(data?.value[0]?.protocol_number));
        foundEvent.protocol_agenda.speaker[0] = userData
        data.value[0].protocol_issues[0] = foundEvent

      }
    }
  }

  data.value[0].lang = docLang.value

  const protocolData = data.value[0];
  saveLoading.value = true;

  let requestData = {
    work_plan_id: workPlanIdNumber,
    protocol_id: String(protocolId),
    protocol_data: protocolData,
  }

  try {
    const res = await workPlanService.getWorkPlanData(requestData);
    if (res.data) {
      docType.value = res.data.protocol_doc?.docType
      source.value = `data:application/pdf;base64,${res.data.generate_byte}`;
      sourceb64.value = b64toBlob(res.data.generate_byte);
      pdfDocument.value = res.data.generate_byte;
      protocolDocInfo.value = res.data.protocol_doc;
      protocolNumber.value = res.data.protocol_doc?.id;
      protocolCreatedDate.value = formatDateMoment(res.data.protocol_doc?.createDate);
      unformatedCreatedDate.value = res.data.protocol_doc?.createDate;
      events.value = res.data.protocol_doc?.params[0]?.value;
      currentProtocolUUID.value = res.data.protocol_doc?.uuid;

      //data.value[0] = res.data.protocol_doc?.params[0]?.value 
      data.value[0].protocol_number = protocolDocInfo?.value?.params[0]?.name;
      data.value[0].meeting_place = res.data.protocol_doc?.params[0]?.value?.meeting_place || '';
      data.value[0].meeting_date = res.data.protocol_doc?.params[0]?.value?.meeting_date || null;
      data.value[0].extract_created_date = res.data.protocol_doc?.createDate || null;
      data.value[0].participated_board_members = res.data.protocol_doc?.params[0]?.value?.participated_board_members;
      data.value[0].absent_members = res.data.protocol_doc?.params[0]?.value?.absent_members || [];
      data.value[0].quorum_info = res.data.protocol_doc?.params[0]?.value?.quorum_info;
      data.value[0].protocol_issues = res?.data?.protocol_doc?.params[0]?.value?.protocol_issues || [];
      data.value[0].session_closed_time = res?.data?.protocol_doc?.params[0]?.value?.session_closed_time || null;

      data.value[0].voting_results.vote_aye = parseInt(res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_aye) || votingResults.value.vote_aye;
      if (res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_aye) {
        votingResults.value.vote_aye = res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_aye
      }
      data.value[0].voting_results.vote_con = parseInt(res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_con) || votingResults.value.vote_con
      if (res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_con) {
        votingResults.value.vote_con = res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_con
      }
      data.value[0].voting_results.vote_abstained = parseInt(res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_abstained) || votingResults.value.vote_abstained
      if (res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_abstained) {
        votingResults.value.vote_abstained = res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_abstained
      }
      data.value[0].voting_results.vote_total_decisions = parseInt(res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_total_decisions) || votingResults.value.vote_total_decisions
      if (res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_total_decisions) {
        votingResults.value.vote_total_decisions = res?.data?.protocol_doc?.params[0]?.value?.voting_results.vote_total_decisions
      }
      let lang = (locale === "ru") ? 1 : 0;
      data.value[0].lang = lang;

      if (protocolDocInfo?.value?.docHistory?.stateEn === docState.REVISION.Value) {
        isRejected.value = true;
        if (protocolDocInfo?.value?.docHistory?.setterId !== null) {
          contragentService.getPersons({
            "filter": {
              "userIDs": [protocolDocInfo?.value?.docHistory?.setterId],
            }
          }).then(res => {
            if (res.data.foundUsers && res.data.foundUsers.length > 0) {
              const foundUser = res.data.foundUsers[0];
              revisionSetterFullName.value = foundUser.fullName

            }
          }).catch(err => {
            console.error("Error fetching user data:", err);
          });
        }


      }
      if (protocolDocInfo?.value?.docHistory?.stateEn === docState.INAPPROVAL.Value) {
        isInApprove.value = true;
      }
      if (protocolDocInfo?.value?.docHistory?.stateEn === docState.APPROVED.Value) {
        isApproved.value = true;
      }

      if (res.data.protocol_doc?.params[0]?.value?.participated_board_members) {
        participatedBoardMembers.value = []
        res.data.protocol_doc?.params[0]?.value?.participated_board_members.forEach(member => {
          contragentService.getPersons({
            "filter": {
              "userIDs": [member.user_id],
            }
          }).then(res => {
            if (res.data.foundUsers && res.data.foundUsers.length > 0) {
              const foundUser = res.data.foundUsers[0];

              const exists = participatedBoardMembers.value.some(existingMember =>
                  existingMember.userID === member.user_id
              );

              if (!exists) {
                participatedBoardMembers.value.push(foundUser);
              }
            }
          }).catch(err => {
            console.error("Error fetching user data:", err);
          });
        })
      }

      if (res.data.protocol_doc?.params[0]?.value?.invited_persons) {
        invitedBoardMembers.value = []
        res.data.protocol_doc?.params[0]?.value?.invited_persons.forEach(member => {
          contragentService.getPersons({
            "filter": {
              "userIDs": [member.user_id],
            }
          }).then(res => {
            if (res.data.foundUsers && res.data.foundUsers.length > 0) {
              const foundUser = res.data.foundUsers[0];

              const exists = invitedBoardMembers.value.some(existingMember =>
                  existingMember.userID === member.user_id
              );

              if (!exists) {
                invitedBoardMembers.value.push(foundUser);
              }
            }
          }).catch(err => {
            console.error("Error fetching user data:", err);
          });
        })
      }
      if (res?.data?.protocol_doc?.params[0]?.value?.protocol_issues) {
        events.value = []
        res?.data?.protocol_doc?.params[0]?.value?.protocol_issues.forEach(event => {
          const newEvent = {
            event_id: event.event_id,
            event_name: event.event_name,
            protocol_agenda: null
          };

          const eventExists = events.value.some(e => e.event_id === newEvent.event_id);

          if (!eventExists) {
            events.value.push(newEvent);
          }

        });
      } else {
        console.log("undefined or empty");
      }
      saveLoading.value = false;

    }
  } catch (error) {
    saveLoading.value = false;
    if (error.response && error.response.status === 401) {
      store.dispatch("logLout");
    } else {
      toast.add({
        severity: "error",
        summary: error.message || error,
        life: 3000,
      });
    }
  }

}

const GetSpeakerUser = () => {
  const selectedSpeakerUserId = parseInt(selectedAgenda?.value?.speaker[0]?.user_id);
  if (selectedSpeakerUserId) {
    contragentService.getPersons({
      filter: {userIDs: [selectedSpeakerUserId]},
    })
        .then((res) => {
          if (res.data.foundUsers?.length > 0) {
            boardDecisionSpeaker.value = [res.data.foundUsers[0]];
          }
        })
        .catch(err => console.error("Error fetching user data:", err));
  }
};

const GetUser = () => {
  const selectedUserId = parseInt(selectedAgenda?.value?.board_decisions[0]?.responsive_person[0]?.user_id);
  if (selectedUserId) {
    contragentService.getPersons({
      filter: {userIDs: [selectedUserId]},
    })
        .then((res) => {
          if (res.data.foundUsers?.length > 0) {
            responsivePerson.value = [res.data.foundUsers[0]];
          }
        })
        .catch(err => console.error("Error fetching user data:", err));
  }
};

const b64toBlob = (b64Data, sliceSize = 512) => {
  const byteCharacters = window.atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: "application/pdf"});
  return URL.createObjectURL(blob);
};

const b64toBlobPdf = (b64Data, contentType = "application/pdf", sliceSize = 512) => {
  try {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
  } catch (error) {
    console.error("Invalid base64 data:", error);
    return null;
  }
};

const loadProtocolData = () => {
  try {
    if (protocolDocInfo.value) {
      data.value[0] = protocolDocInfo?.value?.params[0]?.value
    }
  } catch (error) {
    console.error("Error processing protocol data", error);
  }
};

const addBoardDecision = () => {
  if (addBoardAgendaResponsiveMember.value && addBoardAgendaResponsiveMember.value.length > 0) {
    const newDecision = {
      board_decision: addDecision.value.board_decision,
      responsive_person: [
        {
          user_id: addBoardAgendaResponsiveMember.value[0].userID,
          full_name: addBoardAgendaResponsiveMember.value[0].fullName,
          main_position: {
            name_kz: addBoardAgendaResponsiveMember.value[0].mainPosition?.namekz || '',
            name_ru: addBoardAgendaResponsiveMember.value[0].mainPosition?.nameru || '',
          }
        },
      ],
      deadline: addDecision.value.deadline,
    };


    addBoardAgendaResponsiveMember.value.slice(1).forEach(member => {
      newDecision.responsive_person.push({
        user_id: member.userID,
        full_name: member.fullName,
        main_position: {
          name_kz: member.mainPosition?.namekz || '',
          name_ru: member.mainPosition?.nameru || '',
        }
      });
    });

    const userExists = agendaData.value.board_decisions.some(decision =>
        decision.responsive_person.some(person =>
            newDecision.responsive_person.some(newPerson =>
                person.user_id === newPerson.user_id
            )
        )
    );

    if (!userExists) {
      agendaData.value.board_decisions.push(newDecision);
      addDecision.value = {
        board_decision: null,
        responsive_person: [],
        deadline: null
      };
      toast.add({
        severity: 'success',
        summary: t('workPlan.protocol.messages.decisionAddedSuccess'),
        life: 3000,
      });
      addDecisionModalVisible.value = false;
    } else {
      toast.add({
        severity: 'warn',
        summary: t('workPlan.protocol.messages.personAlreadyExists'),
        life: 3000,
      });
    }
  }

}

const addAbsentMembers = () => {
  if (absentBoardMembers?.value[0]?.userID && selectedAbsentMember?.value[0]?.reason) {
    const memberExists = data?.value[0]?.absent_members?.some(absentMember =>
        absentMember.member?.user_id === absentBoardMembers.value[0].userID
    );

    if (!memberExists) {
      const newMember = {
        member: {
          user_id: absentBoardMembers?.value[0].userID,
          full_name: absentBoardMembers?.value[0].fullName,
          main_position: {
            name_kz: absentBoardMembers?.value[0]?.mainPosition?.namekz || '',
            name_ru: absentBoardMembers?.value[0]?.mainPosition?.nameru || ''
          }
        },
        reason: selectedAbsentMember?.value[0]?.reason,
      };

      data?.value[0]?.absent_members?.push(newMember);

      selectedAbsentMember.value[0].member = {
        user_id: '',
        full_name: '',
        main_position: {name_kz: '', name_ru: ''}
      };
      selectedAbsentMember.value[0].reason = '';
      absentBoardMembers.value = []
    } else {
      toast.add({
        severity: 'warn',
        summary: t('workPlan.protocol.addAbsentMembers'),
        detail: t('workPlan.protocol.alreadyInsertedUser'),
        life: 3000
      });
    }
  } else {
    toast.add({
      severity: 'warn',
      summary: t('workPlan.protocol.addAbsentMembers'),
      detail: t('common.message.fillError'),
      life: 3000
    });
  }
}

const deleteBoardDecision = (userID) => {
  const decisionIndex = agendaData.value.board_decisions.findIndex((decision, index) =>
      index !== 0 && decision.responsive_person?.user_id === userID
  );

  if (decisionIndex !== -1) {
    agendaData.value.board_decisions.splice(decisionIndex, 1);
    toast.add({
      severity: 'success',
      summary: t('workPlan.protocol.messages.decisionRemovedSuccess'),
      life: 3000,
    });
  } else {
    toast.add({
      severity: 'warn',
      summary: t('workPlan.protocol.messages.decisionNotFound'),
      life: 3000,
    });
  }
};

function deleteAbsentMember(member) {
  const index = data.value[0].absent_members.indexOf(member);
  if (index > -1) {
    data.value[0].absent_members.splice(index, 1);
  }
}

const handleHide = () => {
  member.value = '';
  reason.value = '';
};

const open = (name) => {
  visibility.value[name] = true;
};

const saveProtocolData = () => {
  generatePdf();
}

const ExtractEditable = () => {
  saveLoading.value = true;
  extractEditDisabled.value = !extractEditDisabled.value;
  setTimeout(() => {
    saveLoading.value = false;
  }, 300);
}

const emitHide = () => {
  addDecisionModalVisible.value = false;
};

const addAbsentMember = () => {
  addNonParticipateMemberModal.value = true
};

const showDecisions = () => {
  agendasDecisionModalVisible.value = true
}

const onToggle = (event) => {
  isCollapsed.value = event.value;
};

const showSendToApproveDialog = () => {
  if (!validateForm()) {
            return
  }
  showSendToApproveModal.value = true;
}

watch(
  () => data.value[0],
  (newData) => {
    validation.value.meeting_date = !newData.meeting_date;
    validation.value.meeting_venue = !newData.meeting_venue;
    validation.value.participated_members = 
      !newData.participated_board_members || newData.participated_board_members.length <= 0;
    validation.value.invited_persons = 
      !newData.invited_persons || newData.invited_persons.length <= 0;
  },
  { deep: true }
);

const onToggleAbsent = (event) => {
  isCollapsedAbsent.value = event.value;
};

const addDecisionModal = () => {
  addBoardAgendaResponsiveMember.value = []
  updateProtocolAgenda();
  addDecisionModalVisible.value = true;
}

function formatDateMoment(date) {
  if (!date || !moment(date).isValid()) {
    return 'Invalid Date';
  }
  const momentDate = moment(new Date(date)).utc();
  return momentDate.format("DD.MM.YYYY HH:mm:ss");
}

const createProtocolExtract = (eventID) => {
  const totalEventIdSumString = String(eventID);
  let extractedData = {
    work_plan_id: parseInt(workPlanID, 10),
    work_plan_name: totalEventIdSumString,
    protocol_id: parseInt(eventID, 10),
    lang: 1,
    doc_id: "protocol_extract",
    params: [
      {
        docID: protocolDocInfo?.value?.id,
        name: totalEventIdSumString,
        value: protocolDocInfo?.value?.params[0]?.value,
        description: "protocol_extract",

      }
    ]

  };

  loading.value = true;
  const formData = new FormData();

  formData.append('protocol', JSON.stringify(extractedData));
  workPlanService.createProtocol(formData).then(result => {
    if (result?.data?.is_success) {
      router.replace({path: '/temp'}).then(() => {
        router.replace({
          name: "addWorkPlanProtocol",
          params: {workPlanId: parseInt(workPlanID), protocolId: parseInt(eventID)},
        });
      });
      loading.value = false;
      loadProtocolData();
      generatePdf();
    }

  }).catch(error => {
    loading.value = false
    if (error.response && error.response.data && error.response.data.error === 'protocolalreadyexists') {
      toast.add({severity: "warn", summary: t('workPlan.protocol.alreadyCreated'), life: 3000});
    } else {
      toast.add({severity: "error", summary: error, life: 3000});
    }

  })

}

const approval_users = ref([
  {
    stage: 1,
    users: [],
    titleKz: "Кеңес хатшысы",
    titleRu: "Секретарь Правления",
    titleEn: "Secretary of the Board",
    certificate: {
      namekz: "Жеке тұлғаның сертификаты",
      nameru: "Сертификат физического лица",
      nameen: "Certificate of an individual",
      value: "individual"
    }
  },
  {
    stage: 2,
    users: [],
    titleKz: "Комиссия кеңесі",
    titleRu: "Члены Правления",
    titleEn: "Commission of the Board",
    certificate: {
      namekz: "Жеке тұлғаның сертификаты",
      nameru: "Сертификат физического лица",
      nameen: "Certificate of an individual",
      value: "individual"
    }
  },
  {
    stage: 3,
    users: [],
    titleKz: "Төраға",
    titleRu: "Председатель",
    titleEn: "Chairman",
    certificate: {
      namekz: "Жеке тұлғаның сертификаты",
      nameru: "Сертификат физического лица",
      nameen: "Certificate of an individual",
      value: "individual"
    }
  }
])

const approval_user_secretary = ref([
  {
    stage: 1,
    users: [],
    titleKz: "Кеңес хатшысы",
    titleRu: "Секретарь Правления",
    titleEn: "Secretary of the Board",
    certificate: {
      namekz: "Жеке тұлғаның сертификаты",
      nameru: "Сертификат физического лица",
      nameen: "Certificate of an individual",
      value: "individual"
    }
  }
])

const protocolMenu = computed(() => [
  {
    label: t('common.save'),
    icon: "pi pi-fw pi-save",
    disabled: isInApprove.value || isApproved.value,
    command: saveProtocolData,
  },
  {
    label: t('common.download'),
    icon: "pi pi-fw pi-download",
    disabled: isInApprove.value || !isApproved.value,
    command: DowloadProtocolFile,
  },
  {
    label: t('common.action.sendToSign'),
    icon: "fa-regular fa-paper-plane",
    disabled: isInApprove.value || isApproved.value,
    command: showSendToApproveDialog,
  },
  {
    label: t('common.approvalList'),
    icon: "fa-solid fa-user-check",
    disabled: !protocolDocInfo.value || !protocolDocInfo.value.docHistory || protocolDocInfo.value.docHistory?.stateId < Enum.INAPPROVAL.ID,
    command: () => open('documentInfoSidebar')
  },
  {
    label: t('dissertation.dissReportActions'),
    icon: "pi pi-check",
    disabled: isProtocolDoc.value,
    items: [
      {
        label: t("common.edit"),
        icon: "pi pi-pencil",
        command: ExtractEditable,
      },
    ]
  },
]);

const agendasMenu = computed(() => [
  {
    icon: "pi pi-fw pi-spinner",
    command: updateProtocolAgenda,
  },
  {
    label: t('common.save'),
    icon: "pi pi-fw pi-save",
    command: updateProtocolAgenda,
  },
  {
    label: t('workPlan.protocol.addDecision'),
    icon: "pi pi-fw pi-plus",
    command: addDecisionModal,
  },
  {
    label: t('workPlan.protocol.viewDecision'),
    icon: "pi pi-fw pi-eye",
    visible: agendaData?.value.board_decisions.slice(1).length > 0,
    command: showDecisions,
  }
]);

</script>

<style scoped>
.custom-toggler-icon {
  font-size: 1.29rem;
  cursor: pointer;

}

.status-badge {
  border-radius: 2px;
  padding: .25em .5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;

  &.status-4 {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-3 {
    background: #007bff;
    color: #ffffff;
  }

  &.status-2 {
    background: #9317b8;
    color: #ffffff;
  }

  &.status-1 {
    background: #555555;
    color: #ffffff;
  }

  a.disabled {
    color: gray;
    cursor: not-allowed;
    pointer-events: none;
    text-decoration: none;
  }

  .inactiveMode {
    position: relative;
    background: rgba(128, 128, 128, 0.5);
    pointer-events: none;
    color: #999;
    z-index: 1;
  }

  .inactiveMode .p-panel-content {
    filter: blur(4px);
  }


}
</style>
