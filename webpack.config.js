const { getSource, firstExisting } = require('./webpack/helpers/source');
const { getJsLoaders } = require('./webpack/js.loader');
const getCssLoaders = require('./webpack/css.loader');
const getAssetsLoaders = require('./webpack/assets.loader');
const getAlias = require('./webpack/alias');
const getPlugins = require('./webpack/plugins');
const getOptimizations = require('./webpack/optimization');
const { outputPath } = require('./webpack/paths');

function main({ port, publicPath, flow, appMode, featureFlags, writeSRI = true }) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isTtag = flow === 'i18n';

    const options = {
        isProduction,
        isTtag,
        publicPath: publicPath || '/',
        appMode,
        featureFlags,
        writeSRI
    };

    const config = {
        stats: 'minimal',
        mode: isProduction ? 'production' : 'development',
        bail: isProduction,
        devtool: false,
        watchOptions: {
            ignored: [/node_modules/, 'i18n/*.json', /\*\.(gif|jpeg|jpg|ico|png)/]
        },
        resolve: {
            extensions: ['.js', '.tsx', '.ts'],
            alias: getAlias()
        },
        entry: {
            // The order is important. The supported.js file sets a global variable that is used by unsupported.js to detect if the main bundle could be parsed.
            index: [
                firstExisting(['./src/app/index.tsx', './src/app/index.js']),
                getSource('./node_modules/proton-shared/lib/browser/supported.js')
            ],
            unsupported: [getSource('./node_modules/proton-shared/lib/browser/unsupported.js')]
        },
        output: {
            path: outputPath,
            filename: isProduction ? '[name].[chunkhash:8].js' : '[name].js',
            publicPath,
            chunkFilename: isProduction ? '[name].[chunkhash:8].chunk.js' : '[name].chunk.js',
            crossOriginLoading: 'anonymous'
        },
        module: {
            // Make missing exports an error instead of warning
            strictExportPresence: true,
            rules: [...getJsLoaders(options), ...getCssLoaders(options), ...getAssetsLoaders(options)]
        },
        plugins: getPlugins(options),
        optimization: getOptimizations(options),
        devServer: {
            hot: !isProduction,
            inline: true,
            compress: true,
            host: '0.0.0.0',
            historyApiFallback: {
                index: publicPath
            },
            disableHostCheck: true,
            contentBase: outputPath,
            publicPath,
            stats: 'minimal'
        }
    };

    if (isTtag) {
        delete config.devServer;
        delete config.optimization;
    }

    return config;
}

module.exports = main;
