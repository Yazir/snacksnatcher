const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanPlugin } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
	mode: 'development',
	entry: './src/index.ts',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
				exclude: /node_modules/,
			},
			{
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				use: {loader: 'file-loader', options: {name: '[name].[ext]', outputPath: 'fonts'}}
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.js', '.css'],
	},
	output: {
		filename: 'bundle.js',
		path: resolve(__dirname, 'dst'),
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Snack Snatcher',
			favicon: './dst/assets/favicon.png'
		}),
		new CleanPlugin(),
		new CopyPlugin({
			patterns: [{ from: './src/assets', to: 'assets'}]
		})
	]
};