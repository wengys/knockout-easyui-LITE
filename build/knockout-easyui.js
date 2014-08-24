(function() {
  var utils;

  ko.bindingHandlers.easyuiOptions = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {},
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {}
  };

  utils = {
    component: {
      checkComponentInited: function(element, componentTypeName) {
        return $.data(element, componentTypeName) != null;
      },
      initComponent: function(element, componentTypeName, allBindingsAccessor, extOptions) {
        var allBindings, options;
        if (extOptions == null) {
          extOptions = null;
        }
        allBindings = allBindingsAccessor();
        options = allBindings['easyuiOptions'] || {};
        if (utils.isFunction(options)) {
          options = options();
        }
        if (extOptions) {
          $.extend(options, extOptions);
        }
        return $(element)[componentTypeName](options);
      },
      ensureComponentInited: function(element, componentTypeName, allBindingsAccessor, extOptions) {
        if (extOptions == null) {
          extOptions = null;
        }
        if (!utils.component.checkComponentInited(element, componentTypeName)) {
          return utils.component.initComponent(element, componentTypeName, allBindingsAccessor, extOptions);
        }
      },
      bindDisposeEvent: function(element, componentTypeName) {
        return ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
          if (utils.component.checkComponentInited(element, componentTypeName)) {
            return $(element)[componentTypeName]('destroy');
          }
        });
      }
    },
    array: {
      all: function(source, predictor) {
        var item, _i, _len;
        for (_i = 0, _len = source.length; _i < _len; _i++) {
          item = source[_i];
          if (!predictor(item)) {
            return false;
          }
        }
        return true;
      },
      any: function(source, predictor) {
        var item, _i, _len;
        for (_i = 0, _len = source.length; _i < _len; _i++) {
          item = source[_i];
          if (predictor(item)) {
            return true;
          }
        }
        return false;
      },
      map: function(source, mapper) {
        var index, item, ret, _i, _len;
        ret = [];
        for (index = _i = 0, _len = source.length; _i < _len; index = ++_i) {
          item = source[index];
          ret.push(mapper(item, index, source));
        }
        return ret;
      },
      sequenceEqual: function(source, target, idSelector) {
        var diff, sourceIds, targetIds;
        sourceIds = utils.array.map(source, idSelector);
        targetIds = utils.array.map(target, idSelector);
        diff = ko.utils.compareArrays(sourceIds, targetIds);
        return !utils.array.any(diff, function(item) {
          return item.hasOwnProperty('index');
        });
      },
      clone: function(seq, alsoCloneItem) {
        var item, itemSelector, _i, _len, _results;
        itemSelector = utils.identity;
        if (alsoCloneItem) {
          itemSelector = function(item) {
            return ko.utils.extend({}, item);
          };
        }
        _results = [];
        for (_i = 0, _len = seq.length; _i < _len; _i++) {
          item = seq[_i];
          _results.push(itemSelector(item));
        }
        return _results;
      },
      findIndex: function(seq, predictor) {
        var index, item, _i, _len;
        for (index = _i = 0, _len = seq.length; _i < _len; index = ++_i) {
          item = seq[index];
          if (predictor(item)) {
            return [index, item];
          }
        }
        return [null, null];
      },
      filter: function(seq, predictor) {
        var item, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = seq.length; _i < _len; _i++) {
          item = seq[_i];
          if (predictor(item)) {
            _results.push(item);
          }
        }
        return _results;
      }
    },
    tree: {
      treeToNodes: function(tree) {
        var innerTreeToNodes, tmpNodes;
        tmpNodes = [];
        innerTreeToNodes = function(nodes) {
          var children, node, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = nodes.length; _i < _len; _i++) {
            node = nodes[_i];
            tmpNodes.push(node);
            children = node['children'];
            if (children) {
              _results.push(innerTreeToNodes(children));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
        innerTreeToNodes(tree);
        return tmpNodes;
      },
      clone: function(tree) {
        var innerClone;
        innerClone = function(nodes) {
          var clonedNode, clonedTree, node, _i, _len;
          clonedTree = [];
          for (_i = 0, _len = nodes.length; _i < _len; _i++) {
            node = nodes[_i];
            clonedNode = {
              id: node.id,
              text: node.text,
              state: node.state,
              checked: node.checked,
              attributes: node.attributes,
              children: node.children
            };
            if (clonedNode.children) {
              clonedNode.children = innerClone(clonedNode.children);
            }
            clonedTree.push(clonedNode);
          }
          return clonedTree;
        };
        return innerClone(tree);
      }
    },
    isFunction: function(obj) {
      return typeof obj === 'function';
    },
    identity: function(obj) {
      return obj;
    },
    convertToString: function(value) {
      if (value) {
        return value + '';
      } else {
        return '';
      }
    },
    now: Date.now || function() {
      return new Date().getTime();
    },
    debounce: function(func, wait, immediate) {
      var args, context, later, result, timeout, timestamp;
      timeout = args = context = timestamp = result = null;
      later = function() {
        var last;
        last = utils.now() - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
        }
        if (!immediate) {
          result = func.apply(context, args);
          return context = args = null;
        }
      };
      return function() {
        var callNow;
        context = this;
        args = arguments;
        timestamp = utils.now();
        callNow = immediate && !timeout;
        if (!timeout) {
          timeout = setTimeout(later, wait);
        }
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }
        return result;
      };
    }
  };

  ko.bindingHandlers.calendarValue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var curValue, options, refreshValueFun, value;
      utils.component.ensureComponentInited(element, "calendar", allBindingsAccessor);
      options = $(element).calendar('options');
      value = valueAccessor();
      if (value() == null) {
        curValue = options.current;
        if (curValue) {
          value(curValue);
        }
      }
      refreshValueFun = function(oriFun) {
        return function() {
          value(options.current);
          return oriFun != null ? oriFun.apply($(element), arguments) : void 0;
        };
      };
      return options.onSelect = refreshValueFun(options.onSelect);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value;
      value = ko.utils.unwrapObservable(valueAccessor());
      if ($(element).calendar('options').current !== value) {
        return $(element).calendar('moveTo', value);
      }
    }
  };

  ko.bindingHandlers.comboboxSource = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $combobox, onLoadSuccess, options;
      $combobox = utils.component.initComponent(element, "combobox", allBindingsAccessor);
      options = $combobox.combobox('options');
      onLoadSuccess = options.onLoadSuccess;
      options.onLoadSuccess = function(datas) {
        var source;
        source = valueAccessor();
        source(datas);
        return onLoadSuccess != null ? onLoadSuccess.apply($(element), arguments) : void 0;
      };
      return utils.component.bindDisposeEvent(element, "combobox");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var values;
      values = ko.utils.unwrapObservable(valueAccessor());
      return $(element).combobox('loadData', values);
    }
  };

  ko.bindingHandlers.comboboxValues = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var curValues, options, refreshValueFun, values;
      utils.component.ensureComponentInited(element, "combobox", allBindingsAccessor);
      curValues = $(element).combobox('getValues');
      if (utils.array.all(curValues, function(item) {
        return !item;
      })) {
        $(element).combobox('setValues', []);
      }
      values = valueAccessor();
      if ((values() == null) || values().length === 0) {
        curValues = $(element).combobox('getValues');
        values(curValues);
      }
      options = $(element).combobox('options');
      options.multiple = true;
      refreshValueFun = function(oriFun) {
        return function() {
          curValues = $(element).combobox('getValues');
          values(curValues);
          return oriFun != null ? oriFun.apply($(element), arguments) : void 0;
        };
      };
      options.onSelect = refreshValueFun(options.onSelect);
      options.onUnselect = refreshValueFun(options.onUnselect);
      return utils.component.bindDisposeEvent(element, "combobox");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var values;
      values = ko.utils.unwrapObservable(valueAccessor());
      return $(element).combobox('setValues', values);
    }
  };

  ko.bindingHandlers.comboboxValue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var curValue, options, refreshValueFun, value;
      utils.component.ensureComponentInited(element, "combobox", allBindingsAccessor);
      value = valueAccessor();
      if (value() == null) {
        curValue = $(element).combobox('getValue');
        if (curValue) {
          value(curValue);
        }
      }
      options = $(element).combobox('options');
      options.multiple = false;
      refreshValueFun = function(oriFun) {
        return function() {
          value($(element).combobox('getValue'));
          return oriFun != null ? oriFun.apply($(element), arguments) : void 0;
        };
      };
      options.onSelect = refreshValueFun(options.onSelect);
      options.onUnselect = refreshValueFun(options.onUnselect);
      return utils.component.bindDisposeEvent(element, "combobox");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value;
      value = ko.utils.unwrapObservable(valueAccessor());
      if ($(element).combobox('getValue') !== value) {
        return $(element).combobox('setValue', value);
      }
    }
  };

  ko.bindingHandlers.combogridSource = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $combogrid, onLoadSuccess, options;
      $combogrid = utils.component.initComponent(element, "combogrid", allBindingsAccessor);
      options = $combogrid.combogrid('options');
      onLoadSuccess = options.onLoadSuccess;
      options.onLoadSuccess = function(data) {
        var source;
        source = valueAccessor();
        source(data.rows);
        return onLoadSuccess != null ? onLoadSuccess.apply($(element), arguments) : void 0;
      };
      return utils.component.bindDisposeEvent(element, "combogrid");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var currentValues, idSelector, options, values;
      values = ko.utils.unwrapObservable(valueAccessor());
      options = $(element).combogrid("options");
      idSelector = function(item) {
        return item[options.idField];
      };
      currentValues = $(element).combogrid('grid').datagrid('getData').rows;
      if (!utils.array.sequenceEqual(currentValues, values, idSelector)) {
        return $(element).combogrid('grid').datagrid('loadData', values);
      }
    }
  };

  ko.bindingHandlers.combogridValues = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $grid, comboOptions, curValues, gridOptions, options, refreshValueFun, values;
      utils.component.ensureComponentInited(element, "combogrid", allBindingsAccessor, {
        multiple: true
      });
      curValues = $(element).combogrid('getValues');
      if (utils.array.all(curValues, function(item) {
        return !item;
      })) {
        $(element).combogrid('setValues', []);
      }
      values = valueAccessor();
      if ((values() == null) || values().length === 0) {
        curValues = $(element).combogrid('getValues');
        if (curValues) {
          values(curValues);
        }
      }
      $grid = $(element).combogrid("grid");
      options = $(element).combogrid('options');
      gridOptions = $grid.datagrid('options');
      comboOptions = $(element).combo("options");
      options.multiple = true;
      gridOptions.singleSelect = false;
      refreshValueFun = function(oriFun) {
        return function() {
          var newValueIds;
          newValueIds = $(element).combogrid('getValues');
          values(newValueIds);
          return oriFun != null ? oriFun.apply($(element), arguments) : void 0;
        };
      };
      comboOptions.onChange = refreshValueFun(comboOptions.onChange);
      return utils.component.bindDisposeEvent(element, "combogrid");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var options, oriValues, v, values;
      values = (function() {
        var _i, _len, _ref, _results;
        _ref = ko.utils.unwrapObservable(valueAccessor());
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          _results.push(utils.convertToString(v));
        }
        return _results;
      })();
      oriValues = $(element).combogrid('getValues');
      options = $(element).combogrid("options");
      if (values != null) {
        if (!utils.array.sequenceEqual(oriValues, values, utils.identity)) {
          return $(element).combogrid('setValues', values);
        }
      } else {
        return $(element).combogrid('clear');
      }
    }
  };

  ko.bindingHandlers.combogridValue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $grid, comboOptions, curValue, gridOptions, options, refreshValueFun, value;
      utils.component.ensureComponentInited(element, "combogrid", allBindingsAccessor, {
        multiple: false
      });
      value = valueAccessor();
      if (value() == null) {
        curValue = $(element).combogrid('getValue');
        if (curValue) {
          value(curValue);
        }
      }
      $grid = $(element).combogrid("grid");
      options = $(element).combogrid('options');
      gridOptions = $grid.datagrid('options');
      comboOptions = $(element).combo("options");
      options.multiple = false;
      gridOptions.singleSelect = true;
      refreshValueFun = function(oriFun) {
        return function() {
          var newValueId;
          newValueId = $(element).combogrid('getValue');
          value(newValueId);
          return oriFun != null ? oriFun.apply($(element), arguments) : void 0;
        };
      };
      comboOptions.onChange = refreshValueFun(comboOptions.onChange);
      return utils.component.bindDisposeEvent(element, "combogrid");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var options, oriValue, value;
      value = utils.convertToString(ko.utils.unwrapObservable(valueAccessor()));
      oriValue = $(element).combogrid('getValue');
      options = $(element).combogrid("options");
      if (value != null) {
        if (oriValue !== value) {
          return $(element).combogrid('setValue', value);
        }
      } else {
        return $(element).combogrid('clear');
      }
    }
  };

  ko.bindingHandlers.combotreeSource = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $combotree, idSelector, onLoadSuccess, options;
      $combotree = utils.component.initComponent(element, "combotree", allBindingsAccessor);
      options = $combotree.combotree('options');
      onLoadSuccess = options.onLoadSuccess;
      idSelector = function(item) {
        return item.id;
      };
      options.onLoadSuccess = function(node, data) {
        var newNodes, oriNodes, source;
        source = valueAccessor();
        oriNodes = utils.tree.treeToNodes(source() || []);
        newNodes = utils.tree.treeToNodes($(element).combotree('tree').tree('getRoots'));
        if (!utils.array.sequenceEqual(oriNodes, newNodes, idSelector)) {
          source(utils.tree.clone(data));
          return onLoadSuccess != null ? onLoadSuccess.apply($(element), arguments) : void 0;
        }
      };
      return utils.component.bindDisposeEvent(element, "combotree");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var idSelector, newNodes, oriNodes, values;
      idSelector = function(item) {
        return item.id;
      };
      values = ko.utils.unwrapObservable(valueAccessor());
      if (values == null) {
        values = [];
      }
      oriNodes = utils.tree.treeToNodes($(element).combotree('tree').tree('getRoots'));
      newNodes = utils.tree.treeToNodes(values);
      if (!utils.array.sequenceEqual(oriNodes, newNodes, idSelector)) {
        return $(element).combotree('loadData', utils.tree.clone(values));
      }
    }
  };

  ko.bindingHandlers.combotreeValues = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var comboOptions, curValues, options, refreshValueFun, values;
      utils.component.ensureComponentInited(element, "combotree", allBindingsAccessor, {
        multiple: true
      });
      values = valueAccessor();
      if ((values() == null) || values().length === 0) {
        curValues = $(element).combogrid('getValues');
        if (curValues) {
          values(curValues);
        }
      }
      refreshValueFun = function(oriFun) {
        return function() {
          var newValueIds;
          newValueIds = $(element).combotree('getValues');
          values(newValueIds);
          return oriFun != null ? oriFun.apply($(element), arguments) : void 0;
        };
      };
      options = $(element).combotree('options');
      comboOptions = $(element).combo('options');
      if (options.multiple === false) {
        options.onChange = refreshValueFun(options.onChange);
        options.multiple = true;
        $(element).combotree(options);
      } else {
        comboOptions.onChange = refreshValueFun(comboOptions.onChange);
      }
      return utils.component.bindDisposeEvent(element, "combotree");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var oriValues, v, values, vs;
      vs = ko.utils.unwrapObservable(valueAccessor());
      values = vs != null ? (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = vs.length; _i < _len; _i++) {
          v = vs[_i];
          _results.push(utils.convertToString(v));
        }
        return _results;
      })() : [];
      oriValues = $(element).combotree('getValues');
      if (values.length > 0) {
        if (!utils.array.sequenceEqual(oriValues, values, utils.identity)) {
          return $(element).combotree('setValues', values);
        }
      } else {
        return $(element).combotree('clear');
      }
    }
  };

  ko.bindingHandlers.combotreeValue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var comboOptions, curValue, options, refreshValueFun, value;
      utils.component.ensureComponentInited(element, "combotree", allBindingsAccessor, {
        multiple: false
      });
      value = valueAccessor();
      if (value() == null) {
        curValue = $(element).combogrid('getValue');
        if (curValue) {
          value(curValue);
        }
      }
      refreshValueFun = function(oriFun) {
        return function() {
          var newValue;
          newValue = $(element).combotree('getValue');
          value(newValue);
          return oriFun != null ? oriFun.apply($(element), arguments) : void 0;
        };
      };
      options = $(element).combotree('options');
      comboOptions = $(element).combo('options');
      if (options.multiple === true) {
        options.onChange = refreshValueFun(options.onChange);
        options.multiple = false;
        $(element).combotree(options);
      } else {
        comboOptions.onChange = refreshValueFun(comboOptions.onChange);
      }
      return utils.component.bindDisposeEvent(element, "combotree");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var oriValue, value;
      value = ko.utils.unwrapObservable(valueAccessor());
      oriValue = $(element).combotree('getValue');
      if (value != null) {
        if (value !== oriValue) {
          return $(element).combotree('setValue', value);
        }
      } else {
        return $(element).combotree('clear');
      }
    }
  };

  (function() {
    var bindDatagridDisposeEvent, getIdField;
    bindDatagridDisposeEvent = function(element) {
      return ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        if (utils.component.checkComponentInited(element, "datagrid")) {
          return $(element).data("datagrid", null);
        }
      });
    };
    getIdField = function(element) {
      var _ref;
      return (_ref = $(element).datagrid('options').idField) != null ? _ref : 'id';
    };
    ko.bindingHandlers.datagridSource = {
      init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $datagrid, onLoadSuccess, options;
        $datagrid = utils.component.initComponent(element, "datagrid", allBindingsAccessor);
        options = $datagrid.datagrid('options');
        onLoadSuccess = options.onLoadSuccess;
        options.onLoadSuccess = function(datas) {
          var source;
          source = valueAccessor();
          source(datas.rows);
          return onLoadSuccess != null ? onLoadSuccess.apply($(element), arguments) : void 0;
        };
        return bindDatagridDisposeEvent(element);
      },
      update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var values;
        values = ko.utils.unwrapObservable(valueAccessor());
        return $(element).datagrid('loadData', values);
      }
    };
    ko.bindingHandlers.datagridValues = {
      init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var curValues, idField, options, refreshValueFun, values;
        utils.component.ensureComponentInited(element, "datagrid", allBindingsAccessor, {
          singleSelect: false
        });
        idField = getIdField(element);
        values = valueAccessor();
        if ((values() == null) && values().length === 0) {
          curValues = utils.array.clone($(element).datagrid('getSelections'));
          values(curValues);
        }
        options = $(element).datagrid('options');
        options.singleSelect = false;
        refreshValueFun = function(oriFun) {
          return function() {
            var selections;
            selections = $(element).datagrid('getSelections');
            if (!utils.array.sequenceEqual(values(), selections, function(item) {
              return item[idField];
            })) {
              values(utils.array.clone(selections));
            }
            return oriFun != null ? oriFun.apply($(element), arguments) : void 0;
          };
        };
        options.onSelect = refreshValueFun(options.onSelect);
        options.onUnselect = refreshValueFun(options.onUnselect);
        options.onSelectAll = refreshValueFun(options.onSelectAll);
        options.onUnselectAll = refreshValueFun(options.onUnselectAll);
        return bindDatagridDisposeEvent(element);
      },
      update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var data, idField, index, invalidIndex, invalidValueIndexs, item, onUnselectAll, options, rowIndex, selectedRow, selectedRows, value, values, _i, _j, _k, _len, _len1, _len2, _ref, _results;
        idField = getIdField(element);
        values = ko.utils.unwrapObservable(valueAccessor());
        options = $(element).datagrid('options');
        if ((values != null) && values.length > 0) {
          data = $(element).datagrid('getData');
          selectedRows = [];
          invalidValueIndexs = [];
          for (index = _i = 0, _len = values.length; _i < _len; index = ++_i) {
            value = values[index];
            _ref = utils.array.findIndex(data.rows, function(item) {
              return item[idField] === value[idField];
            }), rowIndex = _ref[0], item = _ref[1];
            if (item !== value) {
              if (item != null) {
                values[index] = item;
              } else {
                invalidValueIndexs.push(index);
              }
            }
            if (rowIndex != null) {
              selectedRows.push(rowIndex);
            }
          }
          for (_j = 0, _len1 = invalidValueIndexs.length; _j < _len1; _j++) {
            invalidIndex = invalidValueIndexs[_j];
            values.splice(index, 1);
          }
          onUnselectAll = options.onUnselectAll;
          options.onUnselectAll = function() {};
          $(element).datagrid('unselectAll');
          options.onUnselectAll = onUnselectAll;
          _results = [];
          for (_k = 0, _len2 = selectedRows.length; _k < _len2; _k++) {
            selectedRow = selectedRows[_k];
            _results.push($(element).datagrid('selectRow', selectedRow));
          }
          return _results;
        } else {
          return $(element).datagrid('unselectAll');
        }
      }
    };
    return ko.bindingHandlers.datagridValue = {
      init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var curValue, events, funName, options, updateValFunc, value;
        utils.component.ensureComponentInited(element, "datagrid", allBindingsAccessor, {
          singleSelect: true
        });
        value = valueAccessor();
        if (value() == null) {
          curValue = $(element).datagrid('getSelected');
          value(curValue);
        }
        options = $(element).datagrid('options');
        options.singleSelect = true;
        events = {
          onSelect: options.onSelect,
          onUnselect: options.onUnselect,
          onSelectAll: options.onSelectAll,
          onUnselectAll: options.onUnselectAll
        };
        funName = "";
        updateValFunc = utils.debounce(function() {
          var _ref;
          value($(element).datagrid('getSelected'));
          return (_ref = events[funName]) != null ? _ref.apply($(element), arguments) : void 0;
        }, 1);
        options.onSelect = function() {
          funName = "onSelect";
          return updateValFunc.apply(arguments);
        };
        options.onUnselect = function() {
          funName = "onUnselect";
          return updateValFunc.apply(arguments);
        };
        options.onSelectAll = function() {
          funName = "onSelectAll";
          return updateValFunc.apply(arguments);
        };
        options.onUnselectAll = function() {
          funName = "onUnselectAll";
          return updateValFunc.apply(arguments);
        };
        return bindDatagridDisposeEvent(element);
      },
      update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var curValue, data, idField, item, options, rowIndex, value, _ref;
        idField = getIdField(element);
        value = ko.utils.unwrapObservable(valueAccessor());
        options = $(element).datagrid('options');
        if (value) {
          data = $(element).datagrid('getData');
          _ref = utils.array.findIndex(data.rows, function(item) {
            return item[idField] === value[idField];
          }), rowIndex = _ref[0], item = _ref[1];
          if (item !== value) {
            valueAccessor()(item);
          }
          curValue = $(element).datagrid('getSelected');
          if ((curValue != null ? curValue[idField] : void 0) === value[idField]) {
            return;
          }
          if (rowIndex != null) {
            return $(element).datagrid('selectRow', rowIndex);
          }
        } else {
          return $(element).datagrid('unselectAll');
        }
      }
    };
  })();

  ko.bindingHandlers.dateboxValue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var curValue, options, refreshValueFun, value;
      utils.component.ensureComponentInited(element, "datebox", allBindingsAccessor);
      options = $(element).datebox('options');
      value = valueAccessor();
      if (value() == null) {
        curValue = $(element).datebox('getValue');
        if (curValue) {
          value(curValue);
        }
      }
      refreshValueFun = function(oriFun) {
        return function() {
          value($(element).datebox('getValue'));
          return oriFun != null ? oriFun.apply($(element), arguments) : void 0;
        };
      };
      options.onSelect = refreshValueFun(options.onSelect);
      return utils.component.bindDisposeEvent(element, "datebox");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value;
      value = ko.utils.unwrapObservable(valueAccessor());
      if ($(element).datebox('getValue') !== value) {
        return $(element).datebox('setValue', value);
      }
    }
  };

  ko.bindingHandlers.datetimeboxValue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var curValue, options, refreshValueFun, value;
      utils.component.ensureComponentInited(element, "datetimebox", allBindingsAccessor);
      options = $(element).datetimebox('options');
      value = valueAccessor();
      if (value() == null) {
        curValue = $(element).datetimebox('getValue');
        if (curValue) {
          value(curValue);
        }
      }
      refreshValueFun = function(oriFun) {
        return function() {
          value($(element).datetimebox('getValue'));
          return oriFun != null ? oriFun.apply($(element), arguments) : void 0;
        };
      };
      options.onSelect = refreshValueFun(options.onSelect);
      return utils.component.bindDisposeEvent(element, "datetimebox");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value;
      value = ko.utils.unwrapObservable(valueAccessor());
      if ($(element).datetimebox('getValue') !== value) {
        return $(element).datetimebox('setValue', value);
      }
    }
  };

  ko.bindingHandlers.numberBoxValue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var onChange, options, value;
      utils.component.ensureComponentInited(element, "numberbox", allBindingsAccessor);
      value = valueAccessor();
      if (value() == null) {
        value(parseFloat($(element).numberbox('getValue')));
      }
      options = $(element).numberbox('options');
      onChange = options.onChange;
      options.onChange = function(newValue, oldValue) {
        newValue = parseFloat(newValue);
        value = valueAccessor();
        if (value() !== newValue) {
          value(newValue);
          return onChange != null ? onChange.apply($(element), arguments) : void 0;
        }
      };
      return utils.component.bindDisposeEvent(element, "numberbox");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value;
      value = ko.utils.unwrapObservable(valueAccessor());
      $(element).numberbox('setValue', value);
      if ($(element).numberbox('getValue')) {
        return $(element).removeClass("validatebox-invalid");
      } else {
        if (($(element).numberbox('options').required)) {
          return $(element).addClass("validatebox-invalid");
        }
      }
    }
  };

  ko.bindingHandlers.numberSpinnerValue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var onChange, options, value;
      utils.component.ensureComponentInited(element, "numberspinner", allBindingsAccessor);
      value = valueAccessor();
      if (value() == null) {
        value(parseFloat($(element).numberspinner('getValue')));
      }
      options = $(element).numberbox('options');
      onChange = options.onChange;
      options.onChange = function(newValue, oldValue) {
        newValue = parseFloat(newValue);
        value = valueAccessor();
        if (value() !== newValue) {
          value(newValue);
          return onChange != null ? onChange.apply($(element), arguments) : void 0;
        }
      };
      return utils.component.bindDisposeEvent(element, "numberspinner");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value;
      value = ko.utils.unwrapObservable(valueAccessor());
      $(element).numberspinner('setValue', value);
      if ($(element).numberspinner('getValue')) {
        return $(element).removeClass("validatebox-invalid");
      } else {
        if (($(element).numberspinner('options').required)) {
          return $(element).addClass("validatebox-invalid");
        }
      }
    }
  };

  ko.bindingHandlers.progressbarValue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var onChange, options, value;
      utils.component.ensureComponentInited(element, "progressbar", allBindingsAccessor);
      value = valueAccessor();
      if (value() == null) {
        value($(element).progressbar('getValue'));
      }
      options = $(element).progressbar('options');
      onChange = options.onChange;
      options.onChange = function(newValue, oldValue) {
        newValue = parseFloat(newValue);
        value = valueAccessor();
        if (value() !== newValue) {
          value(newValue);
          return onChange != null ? onChange.apply(this, arguments) : void 0;
        }
      };
      return utils.component.bindDisposeEvent(element, "progressbar");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var updatedValue, value;
      value = ko.utils.unwrapObservable(valueAccessor());
      $(element).progressbar('setValue', value);
      updatedValue = $(element).progressbar('getValue');
      if (value !== updatedValue) {
        return valueAccessor()(updatedValue);
      }
    }
  };

  ko.bindingHandlers.sliderValue = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var onChange, options, value;
      utils.component.ensureComponentInited(element, "slider", allBindingsAccessor);
      value = valueAccessor();
      if (value() == null) {
        value($(element).slider('getValue'));
      }
      options = $(element).slider('options');
      onChange = options.onChange;
      options.onChange = function(newValue, oldValue) {
        value(newValue);
        return onChange != null ? onChange.apply(this, arguments) : void 0;
      };
      return utils.component.bindDisposeEvent(element, "slider");
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value;
      value = ko.utils.unwrapObservable(valueAccessor());
      if ($(element).slider('getValue') !== value) {
        return $(element).slider('setValue', value);
      }
    }
  };

}).call(this);
