<template>
    <small v-if="message" class="optionalText">{{ "("+message+")" }}</small>
    <small class="optionalText" v-else>No message provided.</small>
    
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
    padding:2px;
    font-size: 0.75rem;
    font-weight: 700;
    min-width: 1.5rem;
    height: 1.5rem;
    line-height: 1.5re;
    margin-left: 3px;
}
</style>