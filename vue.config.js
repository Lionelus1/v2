const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

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
                vm: require.resolve("vm-browserify"),
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve("stream-browserify")
            }
        },
        optimization: {
            splitChunks: {
                chunks: 'all',
            },
            minimize: true
        },
        plugins: [
            new NodePolyfillPlugin()
        ]
    },
    css: {
        extract: process.env.NODE_ENV === 'production' ? {
            ignoreOrder: true,
        } : false,
    }
}
