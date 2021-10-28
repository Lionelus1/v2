<template>
  <Dropdown v-model="selectedDepartment" :options="departments" optionLabel="name" optionValue="name" placeholder="Select a City" />
</template>

<script>
import { getHeader, smartEnuApi } from "@/config/config";
import axios from 'axios';
export default {
  data() {
    return {
      departments:  null,
    }
  },
  methods: {
    getDepartments() {
      axios.post(smartEnuApi+"getdepartments", {headers: getHeader()})
        .then(response=>{
          this.departments = response.data;
        })
        .catch((error) => {
          this.$toast.add({
          severity: "error",
          summary: "getDepattments:\n" + error,
          life: 3000,
        });
        if (error.response.status === 404) {
          this.departments = null;
        }
        });
      },
  }
}

</script>
