const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const parentNodeModules = path.resolve(__dirname, "../node_modules");

module.exports = {
  entry: "./src/index.tsx",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    // Resolve modules from parent's node_modules first so both the test app and
    // the RSBCImage source share the same React instance.
    modules: [parentNodeModules, path.resolve(__dirname, "node_modules")],
    alias: {
      // Use single React instance from parent to avoid "two React" issues
      react: path.resolve(parentNodeModules, "react"),
      "react-dom": path.resolve(parentNodeModules, "react-dom"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { runtime: "automatic" }],
              "@babel/preset-typescript",
            ],
          },
        },
        // Process source files but skip node_modules (except @aot-technologies which may
        // ship un-compiled source in some versions)
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        // Handle PNG/image assets imported in helperServices.ts
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    // Replace @aot-technologies/formio-react with a lightweight mock so
    // RSBCImage can be instantiated without a full formio.js context.
    new webpack.NormalModuleReplacementPlugin(
      /@aot-technologies\/formio-react/,
      path.resolve(__dirname, "src/mocks/formio-react.ts")
    ),
    // Replace @aot-technologies/formiojs (used only by RSBCImage.settingsForm
    // which configures the form.io builder UI — not needed for test rendering).
    new webpack.NormalModuleReplacementPlugin(
      /@aot-technologies\/formiojs/,
      path.resolve(__dirname, "src/mocks/formiojs.ts")
    ),
    // Replace formsflow-rsbcservices so OfflineFetchService returns mock data
    // instead of hitting IndexedDB.
    new webpack.NormalModuleReplacementPlugin(
      /formsflow-rsbcservices/,
      path.resolve(__dirname, "src/mocks/rsbcServices.ts")
    ),
  ],
  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
    open: true,
  },
};
