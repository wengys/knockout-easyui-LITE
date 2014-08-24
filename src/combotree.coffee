#已知问题：初始化单选/多选模式时可能会对服务器再次请求数据
ko.bindingHandlers.combotreeSource=
    init:(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext)->
        $combotree=utils.component.initComponent(element,"combotree",allBindingsAccessor)
        options=$combotree.combotree('options')
        onLoadSuccess=options.onLoadSuccess
        idSelector=(item)->item.id
        options.onLoadSuccess=(node,data)->
            source=valueAccessor()
            oriNodes=utils.tree.treeToNodes(source()||[])
            newNodes=utils.tree.treeToNodes($(element).combotree('tree').tree('getRoots'))
            #对比是否改变，防止递归。
            if not utils.array.sequenceEqual(oriNodes,newNodes,idSelector)
                source(utils.tree.clone(data))
                onLoadSuccess?.apply($(element),arguments)
        utils.component.bindDisposeEvent(element,"combotree")
    update:(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext)->
        idSelector=(item)->item.id
        values=ko.utils.unwrapObservable(valueAccessor())
        values=[] unless values?
        oriNodes=utils.tree.treeToNodes($(element).combotree('tree').tree('getRoots'))
        newNodes=utils.tree.treeToNodes(values)
        if not utils.array.sequenceEqual(oriNodes,newNodes,idSelector)
            $(element).combotree('loadData', utils.tree.clone(values))

ko.bindingHandlers.combotreeValues =
    init:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"combotree",allBindingsAccessor,{multiple:true})
        curValues=$(element).combotree('getValues') #修正初始化导致默认选中""的问题
        if utils.array.all(curValues,(item)->!item)
            $(element).combotree('setValues',[])
        values=valueAccessor()
        if not values()? or values().length is 0 #如果没有默认值，则初始化为当前combobox的值
            curValues=$(element).combogrid('getValues')
            values(curValues) if curValues
        refreshValueFun=(oriFun)->
            ()->
                newValueIds=$(element).combotree('getValues')
                values(newValueIds)
                oriFun?.apply($(element),arguments)
        options=$(element).combotree('options')
        comboOptions=$(element).combo('options')
        if options.multiple==false #由于需要显示复选框，所以需要重新初始化。
            options.onChange=refreshValueFun(options.onChange)
            options.multiple=true
            $(element).combotree(options)
        else
            comboOptions.onChange=refreshValueFun(comboOptions.onChange)
        utils.component.bindDisposeEvent(element,"combotree")
    update:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        vs=ko.utils.unwrapObservable(valueAccessor())
        values=
            if vs?
                (utils.convertToString(v) for v in vs)
            else
                []
        oriValues=$(element).combotree('getValues')
        #如果未修改，则不必更新
        if values.length>0
            if not utils.array.sequenceEqual(oriValues,values,utils.identity)
                $(element).combotree('setValues', values)
        else
            $(element).combotree('clear')

ko.bindingHandlers.combotreeValue =
    init:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"combotree",allBindingsAccessor,{multiple:false})
        value=valueAccessor()
        if not value()? #如果没有默认值，则初始化为当前combotree的值
            curValue=$(element).combogrid('getValue')
            value(curValue) if curValue
        refreshValueFun=(oriFun)->
            ()->
                newValue=$(element).combotree('getValue')
                value(newValue)
                oriFun?.apply($(element),arguments)
        options=$(element).combotree('options')
        comboOptions=$(element).combo('options')
        if options.multiple==true
            options.onChange=refreshValueFun(options.onChange)
            options.multiple=false
            $(element).combotree(options)
        else
            comboOptions.onChange=refreshValueFun(comboOptions.onChange)
        utils.component.bindDisposeEvent(element,"combotree")
    update:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        value = ko.utils.unwrapObservable(valueAccessor())
        oriValue=$(element).combotree('getValue')
        #如果未修改，则不必更新
        if value?
            if value!=oriValue
                $(element).combotree('setValue', value)
        else
            $(element).combotree('clear')
