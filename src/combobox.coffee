ko.bindingHandlers.comboboxSource=
    init:(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext)->
        $combobox=utils.component.initComponent(element,"combobox",allBindingsAccessor)
        options=$combobox.combobox('options')
        onLoadSuccess=options.onLoadSuccess
        options.onLoadSuccess=(datas)->
            source=valueAccessor()
            source(datas)
            onLoadSuccess?.apply($(element),arguments)
        utils.component.bindDisposeEvent(element,"combobox")
    update:(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext)->
        values = ko.utils.unwrapObservable(valueAccessor())
        $(element).combobox('loadData', values)

ko.bindingHandlers.comboboxValues =
    init:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"combobox",allBindingsAccessor)
        curValues=$(element).combobox('getValues') #修正初始化导致默认选中""的问题
        if utils.array.all(curValues,(item)->!item)
            $(element).combobox('setValues',[])
        values = valueAccessor()
        if not values()? or values().length is 0 #如果没有默认值，则初始化为当前combobox的值
            curValues=$(element).combobox('getValues')
            values(curValues)
        options = $(element).combobox('options')
        options.multiple=true
        refreshValueFun=(oriFun)->
            ()->
                curValues=$(element).combobox('getValues')
                values(curValues)
                oriFun?.apply($(element), arguments)
        options.onSelect=refreshValueFun(options.onSelect)
        options.onUnselect=refreshValueFun(options.onUnselect)
        utils.component.bindDisposeEvent(element,"combobox")
    update:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        values = ko.utils.unwrapObservable(valueAccessor())
        $(element).combobox('setValues', values)

ko.bindingHandlers.comboboxValue =
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"combobox",allBindingsAccessor)
        value = valueAccessor()
        if not value()? #如果没有默认值，则初始化为当前combobox的值
            curValue=$(element).combobox('getValue')
            value(curValue) if curValue
        options = $(element).combobox('options')
        options.multiple=false
        refreshValueFun=(oriFun)->
            ()->
                value($(element).combobox('getValue'))
                oriFun?.apply($(element), arguments)
        options.onSelect=refreshValueFun(options.onSelect)
        options.onUnselect=refreshValueFun(options.onUnselect)
        utils.component.bindDisposeEvent(element,"combobox")
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
        value = ko.utils.unwrapObservable(valueAccessor())
        if $(element).combobox('getValue')!=value
            $(element).combobox('setValue', value)