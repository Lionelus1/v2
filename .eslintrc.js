module.exports = {
	globals: {
		defineProps: "readonly",
		defineEmits: "readonly",
		defineExpose: "readonly",
		withDefaults: "readonly"
	},
	root: true,
	env: {
		node: true,
	},
	extends: ['plugin:vue/vue3-essential', 'eslint:recommended'],
	parserOptions: {
		requireConfigFile: false,
		parser: '@babel/eslint-parser',
	},
	rules: {
		'no-console': 'off',
		'no-debugger': 'off',
		"no-mixed-spaces-and-tabs": 0,
		"no-unused-vars": "off",
		"vue/no-deprecated-slot-attribute": "off",
		"no-undef": "off"
	},
};
