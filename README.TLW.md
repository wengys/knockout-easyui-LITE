# Knockout-easyui LITE —— TLW

## 变更

1. easyui模块名改为`jquery.easyui`

1. window绑定默认值改为公司常用设置

1. 增加validationSummary绑定，直接获取所有错误信息（由于easyui1.4.5才支持form change事件，故而采用简单粗暴的方式检查）

1. 增加panel绑定，用法：`data-bind="panel:panelOptions"`。可以结合easyui原有的dom attribute使用