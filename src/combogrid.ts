ko.bindingHandlers["combogridSource"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var $combogrid = utils.component.initComponent(element, "combogrid", allBindingsAccessor)
        var options = $combogrid["combogrid"]('options')
        var onLoadSuccess = options.onLoadSuccess
        options.onLoadSuccess = function (data) {
            var source = valueAccessor()
            source(data.rows)
            if (onLoadSuccess) {
                onLoadSuccess.apply($(element), arguments)
            }
            utils.component.bindDisposeEvent(element, "combogrid")
        }
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var values = ko.utils.unwrapObservable(valueAccessor())
        var options = $(element)["combogrid"]("options")
        var idSelector = (item) => item[options.idField]
        var currentValues = $(element)["combogrid"]('grid').datagrid('getData').rows
        if (!utils.array.sequenceEqual(currentValues, values, idSelector))
            $(element)["combogrid"]('grid').datagrid('loadData', values)
    }
}

ko.bindingHandlers["combogridValues"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "combogrid", allBindingsAccessor, { multiple: true })
        var curValues = $(element)["combogrid"]('getValues') //修正初始化导致默认选中""的问题
        if (utils.array.all(curValues, (item) => !item)) {
            $(element)["combogrid"]('setValues', [])
        }
        var values = valueAccessor()
        if (!values() || values().length === 0) { //如果没有默认值，则初始化为当前combobox的值
            curValues = $(element)["combogrid"]('getValues')
            if (curValues) {
                values(curValues)
            }
        }
        var $grid = $(element)["combogrid"]("grid")
        var options = $(element)["combogrid"]('options')
        var gridOptions = $grid.datagrid('options')
        var comboOptions = $(element)["combo"]("options")
        options.multiple = true
        gridOptions.singleSelect = false //这个不设置的话无效，其实上面那个反而没作用
        var refreshValueFun = (oriFun) =>
            function () {
                var newValueIds = $(element)["combogrid"]('getValues')
                if (!utils.array.sequenceEqual(values(), newValueIds, utils.id)) {
                    values(newValueIds)
                    if (oriFun) {
                        oriFun.apply($(element), arguments)
                    }
                }
            }
        comboOptions.onChange = refreshValueFun(comboOptions.onChange) //combogrid执行的是combo上的onChange
        utils.component.bindDisposeEvent(element, "combogrid")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        //var values = (utils.convertToString(v) for v in ko.utils.unwrapObservable(valueAccessor()))
        var values = utils.array.map(ko.utils.unwrapObservable(valueAccessor()), (v) => utils.convertToString(v))
        var oriValues = $(element)["combogrid"]('getValues')
        var options = $(element)["combogrid"]("options")
        //如果未修改，则不必更新
        if (values) {
            if (!utils.array.sequenceEqual(oriValues, values, utils.id))
                $(element)["combogrid"]('setValues', values)
        }
        else {
            $(element)["combogrid"]('clear')
        }
    }
}

ko.bindingHandlers["combogridValue"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "combogrid", allBindingsAccessor, { multiple: false })
        var value = valueAccessor()
        if (!value()) {
            var curValue = $(element)["combogrid"]('getValue')
            if (curValue)
                value(curValue)
        }
        var $grid = $(element)["combogrid"]("grid")
        var options = $(element)["combogrid"]('options')
        var gridOptions = $grid.datagrid('options')
        var comboOptions = $(element)["combo"]("options")
        options.multiple = false
        gridOptions.singleSelect = true //这个不设置的话无效，其实上面那个反而没作用
        var refreshValueFun = (oriFun) =>
            function () {
                var newValueId = $(element)["combogrid"]('getValue')
                if (value() !== newValueId) {
                    value(newValueId)
                    if (oriFun) {
                        oriFun.apply($(element), arguments)
                    }
                }
            }
        comboOptions.onChange = refreshValueFun(comboOptions.onChange)
        utils.component.bindDisposeEvent(element, "combogrid")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = utils.convertToString(ko.utils.unwrapObservable(valueAccessor()))
        var oriValue = $(element)["combogrid"]('getValue')
        var options = $(element)["combogrid"]("options")
        //如果未修改，则不必更新
        if (value) {
            if (oriValue !== value)
                $(element)["combogrid"]('setValue', value)
        }
        else {
            $(element)["combogrid"]('clear')
        }
    }
}