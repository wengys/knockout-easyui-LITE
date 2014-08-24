ko.bindingHandlers.dateboxValue =
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"datebox",allBindingsAccessor)
        options = $(element).datebox('options')
        value = valueAccessor()
        if not value()? #如果没有默认值，则初始化为当前datebox的值
            curValue=$(element).datebox('getValue')
            value(curValue) if curValue
        refreshValueFun=(oriFun)->
            ()->
                value($(element).datebox('getValue'))
                oriFun?.apply($(element), arguments)
        options.onSelect=refreshValueFun(options.onSelect)
        utils.component.bindDisposeEvent(element,"datebox")
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
        value = ko.utils.unwrapObservable(valueAccessor())
        if $(element).datebox('getValue')!=value
            $(element).datebox('setValue', value)