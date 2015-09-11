/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["dateboxValue"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "datebox", allBindingsAccessor)
        var options = $(element)["datebox"]('options')
        var value = valueAccessor()
        if (!value()) { //如果没有默认值，则初始化为当前datebox的值
            var curValue = $(element)["datebox"]('getValue')
            if (curValue) {
                value(curValue)
            }
        }
        var refreshValueFun = (oriFun) =>
            function () {
                value($(element)["datebox"]('getValue'))
                utils.func.safeApply(oriFun, $(element), arguments);
            }
        options.onSelect = refreshValueFun(options.onSelect)
        utils.component.bindDisposeEvent(element, "datebox")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        if ($(element)["datebox"]('getValue') !== value) {
            $(element)["datebox"]('setValue', value)
        }
    }
}