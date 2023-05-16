<template>
    <text v-if="message" class="optionalText">{{ message }}</text>
    <text class="optionalText" v-else>No message provided.</text>
    
  </template>
  
  <script>
  export default{
    name: 'OptionalMessage',
    props: {
      message: {
        type: String,
        default: null
      }
    }
  }
  </script>

<style scoped>
.optionalText{
    text-transform: lowercase;
    color:#3498DB;
    padding:2px;
    font-size: 0.75rem;
    font-weight: 700;
    min-width: 1.5rem;
    height: 1.5rem;
    line-height: 1.5re;
    margin-left: 3px;
}
</style>