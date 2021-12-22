<template>
  <div class="card def-border">
    <p></p>
  </div>
</template>

<script>
export default {
  name: "EducationView",
  props: {
    modelValue: null
  },
  data() {
    return {
      value: this.modelValue,
    }
  }
}
</script>

<style>
  .def-border {
    border: 1px solid #dee2e6;
  }
</style>