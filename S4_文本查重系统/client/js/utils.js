const fs = require('fs');
const { remote } = require('electron');
const iconv = require('iconv-lite');//解决 编码问题
const { Notification } = remote;
//方法
const pdf_previewStr = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TITLE</title>
    <style>
        .container{
            height: calc(100vh - 16px);/* 保证样式和 用chrome 浏览器打开一致*/
        }
    </style>
</head>

<body>
    <div class="container">
        <embed src="PATH" type="application/pdf" width="100%" height="100%">
    </div>
</body>

</html>`;
//实现 pdf 预览的 功能
//更改pdf_preview 中的 embed  src 属性  
export function writePdf_preview_410(name, pdfPath) {
    // const reg = /^path/
    return new Promise((resolve, reject) => {
        console.log(pdfPath);
        //替换 title 和 pdf 路径
        fs.writeFile('./pdf_preview.html', pdf_previewStr.replace('TITLE', name).replace('PATH', pdfPath), { flag: 'w' }, (err) => {
            if (err)
                return reject(err)
            return resolve('success');
        })

    })

}

//展示 通知窗体
export function showNotif_410(body) {
    const option = {
        title: '提示',
        body: body,
        // icon: './icon.png'
    };
    new Notification(option).show();
}
//设置窗口大小并 并设置到中心
export function setWindowSize_410(height, width) {
    remote.getCurrentWindow().setSize(height, width);//设置窗口大小
    remote.getCurrentWindow().center();// 窗口居中
}
//节流函数  保证一段时间内 只执行一次
export function throttlen_410(func, delay) {
    let timer = null;
    return function () {
        let context = this;
        let args = arguments;
        if (!timer) {
            timer = setTimeout(function () {
                func.apply(context, args);
                timer = null;
            }, delay);
        }
    }
}
//读写本地的文档 
export function readDoc_410(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile('./docs/' + fileName, 'binary', (err, data) => {
            if (err) {
                return reject(err);
            }
            else {
                let content = iconv.decode(data, 'gbk');//处理 node 并不兼容 gbk 
                const reg = /\s*/g
                content = content.replace(reg, '');//暂时不做处理
                // return resolve(content.replace(' ','').replace('\n',''));
                return resolve(content);
            }
        })
    })
}