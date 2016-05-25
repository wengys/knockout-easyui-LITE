ko.bindingHandlers["easyuiOptions"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) { },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) { },
    easyuiOptionsVersion: '0.6.1'
};

var utils;
(function (utils) {
    var object;
    (function (object) {
        object.isFunction = function (obj) { return typeof obj === 'function'; };
        object.isNull = function (obj) {
            return obj === null;
        };
        object.isUndefined = function (obj) {
            return obj === void 0;
        };
        var property = function (key) {
            return function (obj) {
                return obj == null ? void 0 : obj[key];
            };
        };
        var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
        var getLength = property('length');
        object.isArray = function (collection) {
            var length = getLength(collection);
            return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
        };
    })(object = utils.object || (utils.object = {}));
    var array;
    (function (array) {
        array.each = function (source, action) {
            var i = 0, sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                action(source[i], i, source);
            }
        };
        array.all = function (source, predictor) {
            var i = 0, sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                if (!predictor(source[i])) {
                    return false;
                }
            }
            return true;
        };
        array.any = function (source, predictor) {
            var i = 0, sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                if (predictor(source[i])) {
                    return true;
                }
            }
            return false;
        };
        array.map = function (source, mapper) {
            var ret = Array(), i;
            var sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                ret[i] = mapper(source[i]);
            }
            return ret;
        };
        array.findIndex = function (source, predictor) {
            var i, sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                if (predictor(source[i])) {
                    return i;
                }
            }
            return -1;
        };
        array.findIndexTuple = function (source, predictor) {
            var i, sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                if (predictor(source[i])) {
                    return [i, source[i]];
                }
            }
            return [-1, null];
        };
        array.filter = function (source, predictor) {
            var ret = Array(), i;
            var sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                if (predictor(source[i])) {
                    ret.push(source[i]);
                }
            }
            return ret;
        };
        array.clone = function (source) {
            return array.map(source, utils.id);
        };
        array.sequenceEqual = function (source, target, idSelector) {
            var sourceIds = utils.array.map(source, idSelector);
            var targetIds = utils.array.map(target, idSelector);
            var diff = ko.utils.compareArrays(sourceIds, targetIds);
            return !utils.array.any(diff, function (item) { return item.hasOwnProperty('index'); });
        };
    })(array = utils.array || (utils.array = {}));
    var component;
    (function (component) {
        component.checkComponentInited = function (element, componentTypeName) {
            return !!$.data(element, componentTypeName);
        };
        component.initComponent = function (element, componentTypeName, allBindingsAccessor, extOptions) {
            var allBindings = allBindingsAccessor();
            var options = allBindings['easyuiOptions'] || {};
            if (object.isFunction(options)) {
                options = options();
            }
            if (extOptions) {
                $.extend(options, extOptions);
            }
            $(element)[componentTypeName](options);
            return $(element);
        };
        component.ensureComponentInited = function (element, componentTypeName, allBindingsAccessor, extOptions) {
            if (!component.checkComponentInited(element, componentTypeName)) {
                component.initComponent(element, componentTypeName, allBindingsAccessor, extOptions);
            }
        };
        component.bindDisposeEvent = function (element, componentTypeName) {
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (component.checkComponentInited(element, componentTypeName)) {
                    $(element)[componentTypeName]('destroy');
                }
            });
        };
    })(component = utils.component || (utils.component = {}));
    var tree;
    (function (tree_1) {
        tree_1.treeToArray = function (tree) {
            var tmpNodes = Array();
            var innerTreeToNodes = function (nodes) {
                array.each(nodes, function (node) {
                    tmpNodes.push(node);
                    if (node.children) {
                        innerTreeToNodes(node.children);
                    }
                });
            };
            innerTreeToNodes(tree);
            return tmpNodes;
        };
        tree_1.clone = function (tree) {
            var innerClone = function (nodes) {
                var clonedTree = array.map(nodes, function (node) {
                    var clonedNode = {
                        id: node.id,
                        text: node.text,
                        state: node.state,
                        checked: node.checked,
                        attributes: node.attributes,
                        children: null
                    };
                    if (node.children)
                        clonedNode.children = innerClone(node.children);
                    else {
                        clonedNode.children = [];
                    }
                    return clonedNode;
                });
                return clonedTree;
            };
            return innerClone(tree);
        };
    })(tree = utils.tree || (utils.tree = {}));
    var func;
    (function (func_1) {
        func_1.debounce = function (func, wait, immediate) {
            var timeout;
            var args;
            var context;
            var timestamp;
            var result;
            var later = function () {
                var last = utils.now() - timestamp;
                if (last < wait && last >= 0)
                    timeout = setTimeout(later, wait - last);
                else
                    timeout = 0;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout)
                        context = args = null;
                }
            };
            return function () {
                context = this;
                args = arguments;
                timestamp = utils.now();
                var callNow = immediate && !timeout;
                if (!timeout) {
                    timeout = setTimeout(later, wait);
                }
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }
                return result;
            };
        };
        func_1.safeApply = function (func, context) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (object.isFunction(func)) {
                func.apply(context, args);
            }
        };
    })(func = utils.func || (utils.func = {}));
    utils.convertToString = function (value) {
        if (!(object.isNull(value) || object.isUndefined(value)))
            return value + '';
        else
            return '';
    };
    utils.now = Date.now || (function () { return new Date().getTime(); });
    utils.id = function (item) { return item; };
})(utils || (utils = {}));

