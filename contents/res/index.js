#!/usr/bin/env node

var fs = require('fs');
var tinify = require('tinify');
var minimatch = require('minimatch');
var glob = require('glob');
var uniq = require('array-uniq');
var chalk = require('chalk');
var argv = require('minimist')(process.argv.slice(2));

// 设置TinyPNG API密钥，从项目根目录下的tinify.key文件中读取
var key = argv.k || argv.key || (fs.existsSync('res/key/tinify.key') ? fs.readFileSync('res/key/tinify.key', 'utf8') : '');
tinify.key = key;
// 如果没有设置API密钥,提示用户设置
if (!key) {
    console.log(chalk.red('请先设置TinyPNG API密钥，前往 https://tinify.com/dashboard/api 获取。'));
    console.log(chalk.blue('将API密钥写入key文件夹下的tinify.key文件中。'));
    process.exit();
}
var version = require('./package.json').version;
var resizeOptions = {};

if (argv.v || argv.version) {
    console.log(version);
    process.exit();
} else if (argv.h || argv.help) {
    console.log(
        '用法\n' +
        '  tinypng <路径> [选项]\n' +
        '\n' +
        '示例\n' +
        '  tinypng .\n' +
        '  tinypng assets/img\n' +
        '  tinypng assets/img/test.png\n' +
        '  tinypng assets/img/test.jpg\n' +
        '\n' +
        '选项\n' +
        '  -k, --key        提供API密钥\n' +
        '  -r, --recursive  递归遍历给定目录\n' +
        '  --width          将图像调整为指定宽度\n' +
        '  --height         将图像调整为指定高度\n' +
        '  -v, --version    显示已安装的版本\n' +
        '  -h, --help       显示此帮助信息\n'
    );
    process.exit();
}

// 解析宽度和高度参数
if (argv.width) {
  resizeOptions.width = parseInt(argv.width, 10);
  console.log(chalk.blue('指定宽度: ' + resizeOptions.width));
}
if (argv.height) {
  resizeOptions.height = parseInt(argv.height, 10);
  console.log(chalk.blue('指定高度: ' + resizeOptions.height));
}

var files = argv._.length ? argv._ : ['.'];

// 开始处理文件
console.log(chalk.blue('开始处理文件...'));



files.forEach(function(file) {
  if (fs.existsSync(file)) {
      var images = fs.lstatSync(file).isDirectory() ? glob.sync(file + '/*.+(png|jpg|jpeg)') : [file];
      console.log(images)
      var path = require('path');
      uniq(images).forEach(function(image) {
          if (minimatch(image, '*.+(png|jpg|jpeg)', {matchBase: true})) {
              var source = tinify.fromFile(image);
              // 获取文件目录和文件名
        var dirname = path.dirname(image);
        var basename = path.basename(image);
        var newFilename = path.join(dirname, "裁剪-" + basename)
              // 使用前面设置的宽度和高度进行裁剪
              var resized = source.resize({
                  method: "thumb",
                  width: resizeOptions.width,    // 使用参数中的宽度
                  height: resizeOptions.height   // 使用参数中的高度
              });

              resized.toFile(newFilename).then(function() {
                  console.log(chalk.green('裁剪完成：' + image));
              }).catch(function(error) {
                  console.error(chalk.red('裁剪错误：' + error.message));
              });
          }
      });
  }
});

