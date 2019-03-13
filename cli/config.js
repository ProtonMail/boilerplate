const path = require('path');

const loadUserConfig = (cfg) => {
    try {
        const fromUser = require(path.join(process.cwd(), 'proton.config.js'));
        if (typeof fromUser !== 'function') {
            const msg = [
                '[ProtonPack] Error',
                'The custom config from proton.config.js must export a function.',
                'This function takes one argument which is the webpack config.',
                ''
            ].join('\n');
            console.error(msg);
            process.exit(1);
        }
        return fromUser(cfg);
    } catch (e) {
        return cfg;
    }
};

/**
 * format the config based on some options
 * - port: <Number> for the dev server
 * @param  {Object} options
 * @return {Object}         Webpack's config
 */
function main(options) {
    const defaultConfig = require('../webpack.config');
    const cfg = defaultConfig(options);
    return loadUserConfig(cfg);
}

module.exports = main;
