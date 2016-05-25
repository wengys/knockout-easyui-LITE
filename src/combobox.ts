ko.bindingHandlers["comboboxSource"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var $combobox = utils.component.initComponent(element, "combobox", allBindingsAccessor)
        var options = $combobox["combobox"]('options')
        var onLoadSuccess: Function = options.onLoadSuccess
        options.onLoadSuccess = function (datas) {
            var source = valueAccessor()
            source(datas)
            if (onLoadSuccess) {
                onLoadSuccess.apply($(element), arguments)
            }
        }
        utils.component.bindDisposeEvent(element, "combobox")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var values = ko.utils.unwrapObservable(valueAccessor())
        $(element)["combobox"]('loadData', values)
    }
}
ko.bindingHandlers["comboboxValues"] = {
    init: (element: Element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "combobox", allBindingsAccessor)
        var curValues = $(element)["combobox"]('getValues') //修正初始化导致默认选中""的问题
        if (utils.array.all(curValues, (item) => !item)) {
            $(element)["combobox"]('setValues', [])
        }
        var values = valueAccessor();
        if (!values() || values().length === 0) {//如果没有默认值，则初始化为当前combobox的值
            curValues = $(element)["combobox"]('getValues')
            values(curValues)
        }
        var options = $(element)["combobox"]('options')
        options.multiple = true

        var refreshValueFun = (oriFun) =>
            function () {
                curValues = $(element)["combobox"]('getValues')
                values(curValues)
                if (oriFun)
                    oriFun.apply($(element), arguments)
            }
        options.onSelect = refreshValueFun(options.onSelect)
        options.onUnselect = refreshValueFun(options.onUnselect)
        utils.component.bindDisposeEvent(element, "combobox")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var values = ko.utils.unwrapObservable(valueAccessor())
        $(element)["combobox"]('setValues', values)
    }
}
ko.bindingHandlers["comboboxValue"] = {
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "combobox", allBindingsAccessor)
        var value = valueAccessor()
        if (!value()) {//如果没有默认值，则初始化为当前combobox的值
            var curValue = $(element)["combobox"]('getValue')
            if (curValue) {
                value(curValue)
            }
        }
        var options = $(element)["combobox"]('options')
        options.multiple = false
        var refreshValueFun = (oriFun) =>
            function () {
                value($(element)["combobox"]('getValue'))
                if (oriFun)
                    oriFun.apply($(element), arguments)
            }
        options.onSelect = refreshValueFun(options.onSelect)
        options.onUnselect = refreshValueFun(options.onUnselect)
        utils.component.bindDisposeEvent(element, "combobox")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        if ($(element)["combobox"]('getValue') !== value)
            $(element)["combobox"]('setValue', value)
    }
}
ko.bindingHandlers["comboboxText"] = {
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "combobox", allBindingsAccessor)
        var value = valueAccessor()
        if (!value()) {//如果没有默认值，则初始化为当前combobox的值
            var curValue = $(element)["combobox"]('getText')
            if (curValue) {
                value(curValue)
            }
        }
        var options = $(element)["combobox"]('options')
        var comboOptions = $(element)["combo"]('options')
        options.multiple = false
        var refreshValueFun = (oriFun) =>
            function () {
                setTimeout(()=>{
                    var combo = $.data(element).combo;
                    if(combo.hasOwnProperty('previousText')){ //兼容1.3与1.4
                        value(combo.previousText)
                    } else {
                        value($.data(element).combo.previousValue)
                    }
                },1)
                if (oriFun)
                    oriFun.apply($(element), arguments)
            }
        comboOptions.onChange = refreshValueFun(comboOptions.onChange)
        utils.component.bindDisposeEvent(element, "combobox")
    },
    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        var value = ko.utils.unwrapObservable(valueAccessor())
        if ($(element)["combobox"]('getText') !== value)
            $(element)["combobox"]('setText', value)
    }
}