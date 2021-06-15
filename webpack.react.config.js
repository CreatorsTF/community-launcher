const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        mainFields: ["main", "module", "browser"],
    },
    entry: "./src/app.tsx",
    target: "electron-renderer",
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                // Just using this in case
                // the file gets named .sass
                // Keep using .scss!
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates "style" nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    {
                        loader: "sass-loader",
                        options: {
                            // Prefer "dart-sass"
                            implementation: require("sass"),
                            sassOptions: {
                                fiber: false
                            }
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        contentBase: path.resolve(__dirname, "./build/renderer"),
        historyApiFallback: true,
        compress: true,
        hot: true,
        port: 3000,
        publicPath: "/"
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "js/[name].js",
        // publicPath: "./"
    },
    plugins: [ new HtmlWebpackPlugin() ]
};