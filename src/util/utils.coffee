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