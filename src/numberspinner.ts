/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["numberspinnerValue"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "numberspinner", allBindingsAccessor)
        var value = valueAccessor()
        if (!value()) {
            value(parseFloat($(element)["numberspinner"]('getValue')))
        }
        var easyuiAccessor = ($(element)["textbox"] || ($(element)["numberbox"]));//1.3.6与1.4之间有兼容性问题
        var options = easyuiAccessor.call($(element), 'options')
        var onChange = options.onChange
        options.onChange = function (newValue, oldValue) {
            newValue = parseFloat(newValue)
            value = valueAccessor()
            if (value() != newValue) {
                value(newValue)
                utils.func.safeApply(onChange, $(element), arguments);
            }
        }
        utils.component.bindDisposeEvent(element, "numberspinner")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        $(element)["numberspinner"]('setValue', value)
        var newActualValue = $(element)["numberspinner"]('getValue')
        if (newActualValue) {
            $(element).removeClass("validatebox-invalid")
            if (newActualValue != value) {
                valueAccessor()(parseFloat(newActualValue))
            }
        }
        else {
            if ($(element)["numberspinner"]('options').required)
                $(element).addClass("validatebox-invalid")
        }
    }
}