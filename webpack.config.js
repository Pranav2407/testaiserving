const path = require('path');
const webpack = require('webpack');

// Common configuration for all bundles
const commonConfig = {
    optimization: {
        minimize: true
    }
};

const PRIMARY_DOMAIN = "aibrowser.com";

module.exports = [
    // Lander bundles
    {
        ...commonConfig,
        entry: {
            'js/lander/aibrowser': './backend-scripts/entries/aibrowser.js',
            'js/lander/ai': './backend-scripts/entries/ai.js',
            'js/lander/pdf': './backend-scripts/entries/pdf.js',
            'js/lander/maps': './backend-scripts/entries/maps.js',
            'js/lander/package': './backend-scripts/entries/package.js',
            'js/lander/manuals': './backend-scripts/entries/manuals.js',
            'js/lander/aichat': './backend-scripts/entries/aichat.js',
            'js/lander/index': './backend-scripts/entries/base.js',
        },
        output: {
            path: path.resolve(__dirname, 'tron'),
            filename: '[name].js'
        },
        plugins: [
            new webpack.DefinePlugin({
                'PAGE_TYPE': JSON.stringify('default'),
                'LANDER_DOMAIN': JSON.stringify(PRIMARY_DOMAIN)
            })
        ]
    },
    
    
    // Landing page bundles
    {
        ...commonConfig,
        entry: {
            'js/landingpage/aibrowser': './backend-scripts/entries/aibrowser.js',
            'js/landingpage/ai': './backend-scripts/entries/ai.js',
            'js/landingpage/pdf': './backend-scripts/entries/pdf.js',
            'js/landingpage/maps': './backend-scripts/entries/maps.js',
            'js/landingpage/package': './backend-scripts/entries/package.js',
            'js/landingpage/manuals': './backend-scripts/entries/manuals.js',
            'js/landingpage/aichat': './backend-scripts/entries/aichat.js',
            'js/landingpage/index': './backend-scripts/entries/base.js',
        },
        output: {
            path: path.resolve(__dirname, 'tron'),
            filename: '[name].js'
        },
        plugins: [
            new webpack.DefinePlugin({
                'PAGE_TYPE': JSON.stringify('landingpage'),
                'LANDER_DOMAIN': JSON.stringify(PRIMARY_DOMAIN)
            })
        ]
    },
    //input based landing page
    {
        ...commonConfig,
        entry: {
            'asksmartai/js/index': './backend-scripts/input_based_landers/asksmartai/index.js',
            'asksmartai/js/footer/footer': './backend-scripts/footer.js',
            'asksmartai/js/product': './backend-scripts/input_based_landers/asksmartai/product/index.js',
            'asksmartai/js/thank-you/thankyou': './backend-scripts/thankyou.js',
            'asksmartai/js/success/success': './backend-scripts/input_based_landers/thankyou.js',
        },
        output: {
            path: path.resolve(__dirname, 'input_based_landers'),
            filename: '[name].js'
        },
        plugins: [
            new webpack.DefinePlugin({
                'PAGE_TYPE': JSON.stringify('landingpage'),
                'LANDER_DOMAIN': JSON.stringify('chatsmarter.ai')
            })
        ]
    },
    {
        ...commonConfig,
        entry: {
            'convertpdfs/js/index': './backend-scripts/input_based_landers/convertpdfs/index.js',
            'convertpdfs/js/product': './backend-scripts/input_based_landers/convertpdfs/product/index.js',
            'convertpdfs/js/footer/footer': './backend-scripts/footer.js',
            'convertpdfs/js/thank-you/thankyou': './backend-scripts/thankyou.js',
        },
        output: {
            path: path.resolve(__dirname, 'input_based_landers'),
            filename: '[name].js'
        },
        plugins: [
            new webpack.DefinePlugin({
                'PAGE_TYPE': JSON.stringify('landingpage'),
                'LANDER_DOMAIN': JSON.stringify('convertpdfs.ai')
            })
        ]
    },
    {
        ...commonConfig,
        entry: {
            'pictureeditor/js/lander': './backend-scripts/input_based_landers/pictureeditor/index.js',
            'pictureeditor/js/product': './backend-scripts/input_based_landers/pictureeditor/product/index.js',
            'pictureeditor/js/footer/footer': './backend-scripts/footer.js',
            'pictureeditor/js/thank-you/thankyou': './backend-scripts/thankyou.js',
        },
        output: {
            path: path.resolve(__dirname, 'input_based_landers'),
            filename: '[name].js'
        },
        plugins: [
            new webpack.DefinePlugin({
                'PAGE_TYPE': JSON.stringify('landingpage'),
                'LANDER_DOMAIN': JSON.stringify('pictureeditor.ai')
            })
        ]
    },
    {
        ...commonConfig,
        entry: {
            'quickdirections/js/index': './backend-scripts/input_based_landers/quickdirections/index.js',
            'quickdirections/js/product': './backend-scripts/input_based_landers/quickdirections/product/index.js',
            'quickdirections/js/footer/footer': './backend-scripts/footer.js',
            'quickdirections/js/thank-you/thankyou': './backend-scripts/thankyou.js',
        },
        output: {
            path: path.resolve(__dirname, 'input_based_landers'),
            filename: '[name].js'
        },
        plugins: [
            new webpack.DefinePlugin({
                'PAGE_TYPE': JSON.stringify('landingpage'),
                'LANDER_DOMAIN': JSON.stringify('quickdirections.ai')
            })
        ]
    },
    //input based landing page
    {
        ...commonConfig,
        entry: {
            'manualschat/js/index': './backend-scripts/input_based_landers/manualschat/index.js',
            'manualschat/js/footer/footer': './backend-scripts/footer.js',
            'manualschat/js/product': './backend-scripts/input_based_landers/manualschat/product/index.js',
            'manualschat/js/thank-you/thankyou': './backend-scripts/thankyou.js',
        },
        output: {
            path: path.resolve(__dirname, 'input_based_landers'),
            filename: '[name].js'
        },
        plugins: [
            new webpack.DefinePlugin({
                'PAGE_TYPE': JSON.stringify('landingpage'),
                'LANDER_DOMAIN': JSON.stringify('manualschat.ai')
            })
        ]
    },
    {
        ...commonConfig,
        entry: {
            'trackpackage/js/index': './backend-scripts/input_based_landers/trackpackage/index.js',
            'trackpackage/js/product': './backend-scripts/input_based_landers/trackpackage/product/index.js',
            'trackpackage/js/footer/footer': './backend-scripts/footer.js',
            'trackpackage/js/thank-you/thankyou': './backend-scripts/thankyou.js',
        },
        output: {
            path: path.resolve(__dirname, 'input_based_landers'),
            filename: '[name].js'
        },
        plugins: [
            new webpack.DefinePlugin({
                'PAGE_TYPE': JSON.stringify('landingpage'),
                'LANDER_DOMAIN': JSON.stringify('packagetracker.ai')
            })
        ]
    },
    
    // Other standalone bundles
    {
        ...commonConfig,
        entry: {
            'js/thank-you/thankyou': './backend-scripts/thankyou.js',
            'js/footer/footer': './backend-scripts/footer.js'
        },
        output: {
            path: path.resolve(__dirname, 'tron'),
            filename: '[name].js'
        },
        plugins: [
            new webpack.DefinePlugin({
                'LANDER_DOMAIN': JSON.stringify(PRIMARY_DOMAIN)
            })
        ]
    }
];