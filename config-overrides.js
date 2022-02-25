const { override, addWebpackAlias, fixBabelImports, addWebpackPlugin, useBabelRc, addDecoratorsLegacy, disableEsLint, addBabelPlugin } = require("customize-cra");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const webpack = require("webpack");
const path = require("path");
const addLessLoader = require("customize-cra-less-loader");
const AntDesignThemePlugin = require("antd-theme-webpack-plugin");
const pluginProposalDecorators = require("@babel/plugin-proposal-decorators");

const options = {
  stylesDir: path.join(__dirname, "./src/assets/styles"),
  antDir: path.join(__dirname, "./node_modules/antd"),
  varFile: path.join(__dirname, "./src/assets/styles/vars.less"),
  themeVariables: ["@primary-color"],
  indexFileName: "index.html",
};

const addAnalyze = () => (config) => {
  let plugins = [new BundleAnalyzerPlugin({ analyzerPort: 7777 })];
  config.plugins = [...config.plugins, ...plugins];
  return config;
};

const addOptimization = () => (config) => {
  if (process.env.NODE_ENV === "production") {
    config.optimization = {
      splitChunks: {
        chunks: "all",
        minSize: 30000,
        maxSize: 0,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: "~",
        name: true,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
          default: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      },
    };

    config.devtool = false;
    config.plugins.push(
      new CompressionWebpackPlugin({
        test: /\.js$|\.css$/,
        threshold: 1024,
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin()
    );
  }
  return config;
};

module.exports = override(
  // addAnalyze(),
  addWebpackAlias({
    "@": path.resolve("src"),
    "~": path.resolve("src")
  }),
  addOptimization(),
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true,
  }),
  // useBabelRc(),
  disableEsLint(),
  // addDecoratorsLegacy(),
  // ...addBabelPresets("@babel/preset-react", "@babel/preset-env", [
  //   "react-app",
  //   {
  //     absoluteRuntime: false,
  //   },
  // ]),
  // ...addBabelPlugins(["@babel/plugin-proposal-decorators", { legacy: true }], ["@babel/plugin-proposal-class-properties", { loose: true }]),
  addWebpackPlugin(new AntDesignThemePlugin(options)),
  // addBabelPlugin(pluginProposalDecorators),
  addLessLoader({
    cssLoaderOptions: {
      sourceMap: true,
      modules: {
        localIdentName: "[hash:base64:8]",
      },
    },
    lessLoaderOptions: {
      lessOptions: {
        javascriptEnabled: true,
        modifyVars: {},
        localIdentName: "[local]--[hash:base64:5]",
      },
    },
  })
);