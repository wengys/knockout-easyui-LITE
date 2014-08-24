#已知问题：多选模式下每次选择都会导致所有已选择项目的onSelect事件被触发
(()->
    bindDatagridDisposeEvent=(element)->
        ko.utils.domNodeDisposal.addDisposeCallback(element,
            ()->
                if utils.component.checkComponentInited(element,"datagrid")
                    $(element).data("datagrid",null) #清理datagrid留下的垃圾数据，其实没写也不影响
            )
    getIdField=(element)->
        $(element).datagrid('options').idField ? 'id'
    ko.bindingHandlers.datagridSource =
        init:(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext)->
            $datagrid=utils.component.initComponent(element,"datagrid",allBindingsAccessor)
            options=$datagrid.datagrid('options')
            onLoadSuccess=options.onLoadSuccess
            options.onLoadSuccess=(datas)->
                source=valueAccessor()
                source(datas.rows)
                onLoadSuccess?.apply($(element),arguments)
            #utils.component.bindDisposeEvent(element,"datagrid") #datagrid没有destroy方法
            bindDatagridDisposeEvent(element)
        update:(element,valueAccessor,allBindingsAccessor,viewModel,bindingContext)->
            values = ko.utils.unwrapObservable(valueAccessor())
            $(element).datagrid('loadData', values)
    
    ko.bindingHandlers.datagridValues =
        init:  (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
            utils.component.ensureComponentInited(element,"datagrid",allBindingsAccessor,{singleSelect:false})
            idField = getIdField(element)
            values=valueAccessor()
            if not values()? and values().length is 0
                curValues=utils.array.clone($(element).datagrid('getSelections'))
                values(curValues)
            options=$(element).datagrid('options')
            options.singleSelect = false
            refreshValueFun=(oriFun)->
                ()->
                    selections=$(element).datagrid('getSelections')
                    if not utils.array.sequenceEqual(values(),selections,(item)->item[idField])
                        values(utils.array.clone(selections))
                    oriFun?.apply($(element), arguments)
            options.onSelect=refreshValueFun(options.onSelect)
            options.onUnselect=refreshValueFun(options.onUnselect)
            options.onSelectAll=refreshValueFun(options.onSelectAll)
            options.onUnselectAll=refreshValueFun(options.onUnselectAll)
            bindDatagridDisposeEvent(element)
        update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
            idField = getIdField(element)
            values = ko.utils.unwrapObservable(valueAccessor())
            options=$(element).datagrid('options')
            if values? and values.length>0
                data = $(element).datagrid('getData')
                selectedRows=[]
                invalidValueIndexs=[]
                for value,index in values
                    [rowIndex,item]=utils.array.findIndex(data.rows,(item)->item[idField]==value[idField])
                    if item!=value
                        if item?
                            values[index]=item
                        else
                            invalidValueIndexs.push(index)
                    if rowIndex?
                        selectedRows.push(rowIndex)
                for invalidIndex in invalidValueIndexs #移除无效的赋值
                    values.splice(index,1)
                onUnselectAll=options.onUnselectAll
                options.onUnselectAll=()->
                $(element).datagrid('unselectAll')
                options.onUnselectAll=onUnselectAll
                for selectedRow in selectedRows
                    $(element).datagrid('selectRow', selectedRow)
            else
                $(element).datagrid('unselectAll')
    
    ko.bindingHandlers.datagridValue =
        init:  (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
            utils.component.ensureComponentInited(element,"datagrid",allBindingsAccessor,{singleSelect:true})
            value=valueAccessor()
            if not value()?
                curValue=$(element).datagrid('getSelected')
                value(curValue)
            options=$(element).datagrid('options')
            options.singleSelect = true
            events={
                onSelect:options.onSelect,
                onUnselect:options.onUnselect,
                onSelectAll:options.onSelectAll,
                onUnselectAll:options.onUnselectAll
            }
            funName=""
            updateValFunc = utils.debounce(
                #由于选择事件触发前会先触发取消全部选择事件，需要以最后一个事件为准
                ()->
                    value($(element).datagrid('getSelected'))
                    events[funName]?.apply($(element),arguments)
                1)
            options.onSelect = ()->
                funName="onSelect"
                updateValFunc.apply(arguments)
            options.onUnselect = ()->
                funName="onUnselect"
                updateValFunc.apply(arguments)
            options.onSelectAll = ()->
                funName="onSelectAll"
                updateValFunc.apply(arguments)
            options.onUnselectAll = ()->
                funName="onUnselectAll"
                updateValFunc.apply(arguments)
            bindDatagridDisposeEvent(element)
        update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
            idField = getIdField(element)
            value = ko.utils.unwrapObservable(valueAccessor())
            options=$(element).datagrid('options')
            if value
                data = $(element).datagrid('getData')
                [rowIndex,item]=utils.array.findIndex(data.rows,(item)->item[idField]==value[idField])
                if item!=value #将value设置为同一个对象，实际上value赋值的时候只要给一个idField就够了
                    valueAccessor()(item)
                curValue=$(element).datagrid('getSelected')
                if curValue?[idField]==value[idField] #如果实际上没有修改，跳过
                    return
                if rowIndex? #解决selectRecord方法在特定情况下工作不正常的问题
                    $(element).datagrid('selectRow', rowIndex)
            else
                $(element).datagrid('unselectAll')
)()