const path = require("path");
const glob = require("glob");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlBeautifyPlugin = require("html-beautify-webpack-plugin");

module.exports = (env, options) => ({
  entry: ["./src/js/index.js", "./src/scss/style.scss"],

  output: {
    filename: "./js/bundle.js"
  },

  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "src/js"),
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },

      {
        test: /\.(sass|scss)$/,
        include: path.resolve(__dirname, "src/scss"),
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
                url: false
              }
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: true,
                ident: "postcss",
                plugins: () => {
                  let plugins = [require("postcss-preset-env")()];
                  if (options.mode === "production") {
                    plugins = [...plugins, require("cssnano")()];
                  }
                  return plugins;
                }
              }
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true
              }
            }
          ]
        })
      },

      {
        test: /\.pug$/,
        include: path.join(__dirname, "src/view"),
        loader: "pug-loader"
      }
    ]
  },

  plugins: [
    new ExtractTextPlugin({
      filename: "./css/style.bundle.css",
      allChunks: true
    }),

    ...glob.sync("./src/view/*.pug").map(filePath => {
      const name = path.parse(filePath).name;
      return new HtmlWebpackPlugin({
        template: `./${filePath}`,
        filename: `${name}.html`
      });
    }),

    new HtmlBeautifyPlugin({
      config: {
        html: {
          indent_size: 2,
          indent_inner_html: true,
          end_with_newline: true,
          preserve_newlines: true,
          unformatted: ["p", "i", "b", "span"]
        }
      },
      replace: [' type="text/javascript"']
    })
  ]
});