ko.bindingHandlers["calendarValue"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "calendar", allBindingsAccessor);
        var options = $(element)["calendar"]('options');
        var value = valueAccessor();
        if (!value()) {
            var curValue = options.current;
            if (curValue) {
                value(curValue);
            }
        }
        var refreshValueFun = function (oriFun) {
            return function () {
                value(options.current);
                if (oriFun) {
                    oriFun.apply($(element), arguments);
                }
            };
        };
        options.onSelect = refreshValueFun(options.onSelect);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if ($(element)["calendar"]('options').current !== value)
            $(element)["calendar"]('moveTo', value);
    }
};

ko.bindingHandlers["comboboxSource"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $combobox = utils.component.initComponent(element, "combobox", allBindingsAccessor);
        var options = $combobox["combobox"]('options');
        var onLoadSuccess = options.onLoadSuccess;
        options.onLoadSuccess = function (datas) {
            var source = valueAccessor();
            source(datas);
            if (onLoadSuccess) {
                onLoadSuccess.apply($(element), arguments);
            }
        };
        utils.component.bindDisposeEvent(element, "combobox");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var values = ko.utils.unwrapObservable(valueAccessor());
        $(element)["combobox"]('loadData', values);
    }
};
ko.bindingHandlers["comboboxValues"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "combobox", allBindingsAccessor);
        var curValues = $(element)["combobox"]('getValues');
        if (utils.array.all(curValues, function (item) { return !item; })) {
            $(element)["combobox"]('setValues', []);
        }
        var values = valueAccessor();
        if (!values() || values().length === 0) {
            curValues = $(element)["combobox"]('getValues');
            values(curValues);
        }
        var options = $(element)["combobox"]('options');
        options.multiple = true;
        var refreshValueFun = function (oriFun) {
            return function () {
                curValues = $(element)["combobox"]('getValues');
                values(curValues);
                if (oriFun)
                    oriFun.apply($(element), arguments);
            };
        };
        options.onSelect = refreshValueFun(options.onSelect);
        options.onUnselect = refreshValueFun(options.onUnselect);
        utils.component.bindDisposeEvent(element, "combobox");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var values = ko.utils.unwrapObservable(valueAccessor());
        $(element)["combobox"]('setValues', values);
    }
};
ko.bindingHandlers["comboboxValue"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "combobox", allBindingsAccessor);
        var value = valueAccessor();
        if (!value()) {
            var curValue = $(element)["combobox"]('getValue');
            if (curValue) {
                value(curValue);
            }
        }
        var options = $(element)["combobox"]('options');
        options.multiple = false;
        var refreshValueFun = function (oriFun) {
            return function () {
                value($(element)["combobox"]('getValue'));
                if (oriFun)
                    oriFun.apply($(element), arguments);
            };
        };
        options.onSelect = refreshValueFun(options.onSelect);
        options.onUnselect = refreshValueFun(options.onUnselect);
        utils.component.bindDisposeEvent(element, "combobox");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if ($(element)["combobox"]('getValue') !== value)
            $(element)["combobox"]('setValue', value);
    }
};
ko.bindingHandlers["comboboxText"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "combobox", allBindingsAccessor);
        var value = valueAccessor();
        if (!value()) {
            var curValue = $(element)["combobox"]('getText');
            if (curValue) {
                value(curValue);
            }
        }
        var options = $(element)["combobox"]('options');
        var comboOptions = $(element)["combo"]('options');
        options.multiple = false;
        var refreshValueFun = function (oriFun) {
            return function () {
                setTimeout(function () {
                    var combo = $.data(element).combo;
                    if (combo.hasOwnProperty('previousText')) {
                        value(combo.previousText);
                    }
                    else {
                        value($.data(element).combo.previousValue);
                    }
                }, 1);
                if (oriFun)
                    oriFun.apply($(element), arguments);
            };
        };
        comboOptions.onChange = refreshValueFun(comboOptions.onChange);
        utils.component.bindDisposeEvent(element, "combobox");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if ($(element)["combobox"]('getText') !== value)
            $(element)["combobox"]('setText', value);
    }
};

