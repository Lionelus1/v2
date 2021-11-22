<template>
    <div :class="containerClass" :style="style">

        <ul :class="['p-inputtext p-chips-multiple-container', {'p-disabled': $attrs.disabled, 'p-focus': focused}]" @click="onWrapperClick()">
            <li v-for="(val,i) of modelValue" :key="`${i}_${val}`" class="p-chips-token">
                <slot name="chip" :value="val.code">
                    <span class="p-chips-token-label">{{val.code}} {{($i18n.locale === "ru" ? val.nameInRu : val.nameInKz)}}</span>
                    <span class="p-chips-token-icon pi pi-times-circle" @click="removeItem($event, i)"></span>
                </slot>
            </li>
            <li class="p-chips-input-token">
                <input aria:haspopup="true" ref="input" type="text" v-bind="$attrs" @focus="onFocus" @blur="onBlur($event)" @input="onInput" @keydown="onKeyDown($event)" @keyup="onKeyUp($event)" @paste="onPaste($event)"
                     :disabled="$attrs.disabled || maxedOut">
            </li>
        </ul>
        <OverlayPanel ref="op" appendTo="body" id="overlay_panel" style="width: 50">
					<p v-if="searchInProgres">{{$t('common.loading')}}...</p>
					<Listbox v-else-if="(foundSpecialists != null)" v-model="selectedEntity" :options="foundSpecialists" listStyle="max-height:250px" @change="addItemMouseExt($event)">
						<template #option="slotProps">
							<div class="user-item p-grid">
								<div class="user-list-detail p-lg-10  p-md-9 p-sm-12">
									<span class="product-category">{{slotProps.option.code}} {{$i18n.locale === "ru" ? slotProps.option.nameInRu : slotProps.option.nameInKz}}</span>
								</div>
							</div>
						</template>
					</Listbox>

					<p v-else>{{$t('common.message.recordNotFound')}}</p>
        </OverlayPanel>



    </div>

</template>

