ko.bindingHandlers.easyuiOptions =
    init:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->

    update:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        
utils=
    component:
        #检查easyui组件是否已创建
        checkComponentInited:(element,componentTypeName)->
            return $.data(element, componentTypeName)?
        #使用easyuiOptions绑定的设置初始化easyui组件
        initComponent:(element,componentTypeName,allBindingsAccessor,extOptions=null)->
            allBindings=allBindingsAccessor()
            options=allBindings['easyuiOptions'] || {}
            if utils.isFunction(options)
                options=options()
            if extOptions
                $.extend(options, extOptions)
            $(element)[componentTypeName](options)
        ensureComponentInited:(element,componentTypeName,allBindingsAccessor,extOptions=null)->
            if not utils.component.checkComponentInited(element,componentTypeName)
                utils.component.initComponent(element,componentTypeName,allBindingsAccessor,extOptions)
        bindDisposeEvent:(element,componentTypeName)->
            ko.utils.domNodeDisposal.addDisposeCallback(element,
                ()->
                    if utils.component.checkComponentInited(element,componentTypeName)
                        $(element)[componentTypeName]('destroy')
                )

    array:
        all:(source,predictor)->
            for item in source
                if not predictor(item)
                    return false
            return true
        any:(source,predictor)->
            for item in source
                if predictor(item)
                    return true
            return false
        map:(source,mapper)->
            ret=[]
            for item,index in source
                ret.push(mapper(item,index,source))
            return ret
        sequenceEqual:(source,target,idSelector)->
            sourceIds=utils.array.map(source,idSelector)
            targetIds=utils.array.map(target,idSelector)
            diff=ko.utils.compareArrays(sourceIds,targetIds)
            return !utils.array.any(diff,(item)->item.hasOwnProperty('index'))
        clone:(seq,alsoCloneItem)->
            itemSelector=utils.identity
            if alsoCloneItem
                itemSelector=(item)->ko.utils.extend({},item)
            itemSelector(item) for item in seq
        findIndex:(seq,predictor)->
            for item,index in seq
                if predictor(item)
                    return [index,item]
            return [null,null]
        filter:(seq,predictor)->
            item for item in seq when predictor(item)
    tree:
        treeToNodes:(tree)->
            tmpNodes=[]
            innerTreeToNodes=(nodes)->
                for node in nodes
                    tmpNodes.push(node)
                    children=node['children']
                    if children
                        innerTreeToNodes(children)
            innerTreeToNodes(tree)
            tmpNodes
        clone:(tree)->
            innerClone=(nodes)->
                clonedTree=[]
                for node in nodes
                    clonedNode={ #tree 只支持以下属性
                        id:node.id,
                        text:node.text,
                        state:node.state,
                        checked:node.checked,
                        attributes:node.attributes,
                        children:node.children
                    }
                    if clonedNode.children
                        clonedNode.children=innerClone(clonedNode.children)
                    clonedTree.push(clonedNode)
                clonedTree
            innerClone(tree)

    isFunction:(obj)->
        typeof obj == 'function'

    identity:(obj)->
        obj

    convertToString:(value)->
        if value
            return value+''
        else
            return ''

    now:Date.now || ()-> return new Date().getTime()

    debounce:(func, wait, immediate)->#此方法从underscore复制而来
        timeout=args=context=timestamp=result=null
        later = ()->
            last = utils.now()-timestamp
            if (last < wait)
                timeout = setTimeout(later, wait-last)
            else
                timeout = null
            if not immediate
                result = func.apply(context, args)
                context = args = null
        return ()->
            context = this
            args = arguments
            timestamp = utils.now()
            callNow = immediate && !timeout
            if not timeout
                timeout = setTimeout(later, wait)
            if callNow
                result = func.apply(context, args)
                context = args = null
            return result
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
ko.bindingHandlers.numberSpinnerValue =
    init:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        utils.component.ensureComponentInited(element,"numberspinner",allBindingsAccessor)
        value = valueAccessor()
        if not value()?
            value(parseFloat($(element).numberspinner('getValue')))
        options = $(element).numberbox('options')
        onChange = options.onChange
        options.onChange = (newValue,oldValue)->
            newValue=parseFloat(newValue)
            value = valueAccessor()
            if value() != newValue
                value(newValue)
                onChange?.apply($(element), arguments)
        utils.component.bindDisposeEvent(element,"numberspinner")
    update:(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)->
        value = ko.utils.unwrapObservable(valueAccessor())
        $(element).numberspinner('setValue', value)
        if $(element).numberspinner('getValue')
            $(element).removeClass("validatebox-invalid")
        else
            if($(element).numberspinner('options').required)
                $(element).addClass("validatebox-invalid")
        
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