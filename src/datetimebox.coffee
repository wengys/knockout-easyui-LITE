ko.bindingHandlers.datetimeboxValue =
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"datetimebox",allBindingsAccessor)
        options = $(element).datetimebox('options')
        value = valueAccessor()
        if not value()? #如果没有默认值，则初始化为当前datetimebox的值
            curValue=$(element).datetimebox('getValue')
            value(curValue) if curValue
        refreshValueFun=(oriFun)->
            ()->
                value($(element).datetimebox('getValue'))
                oriFun?.apply($(element), arguments)
        options.onSelect=refreshValueFun(options.onSelect)
        utils.component.bindDisposeEvent(element,"datetimebox")
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
        value = ko.utils.unwrapObservable(valueAccessor())
        if $(element).datetimebox('getValue')!=value
            $(element).datetimebox('setValue', value)