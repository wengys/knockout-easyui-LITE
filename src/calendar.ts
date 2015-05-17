/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["calendarValue"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "calendar", allBindingsAccessor)
        var options = $(element)["calendar"]('options')
        var value = valueAccessor()
        if (!value()) { //如果没有默认值，则初始化为当前calendar的值
            var curValue = options.current
            if (curValue) {
                value(curValue)
            }
        }
        var refreshValueFun = (oriFun: Function) => {
            return function () {
                value(options.current)
                if (oriFun) {
                    oriFun.apply($(element), arguments)
                }
            }
        }

        options.onSelect = refreshValueFun(options.onSelect)
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        if ($(element)["calendar"]('options').current != value)
            $(element)["calendar"]('moveTo', value)
    }
}