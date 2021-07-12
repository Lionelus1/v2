 module.exports = {

	runtimeCompiler: true,
  pluginOptions: {
    i18n: {
      locale: 'kz',
      fallbackLocale: 'en',
      enableInSFC: false
    }
  },
	publicPath: process.env.NODE_ENV === 'production' ? '/sigma-vue' : '/',

}