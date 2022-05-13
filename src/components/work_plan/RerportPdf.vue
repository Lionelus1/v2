<template>
  <div>
    <div ref="toPdf" class="WordSection1 p-grid" v-if="plan && !plan.is_oper">
      <h5 style="width: 100%;text-align: center;font-size: 14.0pt;text-transform: uppercase;font-weight: bold;">
        {{ reportTitle }}</h5>
      <br/>
      <div class="p-col-12">
        <table
            style="width: 100%; font-size: 12.0pt; text-align: center;border-collapse: collapse;border: 1px solid grey">
          <tbody>
          <tr style="mso-yfti-firstrow:yes;">
            <td class="header" style="font-weight: bold;">№</td>
            <td class="header" style="font-weight: bold;">{{
                plan.lang === 1 ? 'Іс-шараның атауы' : plan.lang === 2 ? 'Наименование мероприятия' : 'Name of the event'
              }}
            </td>
            <td class="header" style="font-weight: bold;">{{
                plan.lang === 1 ? 'Жауапты орындаушы' : plan.lang === 2 ? 'Ответственный исполнитель' : 'Responsible executor'
              }}
            </td>
            <td class="header" style="font-weight: bold;">
              {{ plan.lang === 1 ? 'Квартал' : plan.lang === 2 ? 'Квартал' : 'Quarter' }}
            </td>
            <td class="header" style="font-weight: bold;">{{
                plan.lang === 1 ? 'Жоспарланған нәтиже' : plan.lang === 2 ? 'Планируемый результат' : 'Planned result'
              }}
            </td>
            <td class="header" style="font-weight: bold;">
              {{ plan.lang === 1 ? 'Ескерту' : plan.lang === 2 ? 'Примечание' : 'Note' }}
            </td>
            <td class="header" style="font-weight: bold;">
              {{ plan.lang === 1 ? 'Есеп' : plan.lang === 2 ? 'Отчет' : 'Report' }}
            </td>
            <td class="header" style="font-weight: bold;">{{
                plan.lang === 1 ? 'Орындалды/Орындалмады' : plan.lang === 2 ? 'Выполнено/Не выполнено' : 'Completed/Not completed'
              }}
            </td>
          </tr>
          <tr v-for="(item, index) in items" :key="index">
            <td class="td-va">{{ item.row_number }}</td>
            <td class="td-va" style="text-align: left;border-collapse: collapse;vertical-align: top;padding: 5px;">
              {{ item.event_name }}
            </td>
            <td class="td-va">{{ item.userList }}</td>
            <td class="td-va">{{ item.quarter }}</td>
            <td class="td-va">{{ item.result }}</td>
            <td class="td-va">{{ item.comment }}</td>
            <td style="text-align: start;vertical-align: top;"
                v-bind:style="(item.event_result && item.event_result.length > 150) ? 'font-size: 10pt' : 'font-size:12pt;'">
              {{
                item.event_result ? item.event_result.event_result : ""
              }}
            </td>
            <td class="td-va">{{ item.event_result ? $t('common.done') : $t('common.notDone') }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div ref="toPdf" class="p-grid" v-if="plan && plan.is_oper">
      <div class="WordSection1">
        <h5 style="width: 100%;text-align: center;font-size: 14.0pt;text-transform: uppercase;font-weight: 700;">
          {{ reportTitle }}</h5>
        <br/>
        <div class="p-col-12">
          <table
              style="display: table;width: 100%;font-size: 10.0pt; text-align: center;border-collapse: collapse;border: 1px solid grey;overflow: visible !important;" cellspacing=0 cellpadding=0>
            <tbody>
            <tr style="mso-yfti-firstrow:yes;">
              <td class="header" style="font-weight: bold;">№</td>
              <td class="header" style="font-weight: bold;">{{
                  plan.lang === 1 ? 'Нәтиже көрсеткіші' : plan.lang === 2 ? 'Показатель прямых результатов' : 'Indicator of direct results'
                }}
              </td>
              <td class="header" style="font-weight: bold;">
                {{ plan.lang === 1 ? 'Өлшем бірлігі' : plan.lang === 2 ? 'Ед. изм.' : 'Unit' }}
              </td>
              <td class="header" style="font-weight: bold;">
                {{ plan.lang === 1 ? 'Жоспар' : plan.lang === 2 ? 'План' : 'Plan' }}
              </td>
              <td class="header" style="font-weight: bold;">
                {{ plan.lang === 1 ? 'Факт' : plan.lang === 2 ? 'Факт' : 'Fact' }}
              </td>
              <td class="header" style="font-weight: bold;">{{
                  plan.lang === 1 ? 'Жауапты орындаушылар' : plan.lang === 2 ? 'Ответственные исполнители' : 'Responsible performers'
                }}
              </td>
              <td class="header" style="font-weight: bold;">{{
                  plan.lang === 1 ? 'Жинақтаушы/Растау' : plan.lang === 2 ? 'Свод/подтверждение' : 'Summary/Confirmation'
                }}
              </td>
              <td class="header" style="font-weight: bold;">
                {{ plan.lang === 1 ? 'Квартал' : plan.lang === 2 ? 'Квартал' : 'Quarter' }}
              </td>
              <td class="header" style="font-weight: bold;">{{
                  plan.lang === 1 ? 'Растайтын құжаттар' : plan.lang === 2 ? 'Подтверждающие документы' : 'Supporting documents'
                }}
              </td>
              <td class="header" style="font-weight: bold;">{{
                  plan.lang === 1 ? 'Орындалды/Орындалмады' : plan.lang === 2 ? 'Выполнено/Не выполнено' : 'Completed/Not completed'
                }}
              </td>
              <td class="header" style="font-weight: bold;">
                {{ plan.lang === 1 ? 'Есеп' : plan.lang === 2 ? 'Отчет' : 'Report' }}
              </td>
            </tr>
            <tr v-for="(item, index) in items" :key="index">
              <td class="td-va">{{ item.row_number }}</td>
              <td class="td-va"
                  style="text-align: left;border-collapse: collapse;vertical-align: top;border: 1px solid grey">
                {{ item.event_name }}
              </td>
              <td class="td-va">{{ item.unit }}</td>
              <td class="td-va">{{ item.plan_number }}</td>
              <td class="td-va"></td>
              <td class="td-va">{{ item.responsible_executor }}</td>
              <td class="td-va">{{ item.userList }}</td>
              <td class="td-va">{{ item.quarter }}</td>
              <td class="td-va">{{ item.supporting_docs }}</td>
              <td class="td-va">{{ item.event_result ? $t('common.done') : $t('common.notDone') }}</td>
              <td style="text-align: left;vertical-align: top;"
                  v-bind:style="(item.event_result && item.event_result.event_result.length > 200) ? 'font-size: 10pt;min-width: 250px;' : 'font-size:10pt;'">
                <div style="padding-bottom: 20px">
                {{
                  item.event_result ? item.event_result.event_result : ""
                }}
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {getHeader, smartEnuApi} from "@/config/config";

export default {
  name: "ReportPdf",
  props: ['planId', 'data', 'type', 'quarter', 'reportTitle', 'plan'],
  data() {
    return {
      work_plan_id: this.planId,
      items: this.data,
      pdfType: this.type,
      loginedUserId: 0
    }
  },
  created() {
    this.items.map(e => {
      e.userList = Object.keys(e.user).map(key => `${e.user[key].fullName}`).join(", ");
    });
    this.year = new Date().getFullYear();
    //this.data.push({index: 1, name: "Test name", resp: 'User Name', quarter: 1, result: '', comment: 'Comment'})
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    this.filename = 'flname.pdf'
  },
  methods: {},
}
</script>

<style scoped lang="scss">
table {
  width: 100%;
  font-size: 14px;
  text-align: center;
  border-collapse: collapse;
  border: .1px solid #000;

  th {
    font-weight: bold;
  }

  td,
  th {
    padding: 5px;
    border: .1px solid #000;
    border-collapse: collapse;
  }
}

.user-item {
  display: block;
  padding: 0;
  margin: 0;
}
</style>