ko.bindingHandlers["combogridSource"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $combogrid = utils.component.initComponent(element, "combogrid", allBindingsAccessor);
        var options = $combogrid["combogrid"]('options');
        var onLoadSuccess = options.onLoadSuccess;
        options.onLoadSuccess = function (data) {
            var source = valueAccessor();
            source(data.rows);
            if (onLoadSuccess) {
                onLoadSuccess.apply($(element), arguments);
            }
            utils.component.bindDisposeEvent(element, "combogrid");
        };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var values = ko.utils.unwrapObservable(valueAccessor());
        var options = $(element)["combogrid"]("options");
        var idSelector = function (item) { return item[options.idField]; };
        var currentValues = $(element)["combogrid"]('grid').datagrid('getData').rows;
        if (!utils.array.sequenceEqual(currentValues, values, idSelector))
            $(element)["combogrid"]('grid').datagrid('loadData', values);
    }
};
ko.bindingHandlers["combogridValues"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "combogrid", allBindingsAccessor, { multiple: true });
        var curValues = $(element)["combogrid"]('getValues');
        if (utils.array.all(curValues, function (item) { return !item; })) {
            $(element)["combogrid"]('setValues', []);
        }
        var values = valueAccessor();
        if (!values() || values().length === 0) {
            curValues = $(element)["combogrid"]('getValues');
            if (curValues) {
                values(curValues);
            }
        }
        var $grid = $(element)["combogrid"]("grid");
        var options = $(element)["combogrid"]('options');
        var gridOptions = $grid.datagrid('options');
        var comboOptions = $(element)["combo"]("options");
        options.multiple = true;
        gridOptions.singleSelect = false;
        var refreshValueFun = function (oriFun) {
            return function () {
                var newValueIds = $(element)["combogrid"]('getValues');
                if (!utils.array.sequenceEqual(values(), newValueIds, utils.id)) {
                    values(newValueIds);
                    if (oriFun) {
                        oriFun.apply($(element), arguments);
                    }
                }
            };
        };
        comboOptions.onChange = refreshValueFun(comboOptions.onChange);
        utils.component.bindDisposeEvent(element, "combogrid");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var values = utils.array.map(ko.utils.unwrapObservable(valueAccessor()), function (v) { return utils.convertToString(v); });
        var oriValues = $(element)["combogrid"]('getValues');
        var options = $(element)["combogrid"]("options");
        if (values) {
            if (!utils.array.sequenceEqual(oriValues, values, utils.id))
                $(element)["combogrid"]('setValues', values);
        }
        else {
            $(element)["combogrid"]('clear');
        }
    }
};
ko.bindingHandlers["combogridValue"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "combogrid", allBindingsAccessor, { multiple: false });
        var value = valueAccessor();
        if (!value()) {
            var curValue = $(element)["combogrid"]('getValue');
            if (curValue)
                value(curValue);
        }
        var $grid = $(element)["combogrid"]("grid");
        var options = $(element)["combogrid"]('options');
        var gridOptions = $grid.datagrid('options');
        var comboOptions = $(element)["combo"]("options");
        options.multiple = false;
        gridOptions.singleSelect = true;
        var refreshValueFun = function (oriFun) {
            return function () {
                var newValueId = $(element)["combogrid"]('getValue');
                if (value() !== newValueId) {
                    value(newValueId);
                    if (oriFun) {
                        oriFun.apply($(element), arguments);
                    }
                }
            };
        };
        comboOptions.onChange = refreshValueFun(comboOptions.onChange);
        utils.component.bindDisposeEvent(element, "combogrid");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = utils.convertToString(ko.utils.unwrapObservable(valueAccessor()));
        var oriValue = $(element)["combogrid"]('getValue');
        var options = $(element)["combogrid"]("options");
        if (value) {
            if (oriValue !== value)
                $(element)["combogrid"]('setValue', value);
        }
        else {
            $(element)["combogrid"]('clear');
        }
    }
};

