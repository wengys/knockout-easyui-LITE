ko.bindingHandlers.numberSpinnerValue =
    init:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"numberspinner",allBindingsAccessor)
        value = valueAccessor()
        if not value()?
            value(parseFloat($(element).numberspinner('getValue')))
        options = $(element).numberbox('options')
        onChange = options.onChange
        options.onChange = (newValue,oldValue)->
            newValue=parseFloat(newValue)
            value = valueAccessor()
            if value() != newValue
                value(newValue)
                onChange?.apply($(element), arguments)
        utils.component.bindDisposeEvent(element,"numberspinner")
    update:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        value = ko.utils.unwrapObservable(valueAccessor())
        $(element).numberspinner('setValue', value)
        if $(element).numberspinner('getValue')
            $(element).removeClass("validatebox-invalid")
        else
            if($(element).numberspinner('options').required)
                $(element).addClass("validatebox-invalid")
        