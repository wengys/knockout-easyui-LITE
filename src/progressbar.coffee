ko.bindingHandlers.progressbarValue =
    init:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"progressbar",allBindingsAccessor)
        value = valueAccessor()
        if not value()?
            value($(element).progressbar('getValue'))
        options = $(element).progressbar('options')
        onChange = options.onChange
        options.onChange = (newValue,oldValue)->
            newValue=parseFloat(newValue)
            value = valueAccessor()
            if value() != newValue
                value(newValue)
                onChange?.apply(this, arguments)
        utils.component.bindDisposeEvent(element,"progressbar")
    update:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        value = ko.utils.unwrapObservable(valueAccessor())
        $(element).progressbar('setValue', value)
        updatedValue=$(element).progressbar('getValue')
        if value!=updatedValue
            valueAccessor()(updatedValue)
        