ko.bindingHandlers["combotreeSource"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $combotree = utils.component.initComponent(element, "combotree", allBindingsAccessor);
        var options = $combotree["combotree"]('options');
        var onLoadSuccess = options.onLoadSuccess;
        options.onLoadSuccess = function (node, data) {
            var source = valueAccessor();
            var oriNodes = utils.tree.treeToArray(source() || []);
            var newNodes = utils.tree.treeToArray($(element)["combotree"]('tree').tree('getRoots'));
            if (!utils.array.sequenceEqual(oriNodes, newNodes, utils.id)) {
                source(utils.tree.clone(data));
                if (onLoadSuccess) {
                    onLoadSuccess.apply($(element), arguments);
                }
            }
        };
        utils.component.bindDisposeEvent(element, "combotree");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var values = ko.utils.unwrapObservable(valueAccessor()) || [];
        var oriNodes = utils.tree.treeToArray($(element)["combotree"]('tree').tree('getRoots'));
        var newNodes = utils.tree.treeToArray(values);
        if (!utils.array.sequenceEqual(oriNodes, newNodes, utils.id)) {
            $(element)["combotree"]('loadData', utils.tree.clone(values));
        }
    }
};
ko.bindingHandlers["combotreeValues"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "combotree", allBindingsAccessor, { multiple: true });
        var curValues = $(element)["combotree"]('getValues');
        if (utils.array.all(curValues, function (item) { return !item; })) {
            $(element)["combotree"]('setValues', []);
        }
        var values = valueAccessor();
        if (!values() || values().length === 0) {
            curValues = $(element)["combogrid"]('getValues');
            if (curValues) {
                values(curValues);
            }
        }
        var refreshValueFun = function (oriFun) {
            return function () {
                var newValueIds = $(element)["combotree"]('getValues');
                if (!utils.array.sequenceEqual(values(), newValueIds, utils.id)) {
                    values(newValueIds);
                    if (oriFun) {
                        oriFun.apply($(element), arguments);
                    }
                }
            };
        };
        var options = $(element)["combotree"]('options');
        var comboOptions = $(element)["combo"]('options');
        if (options.multiple === false) {
            options.onChange = refreshValueFun(options.onChange);
            options.multiple = true;
            $(element)["combotree"](options);
        }
        else {
            comboOptions.onChange = refreshValueFun(comboOptions.onChange);
        }
        utils.component.bindDisposeEvent(element, "combotree");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var vs = ko.utils.unwrapObservable(valueAccessor());
        var values = (!!vs) ? utils.array.map(vs, utils.convertToString) : [];
        var oriValues = $(element)["combotree"]('getValues');
        if (values.length > 0) {
            if (!utils.array.sequenceEqual(oriValues, values, utils.id)) {
                $(element)["combotree"]('setValues', values);
            }
        }
        else {
            $(element)["combotree"]('clear');
        }
    }
};
ko.bindingHandlers["combotreeValue"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "combotree", allBindingsAccessor, { multiple: false });
        var value = valueAccessor();
        if (!value()) {
            var curValue = $(element)["combogrid"]('getValue');
            if (curValue)
                value(curValue);
        }
        var refreshValueFun = function (oriFun) {
            return function () {
                var newValue = $(element)["combotree"]('getValue');
                if (value !== newValue) {
                    value(newValue);
                    if (oriFun) {
                        oriFun.apply($(element), arguments);
                    }
                }
            };
        };
        var options = $(element)["combotree"]('options');
        var comboOptions = $(element)["combo"]('options');
        if (options.multiple === true) {
            options.onChange = refreshValueFun(options.onChange);
            options.multiple = false;
            $(element)["combotree"](options);
        }
        else {
            comboOptions.onChange = refreshValueFun(comboOptions.onChange);
        }
        utils.component.bindDisposeEvent(element, "combotree");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var oriValue = $(element)["combotree"]('getValue');
        if (value) {
            if (value !== oriValue) {
                $(element)["combotree"]('setValue', value);
            }
        }
        else {
            $(element)["combotree"]('clear');
        }
    }
};

