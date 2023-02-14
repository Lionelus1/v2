<template>
  <div class="stepper">
    <div class="top">
      <div v-for="(item, index) in options" :key="index" :class="{'step-header': true, 'active': index <= currentPosition,
          'start': index === 0, 'end': index === options.length}">
        <div class="header-indicator">
          <div class="step-header-line" v-if="index > 0">

          </div>
          <div class="step-header-content">
            {{ index + 1 }}
          </div>
        </div>
        <div class="title" v-for="(it, ind) in item" :key="ind">
          {{ it.user.fullName }}
          <i v-if="it.is_success" class="pi pi-check-circle p-ml-2 p-message-success" style="font-size: 1.2rem;color: #3eaf7c"></i>
          <i v-if="!it.is_success" class="pi pi-spinner p-ml-2" style="font-size: 1.2rem;color: #c63737"></i>
        </div>
      </div>
    </div>

    <div style="width:100%">
      <transition-group :name="transitionType" class="body" mode="out-in">
        <div v-for="(item, index) in options" :key="'step' + index" v-show="currentPosition === index"
             :class="{'steps-item':true}">
          <slot :name="'step-' + (index+1)"></slot>
        </div>
      </transition-group>
    </div>
    <div class="foot">

    </div>
  </div>
</template>

<script>
export default {
  name: "WorkPlanApproveStatus",
  props: ['options'],
  data() {
    return {
      currentPosition: 0,
      transitionType: 'slide'
    }
  },
  methods: {
    next() {
      if (this.currentPosition < this.options.headers.length - 1) {
        this.transitionType = 'stepper-slide-1'
        this.currentPosition++
      }
    },
    prev() {
      if (this.currentPosition > 0) {
        this.transitionType = 'stepper-slide-2'
        this.currentPosition--
      }
    },
    slideTo(index) {
      if (this.currentPosition === index) return
      if (this.currentPosition > index) {
        this.transitionType = 'stepper-slide-2'
      } else {
        this.transitionType = 'stepper-slide-1'
      }
      this.currentPosition = index;
    }
  }
}
</script>
<style scoped>
.top {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  padding: 10px;
  width: 100%;
  /*flex-order-: center;*/
}

.step-header {
  display: flex;
  flex-direction: column;
}

.header-indicator {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-order-: center;
  margin-bottom: 10px;
}

.step-header.start > .header-indicator {
  align-self: flex-end;
}

.step-header-line {
  display: inline-flex;
  width: 200px;
  height: 3px;
  background-color: grey;
}

.step-header-content {
  display: inline-flex;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: grey;
  color: white;
  align-items: center;
  flex-order-: center;
  cursor: pointer;
}

.step-header.active .step-header-content,
.step-header.active .step-header-line {
  /*background-color: rebeccapurple;*/
}

.title {
  display: inline-flex;
  align-self: flex-end;
  text-transform: capitalize;
  /*width: 100px;*/
  position: relative;
  right: -10%;
  flex-order-: center;
  margin-top: 3px;
}

.step-header.start > .title {
  right: -35%;
}

.steps-item {
  min-width: 100%;
}

.body {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  min-width: 100%;
  flex-shrink: 0;
}

.foot {
  display: flex;
  width: 100%;
  flex-direction: row;
}

.next-button {
  margin-left: auto;
}

button {
  padding: 7px 15px;
  color: white;
  background-color: green;
  border: 0;
  outline: 0;
  border-radius: 5px;
}

.stepper {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}


.stepper-slide-1-enter-active {
  animation: slide-in .3s;
}

.stepper-slide-1-leave-active {
  animation: slide-out .3s;
}

@keyframes slide-in {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes slide-out {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.stepper-slide-2-enter-active {
  animation: slide2-in .3s;
}

.stepper-slide-2-leave-active {
  animation: slide2-out .3s;
}

@keyframes slide2-in {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes slide2-out {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>