ko.bindingHandlers.sliderValue =
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"slider",allBindingsAccessor)
        value = valueAccessor()
        if not value()?
            value($(element).slider('getValue'))
        options = $(element).slider('options')
        onChange = options.onChange
        options.onChange = (newValue,oldValue)->
            value(newValue)
            onChange?.apply(this, arguments)
        utils.component.bindDisposeEvent(element,"slider")
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
        value = ko.utils.unwrapObservable(valueAccessor())
        if $(element).slider('getValue')!=value
            $(element).slider('setValue' , value)