(function () {
    var bindDatagridDisposeEvent = function (element) {
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            if (utils.component.checkComponentInited(element, "datagrid")) {
                $(element).data("datagrid", null);
            }
        });
    };
    var getIdField = function (element) { return $(element)["datagrid"]('options').idField || 'id'; };
    ko.bindingHandlers["datagridSource"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $datagrid = utils.component.initComponent(element, "datagrid", allBindingsAccessor);
            var options = $datagrid["datagrid"]('options');
            var onLoadSuccess = options.onLoadSuccess;
            options.onLoadSuccess = function (datas) {
                var value = valueAccessor();
                value(datas.rows);
                utils.func.safeApply(onLoadSuccess, $(element), arguments);
            };
            bindDatagridDisposeEvent(element);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var values = ko.utils.unwrapObservable(valueAccessor());
            $(element)["datagrid"]('loadData', values);
        }
    };
    ko.bindingHandlers["datagridValues"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            utils.component.ensureComponentInited(element, "datagrid", allBindingsAccessor, { singleSelect: false });
            var idField = getIdField(element);
            var values = valueAccessor();
            if (values() && values().length > 0) {
                var curValues = utils.array.clone($(element)["datagrid"]('getSelections'));
                values(curValues);
            }
            var options = $(element)["datagrid"]('options');
            options.singleSelect = false;
            var refreshValueFun = function (oriFun) {
                return function () {
                    var selections = $(element)["datagrid"]('getSelections');
                    if (!utils.array.sequenceEqual(values(), selections, function (item) { return item[idField]; })) {
                        values(utils.array.clone(selections));
                        utils.func.safeApply(oriFun, $(element), arguments);
                    }
                };
            };
            options.onSelect = refreshValueFun(options.onSelect);
            options.onUnselect = refreshValueFun(options.onUnselect);
            options.onSelectAll = refreshValueFun(options.onSelectAll);
            options.onUnselectAll = refreshValueFun(options.onUnselectAll);
            bindDatagridDisposeEvent(element);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var idField = getIdField(element);
            var values = ko.utils.unwrapObservable(valueAccessor());
            var options = $(element)["datagrid"]('options');
            if (values && values.length > 0) {
                var data = $(element)["datagrid"]('getData');
                var selectedRows = [];
                var invalidValueIndexs = [];
                utils.array.each(values, function (value, index, vs) {
                    var _a = utils.array.findIndexTuple(data.rows, function (item) { return item[idField] == value[idField]; }), rowIndex = _a[0], item = _a[1];
                    if (item !== value) {
                        if (item) {
                            values[index] = item;
                        }
                        else {
                            invalidValueIndexs.push(index);
                        }
                    }
                    if (rowIndex >= 0) {
                        selectedRows.push(rowIndex);
                    }
                });
                utils.array.each(invalidValueIndexs, function (invalidIndex) {
                    values.splice(invalidIndex, 1);
                });
                var onUnselectAll = options.onUnselectAll;
                var onSelect = options.onSelect;
                options.onUnselectAll = options.onSelect = function () { };
                $(element)["datagrid"]('unselectAll');
                utils.array.each(selectedRows, function (selectedRow) {
                    $(element)["datagrid"]('selectRow', selectedRow);
                });
                options.onUnselectAll = onUnselectAll;
                options.onSelect = onSelect;
            }
            else {
                $(element)["datagrid"]('unselectAll');
            }
        }
    };
    ko.bindingHandlers["datagridValue"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            utils.component.ensureComponentInited(element, "datagrid", allBindingsAccessor, { singleSelect: true });
            var idField = getIdField(element);
            var value = valueAccessor();
            if (value()) {
                var curValue = $(element)["datagrid"]('getSelected');
                value(curValue);
            }
            var options = $(element)["datagrid"]('options');
            options.singleSelect = true;
            var refreshValueFun = function (oriFun) {
                return function () {
                    var selected = $(element)["datagrid"]('getSelected');
                    if (selected !== value()) {
                        value(selected);
                    }
                    utils.func.safeApply(oriFun, $(element), arguments);
                };
            };
            var unselectAllValueFun = function (oriFun) {
                return function () {
                    value(null);
                    utils.func.safeApply(oriFun, $(element), arguments);
                };
            };
            var selectAllValueFun = function (oriFun) {
                return function () {
                    var data = $(element)["datagrid"]('getData');
                    value(data.rows);
                    utils.func.safeApply(oriFun, $(element), arguments);
                };
            };
            options.onSelect = refreshValueFun(options.onSelect);
            options.onUnselect = refreshValueFun(options.onUnselect);
            options.onSelectAll = selectAllValueFun(options.onSelectAll);
            options.onUnselectAll = unselectAllValueFun(options.onUnselectAll);
            bindDatagridDisposeEvent(element);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var idField = getIdField(element);
            var value = valueAccessor();
            var options = $(element)["datagrid"]('options');
            if (value()) {
                if (utils.object.isArray(value()))
                    return;
                var curValue = $(element)["datagrid"]('getSelected');
                if (curValue) {
                    if (curValue[idField] === value()[idField]) {
                        if (curValue !== value()) {
                            value(curValue);
                        }
                        return;
                    }
                }
                var data = $(element)["datagrid"]('getData');
                var _a = utils.array.findIndexTuple(data.rows, function (item) { return item[idField] === value()[idField]; }), rowIndex = _a[0], item = _a[1];
                if (rowIndex < 0) {
                    value(null);
                }
                else {
                    $(element)["datagrid"]('selectRow', rowIndex);
                }
            }
            else {
                $(element)["datagrid"]('unselectAll');
            }
        }
    };
})();