<script>
	import {smartEnuApi, getHeader} from "@/config/config";
	import axios from 'axios';

	export default {
    inheritAttrs: false,
    emits: ['update:modelValue', 'add', 'remove'],
    props: {
        modelValue: {
            type: Array,
            default: null
        },
        // білім деңгейі (бакалавриат, докторантура, магистратура, резидентура)
        // @/enum/docstates/index" EducationLevel 
        educationLevel: null,
        max: {
            type: Number,
            default: null
        },
        separator: {
            type: String,
            default: null
        },
        addOnBlur: {
            type: Boolean,
            default: null
        },
        allowDuplicate: {
            type: Boolean,
            default: true
        },
        class: null,
        style: null
    },
    data() {
        return {
            cancelToken : null,
						requests: [],
						request: null,
            inputValue: null,
            focused: false,
						foundSpecialists: null,
						keyPressDate : Date.now(),
						selectedEntity: {
							name : "",
						},
						searchInProgres: false,
        };
    },
    methods: {
		toggle(event, inputValue) {
    		if (inputValue.length<2)
				return;
                    //Check if there are any previous pending requests
            if (this.cancelToken && typeof this.cancelToken != typeof undefined) {
                this.cancelToken.cancel("Operation canceled due to new request.")
            }
            this.cancelToken = axios.CancelToken.source()
			this.foundSpecialists = null;
			this.$refs.op.hide();
			this.$refs.op.toggle(event);
			this.searchInProgres = true;
			let url = "/getspecialities";
			axios.post(smartEnuApi+url, { 
                "name" : inputValue, 
                "level" : this.educationLevel
                }, 
                {
                    headers: getHeader(),
                    cancelToken: this.cancelToken.token 
                }
            )
            .then(response=>{
                this.foundSpecialists = response.data;
			    this.searchInProgres = false;

            })
			.catch((error) => {
                if(!axios.isCancel(error)) {
                this.$toast.add({
                severity: "error",
                summary: "getSpeciliatyListError:\n" + error,
                life: 3000,
                });
    			this.searchInProgres = false;
				if (error.response.status === 404) {
					this.foundSpecialists = null;
				}
			}});
			},
			addItemMouseExt(event) {
				this.addItem(event, event.value, false);

			},
      onWrapperClick() {
        this.$refs.input.focus();
      },
      onInput(event) {
        this.inputValue = event.target.value;
      },
      onFocus() {
           this.focused = true;
       },
       onBlur(event) {
           this.focused = false;
           if (this.addOnBlur) {
               this.addItem(event, event.target.value, false);
           }
       },
       onKeyUp(event) {
          const inputValue = event.target.value;
					if (inputValue.length>0) {
						this.toggle(event, inputValue);
					} else {
						this.$refs.op.hide();
					}

       },
       onKeyDown(event) {
           const inputValue = event.target.value;
           switch(event.which) {
               //backspace
               case 8:
                   if (inputValue.length === 0 && this.modelValue && this.modelValue.length > 0) {
                       this.removeItem(event, this.modelValue.length - 1);
                   }
               break;
               //enter
               case 13:
								if (this.foundSpecialists && this.foundSpecialists.length>0 && !this.maxedOut) {
                       this.addItem(event, this.foundSpecialists[0], true);
                   }
               break;

               default:
                   if (this.separator) {
                       if (this.separator === ',' && event.which === 188) {
                           this.addItem(event, inputValue, true);
                       }
                   }
               break;
           }
       },
       onPaste(event) {
           if (this.separator) {
               let pastedData = (event.clipboardData || window['clipboardData']).getData('Text');
               if (pastedData) {
                   let value = this.modelValue || [];
                   let pastedValues = pastedData.split(this.separator);
                   pastedValues = pastedValues.filter(val => (this.allowDuplicate || value.indexOf(val) === -1));
                   value = [...value, ...pastedValues];
                   this.updateModel(event, value, true);
               }
           }
       },
        updateModel(event, value, preventDefault) {
            this.$emit('update:modelValue', value);
            this.$emit('add', {
                originalEvent: event,
                value: value
            });
            this.$refs.input.value = '';
            this.inputValue = '';

            if (preventDefault) {
                event.preventDefault();
            }
        },
        addItem(event, item, preventDefault) {
            if (item) {
              let value = this.modelValue ? [...this.modelValue]: [];
							if (this.allowDuplicate || value.indexOf(item) === -1) {
                value.push(item);
                this.updateModel(event, value, preventDefault);
              }
							this.$refs.op.hide();
            }

        },
        removeItem(event, index) {
            if (this.$attrs.disabled) {
                return;
            }
            let values = [...this.modelValue];
            const removedItem = values.splice(index, 1);
            this.$emit('update:modelValue', values);
            this.$emit('remove', {
                originalEvent: event,
                value: removedItem
            });
        }
    },
    computed: {
        maxedOut() {
            return this.max && this.modelValue && this.max === this.modelValue.length;
        },
        containerClass() {
            return ['p-chips p-component p-inputwrapper', this.class, {
                'p-inputwrapper-filled': ((this.modelValue && this.modelValue.length) || (this.inputValue && this.inputValue.length)),
                'p-inputwrapper-focus': this.focused
            }];
        }
    }
}
</script>

<style lang="scss" scoped>
.round {
    border-radius: 100px; /* Радиус скругления */
    box-shadow: 0 0 0 3px green, 0 0 13px #333; /* Параметры теней */
   }
.user-item {
	display: flex;
	align-items: center;
	padding: .5rem;
	width: 100%;

	img {
		width: 60px;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
        margin-right: 1rem;
	}

	.user-list-detail {
		flex: 1 1 0;
	}

	.user-list-action {
		display: flex;
        flex-direction: column;
        align-items: flex-end;
    }

    .user-category-icon {
        vertical-align: middle;
        margin-right: .5rem;
    }

    .user-category {
        vertical-align: middle;
        line-height: 1;
    }
}
.p-chips {
    display: inline-flex;
}

.p-chips-multiple-container {
    margin: 0;
    padding: 0;
    list-style-type: none;
    cursor: text;
    overflow: hidden;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.p-chips-token {
    cursor: default;
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
}

.p-chips-input-token {
    flex: 1 1 auto;
    display: inline-flex;
}

.p-chips-token-icon {
    cursor: pointer;
}

.p-chips-input-token input {
    border: 0 none;
    outline: 0 none;
    background-color: transparent;
    margin: 0;
    padding: 0;
    box-shadow: none;
    border-radius: 0;
    width: 100%;
}

.p-fluid .p-chips {
    display: flex;
}
</style>
