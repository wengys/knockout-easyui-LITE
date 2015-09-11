/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

//已知问题：初始化单选 / 多选模式时可能会对服务器再次请求数据
ko.bindingHandlers["combotreeSource"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var $combotree = utils.component.initComponent(element, "combotree", allBindingsAccessor)
        var options = $combotree["combotree"]('options')
        var onLoadSuccess = options.onLoadSuccess
        options.onLoadSuccess = function (node, data) {
            var source = valueAccessor()
            var oriNodes = utils.tree.treeToArray(source() || [])
            var newNodes = utils.tree.treeToArray($(element)["combotree"]('tree').tree('getRoots'))
            //对比是否改变，防止递归。
            if (!utils.array.sequenceEqual(oriNodes, newNodes, utils.id)) {
                source(utils.tree.clone(data))
                if (onLoadSuccess) {
                    onLoadSuccess.apply($(element), arguments)
                }
            }
        }
        utils.component.bindDisposeEvent(element, "combotree")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var values = ko.utils.unwrapObservable(valueAccessor()) || [];
        var oriNodes = utils.tree.treeToArray($(element)["combotree"]('tree').tree('getRoots'))
        var newNodes = utils.tree.treeToArray(values)
        if (!utils.array.sequenceEqual(oriNodes, newNodes, utils.id)) {
            $(element)["combotree"]('loadData', utils.tree.clone(values))
        }
    }
}

ko.bindingHandlers["combotreeValues"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "combotree", allBindingsAccessor, { multiple: true })
        var curValues = $(element)["combotree"]('getValues') //修正初始化导致默认选中""的问题
        if (utils.array.all(curValues, (item) => !item)) {
            $(element)["combotree"]('setValues', [])
        }
        var values = valueAccessor()
        if (!values() || values().length === 0) { //如果没有默认值，则初始化为当前combobox的值
            curValues = $(element)["combogrid"]('getValues')
            if (curValues) {
                values(curValues)
            }
        }
        var refreshValueFun = (oriFun) =>
            function () {
                var newValueIds = $(element)["combotree"]('getValues')
                if (!utils.array.sequenceEqual(values(), newValueIds, utils.id)) {
                    values(newValueIds)
                    if (oriFun) {
                        oriFun.apply($(element), arguments)
                    }
                }
            }
        var options = $(element)["combotree"]('options')
        var comboOptions = $(element)["combo"]('options')
        if (options.multiple === false) {//由于需要显示复选框，所以需要重新初始化。
            options.onChange = refreshValueFun(options.onChange)
            options.multiple = true
            $(element)["combotree"](options)
        }
        else {
            comboOptions.onChange = refreshValueFun(comboOptions.onChange)
        }

        utils.component.bindDisposeEvent(element, "combotree")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var vs = ko.utils.unwrapObservable(valueAccessor())
        var values = (!!vs) ? utils.array.map(vs, utils.convertToString) : [];
        var oriValues = $(element)["combotree"]('getValues')
        //如果未修改，则不必更新
        if (values.length > 0) {
            if (!utils.array.sequenceEqual(oriValues, values, utils.id)) {
                $(element)["combotree"]('setValues', values)
            }
        }
        else {
            $(element)["combotree"]('clear')
        }
    }
}
ko.bindingHandlers["combotreeValue"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "combotree", allBindingsAccessor, { multiple: false })
        var value = valueAccessor()
        if (!value()) {//如果没有默认值，则初始化为当前combotree的值
            var curValue = $(element)["combogrid"]('getValue')
            if (curValue)
                value(curValue)
        }
        var refreshValueFun = (oriFun) =>
            function () {
                var newValue = $(element)["combotree"]('getValue')
                if (value !== newValue) {
                    value(newValue)
                    if (oriFun) {
                        oriFun.apply($(element), arguments)
                    }
                }
            }
        var options = $(element)["combotree"]('options')
        var comboOptions = $(element)["combo"]('options')
        if (options.multiple === true) {
            options.onChange = refreshValueFun(options.onChange)
            options.multiple = false
            $(element)["combotree"](options)
        }
        else {
            comboOptions.onChange = refreshValueFun(comboOptions.onChange)
        }
        utils.component.bindDisposeEvent(element, "combotree")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        var oriValue = $(element)["combotree"]('getValue')
        //如果未修改，则不必更新
        if (value) {
            if (value !== oriValue) {
                $(element)["combotree"]('setValue', value)
            }
        }
        else {
            $(element)["combotree"]('clear')
        }
    }
}