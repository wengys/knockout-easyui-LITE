/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["progressbarValue"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "progressbar", allBindingsAccessor)
        var value = valueAccessor()
        if (!value()) {
            value($(element)["progressbar"]('getValue'))
        }
        var options = $(element)["progressbar"]('options')
        var onChange = options.onChange
        options.onChange = function (newValue, oldValue) {
            newValue = parseFloat(newValue)
            var value = valueAccessor()
            if (value() != newValue) {
                value(newValue)
                if (onChange) {
                    onChange.apply(this, arguments)
                }
            }
        }
        utils.component.bindDisposeEvent(element, "progressbar")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        $(element)["progressbar"]('setValue', value)
        var updatedValue = $(element)["progressbar"]('getValue')
        if (value != updatedValue) {
            valueAccessor()(updatedValue)
        }
    }
}