/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

//已知问题：多选模式下每次选择都会导致所有已选择项目的onSelect事件被触发
(function () {
    var bindDatagridDisposeEvent = (element) => {
        ko.utils.domNodeDisposal.addDisposeCallback(element,
            () => {
                if (utils.component.checkComponentInited(element, "datagrid")) {
                    $(element).data("datagrid", null) //清理datagrid留下的垃圾数据，其实没写也不影响
                }
            })
    }
    var getIdField = (element) => $(element)["datagrid"]('options').idField || 'id';
    ko.bindingHandlers["datagridSource"] = <KnockoutBindingHandler>{
        init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
            var $datagrid = utils.component.initComponent(element, "datagrid", allBindingsAccessor)
            var options = $datagrid["datagrid"]('options')
            var onLoadSuccess = options.onLoadSuccess
            options.onLoadSuccess = function (datas) {
                var value = valueAccessor()
                value(datas.rows)
                utils.func.safeApply(onLoadSuccess, $(element), arguments);
            }
            bindDatagridDisposeEvent(element)
        },
        update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
            var values = ko.utils.unwrapObservable(valueAccessor())
            $(element)["datagrid"]('loadData', values)
        }
    }
    ko.bindingHandlers["datagridValues"] = <KnockoutBindingHandler>{
        init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
            utils.component.ensureComponentInited(element, "datagrid", allBindingsAccessor, { singleSelect: false })
            var idField = getIdField(element)
            var values = valueAccessor()
            if (values() && values().length > 0) {
                var curValues = utils.array.clone($(element)["datagrid"]('getSelections'))
                values(curValues)
            }
            var options = $(element)["datagrid"]('options')
            options.singleSelect = false
            var refreshValueFun = (oriFun) =>
                function () {
                    var selections = $(element)["datagrid"]('getSelections')
                    if (!utils.array.sequenceEqual(values(), selections, (item) => item[idField])) {
                        values(utils.array.clone(selections))
                        utils.func.safeApply(oriFun, $(element), arguments)
                    }
                }
            options.onSelect = refreshValueFun(options.onSelect)
            options.onUnselect = refreshValueFun(options.onUnselect)
            options.onSelectAll = refreshValueFun(options.onSelectAll)
            options.onUnselectAll = refreshValueFun(options.onUnselectAll)
            bindDatagridDisposeEvent(element)
        },
        update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
            var idField = getIdField(element)
            var values = ko.utils.unwrapObservable(valueAccessor())
            var options = $(element)["datagrid"]('options')
            if (values && values.length > 0) {
                var data = $(element)["datagrid"]('getData')
                var selectedRows = []
                var invalidValueIndexs = []
                utils.array.each(values, (value, index, vs) => {//找到未选中条目，或已删除条目
                    var [rowIndex, item] = utils.array.findIndexTuple(data.rows, (item) => item[idField] == value[idField])
                    if (item !== value) {
                        if (item) {//如果只有id相同，则同步为datagrid中的版本
                            values[index] = item
                        } else {//如果没有找到，则表明此条已删除
                            invalidValueIndexs.push(index)
                        }
                    }
                    if (rowIndex >= 0) {
                        selectedRows.push(rowIndex)
                    }
                })
                utils.array.each(invalidValueIndexs, (invalidIndex) => {//移除source中已删除的条目
                    values.splice(invalidIndex, 1);
                })

                var onUnselectAll = options.onUnselectAll
                var onSelect = options.onSelect
                options.onUnselectAll = options.onSelect = () => { }//防止无意义的事件触发
                $(element)["datagrid"]('unselectAll')
                utils.array.each(selectedRows, (selectedRow) => {
                    $(element)["datagrid"]('selectRow', selectedRow)
                })
                options.onUnselectAll = onUnselectAll
                options.onSelect = onSelect;
            }
            else {
                $(element)["datagrid"]('unselectAll')
            }
        }
    }
    ko.bindingHandlers["datagridValue"] = <KnockoutBindingHandler>{
        init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
            utils.component.ensureComponentInited(element, "datagrid", allBindingsAccessor, { singleSelect: true })
            var idField = getIdField(element)
            var value = valueAccessor()
            if (value()) {
                var curValue = $(element)["datagrid"]('getSelected')
                value(curValue)
            }
            var options = $(element)["datagrid"]('options')
            options.singleSelect = true
            var refreshValueFun = (oriFun) =>
                function () {
                    var selected = $(element)["datagrid"]('getSelected')
                    if (selected !== value()) {
                        value(selected);
                    }
                    utils.func.safeApply(oriFun, $(element), arguments)
                }
            var unselectAllValueFun = (oriFun) =>
                function () {
                    value(null)
                    utils.func.safeApply(oriFun, $(element), arguments)
                }
            var selectAllValueFun = (oriFun) =>
                function () {
                    var data = $(element)["datagrid"]('getData')
                    value(data.rows)
                    utils.func.safeApply(oriFun, $(element), arguments)
                }
            options.onSelect = refreshValueFun(options.onSelect)
            options.onUnselect = refreshValueFun(options.onUnselect)
            options.onSelectAll = selectAllValueFun(options.onSelectAll)
            options.onUnselectAll = unselectAllValueFun(options.onUnselectAll)
            bindDatagridDisposeEvent(element)
        },
        update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
            var idField = getIdField(element)
            var value = valueAccessor()
            var options = $(element)["datagrid"]('options')
            if (value()) {
                if (utils.object.isArray(value()))//selectAll
                    return
                var curValue = $(element)["datagrid"]('getSelected')
                if (curValue) {
                    if (curValue[idField] === value()[idField]) { //如果实际上没有修改，跳过
                        if (curValue !== value()) {//将value设置为同一个对象
                            value(curValue)
                        }
                        return;
                    }
                }

                var data = $(element)["datagrid"]('getData')
                var [rowIndex, item] = utils.array.findIndexTuple(data.rows, (item) => item[idField] === value()[idField])
                if (rowIndex < 0) {//无对应条目
                    value(null);
                } else {
                    $(element)["datagrid"]('selectRow', rowIndex)//解决selectRecord方法在特定情况下工作不正常的问题
                }
            }
            else {
                $(element)["datagrid"]('unselectAll')
            }
        }
    }
})()