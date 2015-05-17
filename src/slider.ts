/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["sliderValue"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "slider", allBindingsAccessor)
        var value = valueAccessor()
        if (!value()) {
            value($(element)["slider"]('getValue'))
        }
        var options = $(element)["slider"]('options')
        var onChange = options.onChange
        options.onChange = function (newValue, oldValue) {
            if (newValue != value()) {
                value(newValue)
                if (onChange) {
                    onChange.apply(this, arguments)
                }
            }
        }
        utils.component.bindDisposeEvent(element, "slider")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        if ($(element)["slider"]('getValue') != value)
            $(element)["slider"]('setValue', value)
    }
}