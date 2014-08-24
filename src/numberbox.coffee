ko.bindingHandlers.numberBoxValue =
    init:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"numberbox",allBindingsAccessor)
        value = valueAccessor()
        if not value()?
            value(parseFloat($(element).numberbox('getValue')))
        options = $(element).numberbox('options')
        onChange = options.onChange
        options.onChange = (newValue,oldValue)->
            newValue=parseFloat(newValue)
            value = valueAccessor()
            if value() != newValue
                value(newValue)
                onChange?.apply($(element), arguments)
        utils.component.bindDisposeEvent(element,"numberbox")
    update:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        value = ko.utils.unwrapObservable(valueAccessor())
        $(element).numberbox('setValue', value)
        if $(element).numberbox('getValue') #修改样式，保持显示逻辑一致性
            $(element).removeClass("validatebox-invalid")
        else
            if($(element).numberbox('options').required)
                $(element).addClass("validatebox-invalid")