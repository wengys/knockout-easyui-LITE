# Knockout-easyui LITE

> 连接[Knockout](http://knockoutjs.com/)和[jeasyui](http://jeasyui.com/)

## 背景

作为老牌的MVVM框架之一，knockout提供了界面模型与DOM结构之间的双向绑定；而easyui作为前端界面库之一，也在项目中得到了广泛使用。此项目特为连接此两者而准备。

## 项目目标

本项目对表单中常用的easyui组件提供对应的easyui绑定。部分不常用组件（至少对我来说如此）暂时不提供。如果刚好您有兴趣，欢迎提交新功能或补丁。

对于每个组件，提供以下绑定（部分组件可能没有全部绑定）：
* 数据源（source）：绑定模型中的某个字段为数据源（如下拉列表中的待选项）
* 选中项（value）：当前组件选中项
* 多个选中项（values）：当前组件选择的多个选中项

每个绑定都以“照旧如旧（AS-IS）”的原则编写。除非有特别注明，否则工作方式尽量接近原生的easyui操作。且主要关注于日常表单组件的双向绑定，高级功能（如编辑功能）暂不提供支持

## 项目状态
当前版本：0.6.0。

当前已编写组件（后面为可用绑定）：

 1.  progressbar: progressbarValue
 1.  combobox：comboboxSource，comboboxValues，comboboxValue
 1.  combogrid：combogridSource，combogridValues，combogridValue
 1.  combotree：combotreeSource，combotreeValues，combotreeValue
 1.  numberbox：numberBoxValue
 1.  numberspinner：numberSpinnerValue
 1.  slider：sliderValue
 1.  datebox：dateboxValue
 1.  datetimebox：datetimeboxValue
 1.  calendar：calendarValue
 1.  datagrid：datagridSource，datagridValues，datagridValue

## 依赖

本项目基于以下版本的库开发，不过高版本的库应该没问题。
如果发现版本依赖问题，请[联系我](mailto:wengyuansheng@hotmail.com)

## 编译

> 请先安装[node.js](http://nodejs.org/)

 1. 下载项目
 1. 在当前项目目录下打开shell（CMD、BASH或者其他什么，依照当前所用系统而定）
 1. 假如第一次编译，请分别执行以下方法
    1. `npm install -g typescript`
    1. `npm install -g gulp`
 1. 执行以下方法下载所有编译依赖包
    1. `npm install`
 1. 执行`gulp`执行编译，编译结果位于 `build/` 下，将生成以下文件：
    1. knockout-easyui.debug.js：未压缩版，无AMD支持
    1. knockout-easyui.js：压缩版，无AMD支持
    1. knockout-easyui.js.map
    1. knockout-easyui.amd.debug.js：未压缩版，有AMD支持
    1. knockout-easyui.amd.js：压缩版，有AMD支持
    1. knockout-easyui.amd.js.map

## 使用

引入脚本即可。也可通过AMD模块加载器（如requirejs）加载。此时默认easyui的模块ID为`jquery.jeasyui`，请自行修改源码或采用其他方式引入
（如requirejs的[shim config](http://requirejs.org/docs/api.html#config-shim)）。

## 绑定命名约定

所有绑定均按照以下规则命名，以下所有绑定均可自行初始化easyui组件（只要设置绑定即可，不必另外初始化）

 * （组件名）Source：与数据源的双向绑定，绑定到ko.observableArray()类型的字段上。如果组件从服务端
更新数据，则对应字段也将更新

 * （组件名）Value：与当前选中值的双向绑定，绑定到ko.observable()类型的字段上。与Values绑定互斥

 * （组件名）Values：与当前选中值组的双向绑定，绑定到ko.observableArray()类型的字段上。与Value绑定互斥

初始化easyui组件时，除了原有的在html标签中采用`data-options`设置参数的方式外，
额外支持`easyuiOptions`绑定。此绑定单向绑定到一个JavaScript对象上，初始化组件时将采用其中的设置（参见源码中的DEMO/demo.html）

如果此easyui组件要求idField，请正确设置（如datagrid、combogrid等）。

## 已知问题
 1. combotree：如果组件初始化时没有设置正确的单选/多选模式，在某些场景下会导致多次请求服务端数据
 2. datagrid：单选模式下单击选中会导致多次触发unselectAll事件