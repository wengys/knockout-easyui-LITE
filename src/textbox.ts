/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["textboxValue"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "textbox", allBindingsAccessor)
        var value = valueAccessor()
        if (!value()) {
            value($(element)["textbox"]('getValue'))
        }
        var options = $(element)["textbox"]('options')
        var onChange = options.onChange
        options.onChange = function (newValue, oldValue) {
            value = valueAccessor()
            if (value() !== newValue) {
                value(newValue)
                utils.func.safeApply(onChange, $(element), arguments);
            }
        }
        utils.component.bindDisposeEvent(element, "textbox")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        $(element)["textbox"]('setValue', value)
    }
}