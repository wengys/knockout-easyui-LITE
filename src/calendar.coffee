ko.bindingHandlers.calendarValue =
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"calendar",allBindingsAccessor)
        options = $(element).calendar('options')
        value = valueAccessor()
        if not value()? #如果没有默认值，则初始化为当前calendar的值
            curValue=options.current
            value(curValue) if curValue
        refreshValueFun=(oriFun)->
            ()->
                value(options.current)
                oriFun?.apply($(element), arguments)
        options.onSelect=refreshValueFun(options.onSelect)
        #utils.component.bindDisposeEvent(element,"calendar") #无destroy方法
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
        value = ko.utils.unwrapObservable(valueAccessor())
        if $(element).calendar('options').current!=value
            $(element).calendar('moveTo', value)