<template>
  <div>
    <div ref="toPdf" class="WordSection1 p-grid">
      <h5 class="p-col-6 p-offset-3 p-text-center p-text-bold">{{ reportTitle }}</h5>
      <br/>
      <div class="p-col-12">
        <table style="width: 100%; font-size: 12px; text-align: center;border-collapse: collapse;border: 1px solid grey">
          <tbody>
          <tr style="mso-yfti-firstrow:yes;">
            <td class="header">№</td>
            <td class="header" style="font-weight: bold; padding: 5px; border-collapse: collapse;">{{ plan.lang === 1 ? 'Іс-шараның атауы' : plan.lang === 2 ? 'Наименование мероприятия' : 'Name of the event' }}</td>
            <td class="header" style="font-weight: bold; padding: 5px; border-collapse: collapse;">{{ plan.lang === 1 ? 'Жауапты орындаушы' : plan.lang === 2 ? 'Ответственный исполнитель' : 'Responsible executor' }}</td>
            <td class="header" style="font-weight: bold; padding: 5px; border-collapse: collapse;">{{ plan.lang === 1 ? 'Квартал' : plan.lang === 2 ? 'Квартал' : 'Quarter' }}</td>
            <td class="header" style="font-weight: bold; padding: 5px; border-collapse: collapse;">{{ plan.lang === 1 ? 'Жоспарланған нәтиже' : plan.lang === 2 ? 'Планируемый результат' : 'Planned result' }}</td>
            <td class="header" style="font-weight: bold; padding: 5px; border-collapse: collapse;">{{ plan.lang === 1 ? 'Ескерту' : plan.lang === 2 ? 'Примечание' : 'Note' }}</td>
            <td class="header" style="font-weight: bold; padding: 5px; border-collapse: collapse;">{{ plan.lang === 1 ? 'Есеп' : plan.lang === 2 ? 'Отчет' : 'Report' }}</td>
            <td class="header" style="font-weight: bold; padding: 5px; border-collapse: collapse;">{{ plan.lang === 1 ? 'Орындалды/Орындалмады' : plan.lang === 2 ? 'Выполнено/Не выполнено' : 'Completed/Not completed' }}</td>
          </tr>
          <tr v-for="(item, index) in items" :key="index">
            <td style="text-align: center;border-collapse: collapse;vertical-align: top;">{{ item.row_number }}</td>
            <td style="text-align: justify;border-collapse: collapse;vertical-align: top;">{{ item.event_name }}</td>
            <td style="text-align: justify;border-collapse: collapse;vertical-align: top;">{{ item.userList }}</td>
            <td style="text-align: justify;border-collapse: collapse;vertical-align: top;">{{ item.quarter }}</td>
            <td style="text-align: justify;border-collapse: collapse;vertical-align: top;">{{ item.result }}</td>
            <td style="text-align: justify;border-collapse: collapse;vertical-align: top;">{{ item.comment }}</td>
            <td style="text-align: justify;border-collapse: collapse;vertical-align: top;" v-bind:style="(item.event_result && item.event_result.length > 100) ? 'font-size: 10px' : 'font-size:12px;'">
              {{
                item.event_result ? item.event_result.event_result : ""
              }}
            </td>
            <td style="padding: 5px; border-collapse: collapse;">{{ item.event_result ? $t('common.done') : $t('common.notDone') }}</td>
          </tr>
          </tbody>
        </table>
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
  methods: {

  },
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
