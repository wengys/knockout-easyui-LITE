/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["numberboxValue"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "numberbox", allBindingsAccessor)
        var value = valueAccessor()
        if (!value()) {
            value(parseFloat($(element)["numberbox"]('getValue')))
        }
        var easyuiAccessor = ($(element)["textbox"] || ($(element)["numberbox"]));//1.3.6与1.4之间有兼容性问题
        var options = easyuiAccessor.call($(element), 'options')
        var onChange = options.onChange
        options.onChange = function (newValue, oldValue) {
            newValue = parseFloat(newValue)
            value = valueAccessor()
            if (value() !== newValue) {
                value(newValue)
                utils.func.safeApply(onChange, $(element), arguments);
            }
        }
        utils.component.bindDisposeEvent(element, "numberbox")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        $(element)["numberbox"]('setValue', value)
        if ($(element)["numberbox"]('getValue')) { //修改样式，保持显示逻辑一致性
            $(element).removeClass("validatebox-invalid")
        }
        else {
            if ($(element)["numberbox"]('options').required) {
                $(element).addClass("validatebox-invalid")
            }
        }
    }
}