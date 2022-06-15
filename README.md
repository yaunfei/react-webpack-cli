### `webpack`搭建`react`

#### 1. 步骤：

1. 初始化项目
2. 安装`webpack`及`webpack-cli`，配置`webpack.config.js`，（考虑生产和测试环境下的配置`js`）。
3. 对`html、js、css`文件操作操作。使用插件和`loader`完成。
4. 引入`typescript`、`react`。
5. 使用`eslint、prettier`。
6. 使用别名、省略扩展名和`devServer`

#### 2. 实现

##### 1. 初始化项目

```shell
npm init
```

- 将生成的`package.json`文件的`"main": "index.js"` 值改为`"private": true`

##### 2. 安装`webpack`及`webpack-cli`， 配置`webpack.config.js`

- 这里使用`yarn`

```shell
yarn add webpack webpack-cli -D
```

- 创建`src`文件夹，创建一个测试`index.js`（用于测试`wepack`的配置，后面会删除，改为`tsx`）

```js
const temporary = () => {
	console.log('test react webpack cli');
};

temporary();
```

- 创建`config`文件夹，在分别创建`webpack.config.js`、`webpack.dev.config.js`、`webpack.pro.config.js`（这里要先安装`webpack-merge`包，命令`yarn add webpack-merge -D`）

  基础配置在`webpack.config.js`

  测试相关配置在`webpack.dev.config.js`

  生产相关配置在`webpack.pro.config.js`

  相关配置具体可查看[🔗](https://webpack.docschina.org/configuration)，代码如下:

```js
// webpack.config.js
const path = require('path');
const { merge } = require('webpack-merge');
const devConfig = require('./webpack.dev.config.js');
const proConfig = require('./webpack.pro.config.js');

const config = {
	mode: 'production', // 模式
	entry: path.resolve(__dirname, '../src/index.js'), // 入口文件
	output: {
		filename: 'static/js/[name].[contenthash:8].js', // 输入文件名
		path: path.resolve(__dirname, '../build'), // 输入路径
		clean: true, // 清空原打包文件
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

// webpack.dev.config.js
module.exports = {
	mode: 'development',
	devtool: 'cheap-module-source-map',
};

// webpack.pro.config.js
module.exports = {
	mode: 'production',
	devtool: 'source-map',
};
```

- 配置`package.json`的`script`脚本

```json
{
	"scripts": {
		"build:dev": "webpack --config ./config/webpack.config.js --mode=development",
		"build:pro": "webpack --config ./config/webpack.config.js --mode=production",
		"test": "echo \"Error: no test specified\" && exit 1"
	}
}
```

- 执行`yarn build:dev`和`yarn build:pro`分别对应测试打包和生产打包

##### 3. 对`html、js、css`文件操作操作。使用插件和`loader`

- 将`js`引入到`html`文件，使用`html-webpack-plugin`插件 [🔗](https://webpack.docschina.org/plugins/html-webpack-plugin/).

  1. 创建`public`文件夹，新建`index.html`

  ```html
  <!DOCTYPE html>
  <html lang="en">
  	<head>
  		<meta charset="utf-8" />
  		<link rel="icon" href="favicon.ico" />
  		<meta name="viewport" content="width=device-width, initial-scale=1" />
  		<meta name="theme-color" content="#000000" />
  		<meta name="description" content="react-lowcode-manage" />
  		<title>react-webpack-cli</title>
  	</head>
  	<body>
  		<noscript>运行该应用，需要启动浏览器对 JavaScript 的支持</noscript>
  		<div id="root"></div>
  	</body>
  </html>
  ```

  2. 使用插件`yarn add html-webpack-plugin -D`，在`webpack.config.js`中加上插件

  ```json
  const HtmlWebpackPlugin = require('html-webpack-plugin');

  plugins: [
  		// 将js引入html
  		new HtmlWebpackPlugin({
  			template: path.resolve(__dirname, '../public/index.html'), // 输入index.html
  			favicon: path.resolve(__dirname, '../public/favicon.ico'), // favicon图标
  		}),
    ]
  ```

- 使用`less`，然后对`css`进行打包、分离、压缩

  1. 安装`less`

     `yarn add css-loader less less-loader -D`

     less-loader 将 less 文件转换成 css， css-loader 加载 css 文件。

  2. 打包、分离`css`，使用`mini-css-extract-plugin`插件，将`css`文件单独打包

     `yarn add mini-css-extract-plugin -D`

  3. 压缩`css`，使用`css-minimizer-webpack-plugin`

     `yarn add css-minimizer-webpack-plugin -D`

  4. 添加浏览器前缀，使用`postcss-loader`插件

     `yarn add postcss-loader autoprefixer -D`

  5. 统一起来：

     `yarn add css-loader less less-loader mini-css-extract-plugin css-minimizer-webpack-plugin postcss-loader autoprefixer -D`

  `webpack.config.js`配置如下：

  ```js
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');

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
  		],
  	},
    plugins: [
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
  ```

- 使用`label`，将`es6`转为`es5`

  1. 安装`babel`

     `yarn add babel-loader @babel/preset-env @babel/core -D`

     ```js
     module: {
     	rules: [
     		{
     			test: /\.(js|mjs|jsx|ts|tsx)$/i,
     			include: path.resolve(__dirname, '../src'),
     			use: {
     				loader: 'babel-loader',
     				options: {
     					presets: ['@babel/preset-env'],
     				},
     			},
     		},
     	];
     }
     ```

##### 4. 引入`typescript`、`react`

- 安装初始化`typescript`

  `yarn add typescript ts-loader -D`

  初始化`npx tsc --init`生产`tsconfig.json`

  ```js
  module: {
  	rules: [
  		// 使用ts
  		{
  			test: /\.ts$/i,
  			use: ['ts-loader'],
  		},
  	];
  }
  ```

  `tsconfig.json`配置如下：

  ```json
  {
  	"compilerOptions": {
  		"target": "es5",
  		"lib": ["dom", "dom.iterable", "esnext"],
  		"allowJs": true,
  		"skipLibCheck": true,
  		"esModuleInterop": true,
  		"allowSyntheticDefaultImports": true,
  		"strict": true,
  		"forceConsistentCasingInFileNames": true,
  		"noFallthroughCasesInSwitch": true,
  		"module": "esnext",
  		"moduleResolution": "node",
  		"resolveJsonModule": true,
  		"isolatedModules": true,
  		"noEmit": true,
  		"jsx": "react-jsx"
  	},
  	"include": ["src"]
  }
  ```

- 安装`react`， 配置 `babel` 解析 `react`

  `yarn add react react-dom`

  使用声明文件：`yarn add @types/react @types/react-dom -D`

  使用`babel`转义`react `文件：`yarn add @babel/polyfill @babel/preset-react -D`

  ```js
  module: {
  	rules: [
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
  	];
  }
  ```

  ps：记得将`webpack.config.js`的入口文件改为对应的文件

##### 5. 使用`eslint、prettier`

- 安装`prettier`格式化代码

  `yarn add --dev --exact prettier`

  1. 创建`.prettierrc`文件

  ```json
  {
  	"tabWidth": 2,
  	"useTabs": true,
  	"singleQuote": true,
  	"semi": true
  }
  ```

  2. 创建`.vscode`的`settings.son`，实现代码代码保存自动格式化

  ```json
  {
  	"typescript.tsdk": "node_modules/typescript/lib",
  	"editor.formatOnSave": true // 保存自动格式化
  }
  ```

- 安装`eslint`实现代码语法检查

  1. 这里使用的是`eslint-config-react-app`实现相关配置，减少的一些配置。
  2. 使用`eslint-config-prettier`剔除`eslint`自带的代码格式化，避免冲突。

  `yarn add eslint eslint-config-prettier eslint-config-react-app -D`

  在`package.json`中加上，配置`eslint`

  ```json
  "eslintConfig": {
  		"extends": [
  			"react-app",
  			"prettier"
  		]
  	}
  ```

##### 6. 使用别名、省略扩展名和`devServer`

- `alias`别名，在`webpack.config.js`配置即可

  ```js
  resolve: {
  		// 使用别名
  		alias: {
  			'@': path.resolve(__dirname, '../src'),
  		},
  		// 使用扩展名
  		extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
  	},
  ```

- 测试环境使用`devServer`

  1. 安装 `yarn add webpack-dev-server -D`

  2. 在`webpack.dev.config.js`配置

  ```js
  	devServer: {
  		host: '0.0.0.0',
  		port: '3000',
  		hot: true,
  		open: true,
  	},
  ```

  3. `package.json`中配置`script`

  ```json
  "scripts": {
  		"dev": "webpack serve --config ./config/webpack.config.js --mode=development",
  	}
  ```

#### 3. 具体配置

具体配置地址如下：git@github.com:yaunfei/react-webpack-cli.git
