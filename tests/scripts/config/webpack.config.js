const path = require('path');
const webpack = require('webpack');

module.exports = {
    resolve: {
        modules: [
            path.resolve(__dirname, '../../../scripts'),
            path.resolve(__dirname, '../../../node_modules')
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ],
    module: {
        rules: [
            {
                test: /\.js/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [['es2015', { modules: false }]],
                    plugins: [
                        ['istanbul', {
                            exclude: [
                                'tests/**/*.js'
                            ]
                        }]
                    ]
                }
            }
        ]
    }
};
