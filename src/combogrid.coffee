ko.bindingHandlers.combogridSource=
    init:(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext)->
        $combogrid=utils.component.initComponent(element,"combogrid",allBindingsAccessor)
        options=$combogrid.combogrid('options')
        onLoadSuccess=options.onLoadSuccess
        options.onLoadSuccess=(data)->
            source=valueAccessor()
            source(data.rows)
            onLoadSuccess?.apply($(element),arguments)
        utils.component.bindDisposeEvent(element,"combogrid")
    update:(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext)->
        values = ko.utils.unwrapObservable(valueAccessor())
        options=$(element).combogrid("options")
        idSelector=(item)->item[options.idField]
        currentValues=$(element).combogrid('grid').datagrid('getData').rows
        if utils.array.sequenceEqual(currentValues,values,idSelector)
            $(element).combogrid('grid').datagrid('loadData', values)

ko.bindingHandlers.combogridValues =
    init:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"combogrid",allBindingsAccessor,{multiple:true})
        values = valueAccessor()
        if not values()? or values().length is 0 #如果没有默认值，则初始化为当前combobox的值
            curValues=$(element).combogrid('getValues')
            values(curValues) if curValues
        $grid=$(element).combogrid("grid")
        options=$(element).combogrid('options')
        gridOptions=$grid.datagrid('options')
        comboOptions=$(element).combo("options")
        options.multiple=true
        gridOptions.singleSelect=false #这个不设置的话无效，其实上面那个反而没作用
        refreshValueFun=(oriFun)->
            ()->
                newValueIds=$(element).combogrid('getValues')
                values(newValueIds)
                oriFun?.apply($(element),arguments)
        comboOptions.onChange=refreshValueFun(comboOptions.onChange) #combogrid执行的是combo上的onChange
        utils.component.bindDisposeEvent(element,"combogrid")
    update:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        values=(utils.convertToString(v) for v in ko.utils.unwrapObservable(valueAccessor()))
        oriValues=$(element).combogrid('getValues')
        options=$(element).combogrid("options")
        #如果未修改，则不必更新
        if values?
            if not utils.array.sequenceEqual(oriValues,values,utils.identity)
                $(element).combogrid('setValues', values)
        else
            $(element).combogrid('clear')

ko.bindingHandlers.combogridValue =
    init:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"combogrid",allBindingsAccessor,{multiple:false})
        value=valueAccessor()
        if not value()?
            curValue=$(element).combogrid('getValue')
            value(curValue) if curValue
        $grid=$(element).combogrid("grid")
        options=$(element).combogrid('options')
        gridOptions=$grid.datagrid('options')
        comboOptions=$(element).combo("options")
        options.multiple=false
        gridOptions.singleSelect=true #这个不设置的话无效，其实上面那个反而没作用
        refreshValueFun=(oriFun)->
            ()->
                newValueId=$(element).combogrid('getValue')
                value(newValueId)
                oriFun?.apply($(element),arguments)
        comboOptions.onChange=refreshValueFun(comboOptions.onChange)
        utils.component.bindDisposeEvent(element,"combogrid")
    update:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        value=utils.convertToString(ko.utils.unwrapObservable(valueAccessor()))
        oriValue=$(element).combogrid('getValue')
        options=$(element).combogrid("options")
        #如果未修改，则不必更新
        if value?
            if oriValue!=value
                $(element).combogrid('setValue', value)
        else
            $(element).combogrid('clear')