ko.bindingHandlers["dateboxValue"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "datebox", allBindingsAccessor);
        var options = $(element)["datebox"]('options');
        var value = valueAccessor();
        if (!value()) {
            var curValue = $(element)["datebox"]('getValue');
            if (curValue) {
                value(curValue);
            }
        }
        var refreshValueFun = function (oriFun) {
            return function () {
                value($(element)["datebox"]('getValue'));
                utils.func.safeApply(oriFun, $(element), arguments);
            };
        };
        options.onSelect = refreshValueFun(options.onSelect);
        utils.component.bindDisposeEvent(element, "datebox");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if ($(element)["datebox"]('getValue') !== value) {
            $(element)["datebox"]('setValue', value);
        }
    }
};

ko.bindingHandlers["datetimeboxValue"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "datetimebox", allBindingsAccessor);
        var options = $(element)["combo"]('options');
        var value = valueAccessor();
        if (!value()) {
            var curValue = $(element)["datetimebox"]('getValue');
            if (curValue) {
                value(curValue);
            }
        }
        var refreshValueFun = function (oriFun) {
            return function () {
                value($(element)["datetimebox"]('getValue'));
                utils.func.safeApply(oriFun, $(element), arguments);
            };
        };
        options.onChange = refreshValueFun(options.onChange);
        utils.component.bindDisposeEvent(element, "datetimebox");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if ($(element)["datetimebox"]('getValue') !== value) {
            $(element)["datetimebox"]('setValue', value);
        }
    }
};

