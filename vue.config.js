module.exports = {
    runtimeCompiler: true,
    productionSourceMap: false,
    pluginOptions: {
        i18n: {
            locale: 'kz',
            fallbackLocale: 'en',
            enableInSFC: false
        }
    },
    publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
    configureWebpack: {
        resolve: {
            fallback: {
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve("stream-browserify")
            }
        }
    }
}
