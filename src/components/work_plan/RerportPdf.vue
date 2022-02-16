<template>
  <div>
    <div ref="toPdf" class="p-grid">
      <h5 class="p-col-6 p-offset-3 p-text-center p-text-bold">{{ reportTitle }}</h5>
      <br/>
      <div class="p-col-12">
        <table>
          <thead>
          <tr>
            <th>№</th>
            <th>Наименование мероприятия</th>
            <th>Ответственный исполнитель</th>
            <th>Квартал</th>
            <th>Планируемый результат</th>
            <th>Примечание</th>
            <th>Отчет</th>
            <th>Выполнено/Не выполнено</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td>{{ item.row_number }}</td>
            <td>{{ item.event_name }}</td>
            <td><p v-for="(userItem, userIndex) in item.user" :key="userIndex"> {{ userItem.fullName }} </p></td>
            <td>{{ item.quarter }}</td>
            <td>{{ item.result }}</td>
            <td>{{ item.comment }}</td>
            <td>{{ item.event_result ? item.event_result.event_result : "" }}</td>
            <td>{{ item.event_result ? "Выполнено" : "Не выполнено" }}</td>
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
  props: ['planId', 'data', 'type', 'quarter', 'reportTitle'],
  data() {
    return {
      work_plan_id: this.planId,
      items: this.data,
      pdfType: this.type,
      loginedUserId: 0
    }
  },
  created() {
    //this.getData();

    console.log("title", this.reportTitle)
    this.year = new Date().getFullYear();
    //this.data.push({index: 1, name: "Test name", resp: 'User Name', quarter: 1, result: '', comment: 'Comment'})
    this.loginedUserId = JSON.parse(localStorage.getItem("loginedUser")).userID;
    this.filename = 'flname.pdf'
  },
  methods: {

  },
  mounted() {
    console.log("report items", this.items)
  }
}
</script>

<style scoped lang="scss">
table {
  width: 100%;
  font-size: 14px;
  text-align: center;
  border-collapse: collapse;
  border-spacing: 0;

  th {
    font-weight: bold;
  }

  td,
  th {
    padding: 5px;
    border: 1px solid black;
  }
}

</style>
