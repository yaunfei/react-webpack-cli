const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const devConfig = require('./webpack.dev.config.js');
const proConfig = require('./webpack.pro.config.js');

const config = {
	mode: 'production', // 模式
	entry: path.resolve(__dirname, '../src/index.tsx'), // 入口文件
	output: {
		filename: 'static/js/[name].[contenthash:8].js', // 输入文件名
		path: path.resolve(__dirname, '../build'), // 输入路径
		clean: true, // 清空原打包文件
	},
	module: {
		rules: [
			// 使用 less
			{
				test: /\.less$/i,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [require('autoprefixer')],
							},
						},
					},
					'less-loader',
				],
			},
			// babel 转义ts
			{
				test: /\.(js|mjs|jsx|ts|tsx)$/i,
				include: path.resolve(__dirname, '../src'),
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env', '@babel/preset-react'],
					},
				},
			},
			// 使用ts
			{
				test: /\.ts$/i,
				use: ['ts-loader'],
			},
		],
	},
	plugins: [
		// 将js引入html
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../public/index.html'), // 输入index.html
			favicon: path.resolve(__dirname, '../public/favicon.ico'), // favicon图标
		}),
		// 提取css
		new MiniCssExtractPlugin({
			filename: 'static/css/[name].[contenthash:8].css',
		}),
	],
	optimization: {
		minimizer: [
			new CssMinimizerWebpackPlugin(), // 压缩css
		],
	},
	resolve: {
		// 使用别名
		alias: {
			'@': path.resolve(__dirname, '../src'),
		},
		// 使用扩展名
		extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
	},
};

module.exports = (env, argv) => {
	// 开发环境
	if (argv.mode === 'development') {
		return merge(config, devConfig);
	}
	// 生产环境
	if (argv.mode === 'production') {
		return merge(config, proConfig);
	}
};
