/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["datetimeboxValue"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "datetimebox", allBindingsAccessor)
        var options = $(element)["combo"]('options')
        var value = valueAccessor()
        if (!value()) {
            //如果没有默认值，则初始化为当前datetimebox的值
            var curValue = $(element)["datetimebox"]('getValue')
            if (curValue) {
                value(curValue)
            }
        }
        var refreshValueFun = (oriFun) =>
            function () {
                value($(element)["datetimebox"]('getValue'))
                utils.func.safeApply(oriFun, $(element), arguments);
            }
        options.onChange = refreshValueFun(options.onChange)
        utils.component.bindDisposeEvent(element, "datetimebox")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        if ($(element)["datetimebox"]('getValue') != value) {
            $(element)["datetimebox"]('setValue', value)
        }
    }
}