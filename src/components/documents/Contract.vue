<template>
	<div class="ontent-section">
		<h4>{{$t('contracts.contract')}}</h4>
		<TabView>
			<TabPanel :header="$t('common.params')">

				<div class="p-grid">
					<div class="p-col-8">
						<h6>{{$t('common.main').toUpperCase()}}</h6>
						<div v-if="contract != null && contract.sourceType === 0" class="p-fluid">
							<div v-for="param in contract.params" :key="param.id" class="p-field p-grid">
									<label :for="param.name + param.id" class="p-col-12 p-mb-2 p-md-2 p-mb-md-0">{{ getParamDesciption(param, contract.lang)}}</label>
									<div class="p-col-12 p-md-10">
											<UserSearch v-if="param.name=='student'" v-model="param.value" :userType="1"></UserSearch>
											<DatePicker v-else-if="param.name=='period'" v-model="param.value" is-range>
											  <template v-slot="{ inputValue, inputEvents }">
													<div class="flex justify-center items-center">
														<input
															:value="inputValue.start"
															v-on="inputEvents.start"
															class="border px-2 py-1 w-32 rounded focus:outline-none focus:border-indigo-300"
														/>
														<svg
															class="w-4 h-4 mx-2"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M14 5l7 7m0 0l-7 7m7-7H3"
															/>
														</svg>
														<input
															:value="inputValue.end"
															v-on="inputEvents.end"
															class="border px-2 py-1 w-32 rounded focus:outline-none focus:border-indigo-300"
														/>
													</div>
												</template>
											</DatePicker>
											<InputText v-else :id="param.name + param.id" type="text" />

									</div>
							</div>

						</div>


					</div>
					<div class="p-col-4">
						<div v-if="contract != null && contract.sourceType === 0" class="p-fluid">
							<embed style="min-height:300px" src="data:application/pdf;base64,JVBERi0xLjEKJcKlwrHDqwoKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCgoyIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2VzCiAgICAgL0tpZHMgWzMgMCBSXQogICAgIC9Db3VudCAxCiAgICAgL01lZGlhQm94IFswIDAgMzAwIDE0NF0KICA+PgplbmRvYmoKCjMgMCBvYmoKICA8PCAgL1R5cGUgL1BhZ2UKICAgICAgL1BhcmVudCAyIDAgUgogICAgICAvUmVzb3VyY2VzCiAgICAgICA8PCAvRm9udAogICAgICAgICAgIDw8IC9GMQogICAgICAgICAgICAgICA8PCAvVHlwZSAvRm9udAogICAgICAgICAgICAgICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAgICAgICAgICAgICAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgogICAgICAgICAgICAgICA+PgogICAgICAgICAgID4+CiAgICAgICA+PgogICAgICAvQ29udGVudHMgNCAwIFIKICA+PgplbmRvYmoKCjQgMCBvYmoKICA8PCAvTGVuZ3RoIDU1ID4+CnN0cmVhbQogIEJUCiAgICAvRjEgMTggVGYKICAgIDAgMCBUZAogICAgKEhlbGxvIFdvcmxkKSBUagogIEVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDc3IDAwMDAwIG4gCjAwMDAwMDAxNzggMDAwMDAgbiAKMDAwMDAwMDQ1NyAwMDAwMCBuIAp0cmFpbGVyCiAgPDwgIC9Sb290IDEgMCBSCiAgICAgIC9TaXplIDUKICA+PgpzdGFydHhyZWYKNTY1CiUlRU9GCg==#toolbar=0&navpanes=0&scrollbar=0"    type="application/pdf"
								frameBorder="0"
								scrolling="auto"
								height="100%"
								width="100%"
								/>
						</div>
					</div>
				</div> I
			</TabPanel>

			<TabPanel header="Header III">
				Content III
			</TabPanel>
		</TabView>


	Hello {{$route.params.id}}
	</div>
</template>
<script>
import {apiDomain} from "@/config/config";
import axios from 'axios';

import UserSearch from "./usersearch/UserSearch.vue";
import { DatePicker } from 'v-calendar';
export default {

	name: "Contract",
	components: {  UserSearch, DatePicker},
	data() {
		return {
			contract: null,
			students: null,
			range: {
      	start: new Date(2020, 0, 1),
      	end: new Date(2020, 0, 5)
    	},
		}

	},
	methods: {
		sm(message) {
			alert( JSON.stringify(message));

		},
		initApiCall() {
			let url = "/agreement/get";
			var req = {"id" : parseInt(this.$route.params.id)};
			console.log(req)
      axios.post(apiDomain+url, req)
			.then(res=>{
				this.contract = res.data
				if (this.contract.sourceType == 0){
					this.contract.text = this.contract.lang == this.language.kz ? this.contract.template.mainTextKaz : this.contract.template.mainTextRus
					this.contract.params.forEach(param => {
						if (param.name === 'period') {
							param.value = JSON.parse(`{"start":"03-05-2021","end":"04.06.2025"}`);
						}

					});
				}
				})
		},
		getParamDesciption(param, lang) {
			if (param.description != "")
				return param.description;
			if (param.name == "ourside")
				return lang == this.language.kz ? "біздің тарап" : "наша сторона"
			if (param.name == "contragent")
				return lang == "контрагент"
			if (param.name == "period")
				return lang == this.language.kz ? "келісім-шарт кезеңі" : "период договора"
			if (param.name == "date")
				return lang == this.language.kz ? "келісім-шарт күні" : "дата соглашения договора"
			if (param.name == "place")
				return lang == this.language.kz ? "келісім-шарт жасалған орын" : "место заключения договора"

		}
	},
	mounted() {
      this.initApiCall();
  },
}
</script>
<style scoped lang="scss">
  .border-indigo-300 {
    --border-opacity: 1;
    border-color: #a3bffa;
    border-color: rgba(163, 191, 250, var(--border-opacity));
	}
	.px-2 {
    padding-left: .5rem;
    padding-right: .5rem;
	}
	.py-1 {
    padding-top: .25rem;
    padding-bottom: .25rem;
	}
	.border {
    border-width: 1px;
	}
	.rounded {
    border-radius: .25rem;
	}
	.focus\:outline-none:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
	}
	.focus\:border-indigo-300:focus {
    --border-opacity: 1;
    border-color: #a3bffa;
    border-color: rgba(163, 191, 250, var(--border-opacity));
	}
	.w-4 {
    width: 1rem;
	}
	.h-4 {
    height: 1rem;
	}
	.mx-2 {
    margin-left: .5rem;
    margin-right: .5rem;
	}


</style>