ko.bindingHandlers["numberBoxValue"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "numberbox", allBindingsAccessor);
        var value = valueAccessor();
        if (!value()) {
            value(parseFloat($(element)["numberbox"]('getValue')));
        }
        var easyuiAccessor = ($(element)["textbox"] || ($(element)["numberbox"]));
        var options = easyuiAccessor.call($(element), 'options');
        var onChange = options.onChange;
        options.onChange = function (newValue, oldValue) {
            newValue = parseFloat(newValue);
            value = valueAccessor();
            if (value() !== newValue) {
                value(newValue);
                utils.func.safeApply(onChange, $(element), arguments);
            }
        };
        utils.component.bindDisposeEvent(element, "numberbox");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element)["numberbox"]('setValue', value);
        if ($(element)["numberbox"]('getValue')) {
            $(element).removeClass("validatebox-invalid");
        }
        else {
            if ($(element)["numberbox"]('options').required) {
                $(element).addClass("validatebox-invalid");
            }
        }
    }
};

ko.bindingHandlers["numberspinnerValue"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "numberspinner", allBindingsAccessor);
        var value = valueAccessor();
        if (!value()) {
            value(parseFloat($(element)["numberspinner"]('getValue')));
        }
        var easyuiAccessor = ($(element)["textbox"] || ($(element)["numberbox"]));
        var options = easyuiAccessor.call($(element), 'options');
        var onChange = options.onChange;
        options.onChange = function (newValue, oldValue) {
            newValue = parseFloat(newValue);
            value = valueAccessor();
            if (value() !== newValue) {
                value(newValue);
                utils.func.safeApply(onChange, $(element), arguments);
            }
        };
        utils.component.bindDisposeEvent(element, "numberspinner");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element)["numberspinner"]('setValue', value);
        var newActualValue = $(element)["numberspinner"]('getValue');
        if (newActualValue) {
            $(element).removeClass("validatebox-invalid");
            if (newActualValue !== value) {
                valueAccessor()(parseFloat(newActualValue));
            }
        }
        else {
            if ($(element)["numberspinner"]('options').required)
                $(element).addClass("validatebox-invalid");
        }
    }
};

ko.bindingHandlers["progressbarValue"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "progressbar", allBindingsAccessor);
        var value = valueAccessor();
        if (!value()) {
            value($(element)["progressbar"]('getValue'));
        }
        var options = $(element)["progressbar"]('options');
        var onChange = options.onChange;
        options.onChange = function (newValue, oldValue) {
            newValue = parseFloat(newValue);
            var value = valueAccessor();
            if (value() !== newValue) {
                value(newValue);
                if (onChange) {
                    onChange.apply(this, arguments);
                }
            }
        };
        utils.component.bindDisposeEvent(element, "progressbar");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element)["progressbar"]('setValue', value);
        var updatedValue = $(element)["progressbar"]('getValue');
        if (value !== updatedValue) {
            valueAccessor()(updatedValue);
        }
    }
};

ko.bindingHandlers["sliderValue"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        utils.component.ensureComponentInited(element, "slider", allBindingsAccessor);
        var value = valueAccessor();
        if (!value()) {
            value($(element)["slider"]('getValue'));
        }
        var options = $(element)["slider"]('options');
        var onChange = options.onChange;
        options.onChange = function (newValue, oldValue) {
            if (newValue !== value()) {
                value(newValue);
                if (onChange) {
                    onChange.apply(this, arguments);
                }
            }
        };
        utils.component.bindDisposeEvent(element, "slider");
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if ($(element)["slider"]('getValue') !== value)
            $(element)["slider"]('setValue', value);
    }
};
