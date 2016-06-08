/// <reference path="../typings/jquery/jquery.d.ts" />

module utils {
    export module object {
        export var isFunction = (obj) => typeof obj === 'function';

        export var isNull = (obj) => {
            return obj === null;
        };

        export var isUndefined = (obj) => {
            return obj === void 0;
        };

        var property = function (key) {
            return function (obj) {
                return obj == null ? void 0 : obj[key];
            };
        }
        var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
        var getLength = property('length');
        export var isArray = function (collection) {
            var length = getLength(collection);
            return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
        };
    }

    export module array {
        export var each = <T>(source: T[], action: (item: T, index: number, items: T[]) => void): void => {
            var i = 0, sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                action(source[i], i, source);
            }
        }
        export var all = <T>(source: T[], predictor: (item: T) => boolean): boolean => {
            var i = 0, sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                if (!predictor(source[i])) {
                    return false
                }
            }
            return true
        }
        export var any = <T>(source: T[], predictor: (item: T) => boolean): boolean => {
            var i = 0, sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                if (predictor(source[i])) {
                    return true
                }
            }
            return false
        }
        export var map = <T, U>(source: T[], mapper: (T) => U): U[]=> {
            var ret = Array<U>(), i: number;
            var sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                ret[i] = mapper(source[i]);
            }
            return ret
        }
        export var findIndex = <T>(source: T[], predictor: (T) => boolean): number => {
            var i, sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                if (predictor(source[i])) {
                    return i;
                }
            }
            return -1;
        }
        export var findIndexTuple = <T>(source: T[], predictor: (T) => boolean): [number, any]=> {
            var i, sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                if (predictor(source[i])) {
                    return [i, source[i]];
                }
            }
            return [-1, null];
        }
        export var filter = <T>(source: T[], predictor: (T) => boolean): T[]=> {
            var ret = Array<T>(), i: number;
            var sourceLength = source.length;
            for (i = 0; i < sourceLength; i++) {
                if (predictor(source[i])) {
                    ret.push(source[i]);
                }
            }
            return ret;
        }
        export var clone = <T>(source: T[]) => {
            return map(source, utils.id)
        }
        export var sequenceEqual = <T, TId>(source: T[], target: T[], idSelector: (T) => TId) => {
            var sourceIds = utils.array.map(source, idSelector)
            var targetIds = utils.array.map(target, idSelector)
            var diff = ko.utils.compareArrays(sourceIds, targetIds)
            return !utils.array.any(diff, (item) => item.hasOwnProperty('index'))
        }
    }

    export module component {
        export var checkComponentInited = (element: Element, componentTypeName: string): boolean => {
            return !!$.data(element, componentTypeName)
        }
        export var initComponent = (element: Element, componentTypeName: string, allBindingsAccessor: KnockoutAllBindingsAccessor, extOptions?): JQuery => {
            var allBindings = allBindingsAccessor()
            var options = allBindings['easyuiOptions'] || {}
            if (object.isFunction(options)) {
                options = options()
            }
            if (extOptions) {
                options=$.extend({},extOptions,options)
            }
            $(element)[componentTypeName](options)
            return $(element)
        }
        export var ensureComponentInited = (element: Element, componentTypeName: string, allBindingsAccessor: KnockoutAllBindingsAccessor, extOptions?): void => {
            if (!component.checkComponentInited(element, componentTypeName)) {
                component.initComponent(element, componentTypeName, allBindingsAccessor, extOptions);
            }
        }
        export var bindDisposeEvent = (element: Element, componentTypeName: string): void => {
            ko.utils.domNodeDisposal.addDisposeCallback(
                element,
                () => {
                    if (component.checkComponentInited(element, componentTypeName)) {
                        $(element)[componentTypeName]('destroy')
                    }
                })
        }
    }

    export module tree {
        export interface TreeNode<T> {//TODO: 移动到合适的.d.ts
            //tree 只支持以下属性
            id: any
            text: any
            state: any
            checked: any
            attributes: any
            children: TreeNode<T>[]
        }
        export var treeToArray = <T>(tree: TreeNode<T>[]) => {
            var tmpNodes = Array<TreeNode<T>>()
            var innerTreeToNodes = (nodes: TreeNode<T>[]) => {
                array.each(nodes, (node) => {
                    tmpNodes.push(node)
                    if (node.children) {
                        innerTreeToNodes(node.children)
                    }
                })
            }
            innerTreeToNodes(tree)
            return tmpNodes
        }
        export var clone = <T>(tree: TreeNode<T>[]) => {
            var innerClone = (nodes: TreeNode<T>[]) => {
                var clonedTree = array.map(nodes, (node) => {
                    var clonedNode: TreeNode<T> = {
                        id: node.id,
                        text: node.text,
                        state: node.state,
                        checked: node.checked,
                        attributes: node.attributes,
                        children: null
                    }
                    if (node.children)
                        clonedNode.children = innerClone(node.children)
                    else {
                        clonedNode.children = []
                    }
                    return clonedNode
                })
                return clonedTree
            }
            return innerClone(tree)
        }
    }

    export module func {
        export var debounce = (func: Function, wait: number, immediate: boolean) => {//此方法从underscore复制而来
            var timeout: number;
            var args: IArguments;
            var context: any;
            var timestamp;
            var result;
            var later = () => {
                var last = utils.now() - timestamp
                if (last < wait && last >= 0)
                    timeout = setTimeout(later, wait - last)
                else
                    timeout = 0
                if (!immediate) {
                    result = func.apply(context, args)
                    if (!timeout) context = args = null
                }
            }
            return function () {
                context = this;
                args = arguments;
                timestamp = utils.now()
                var callNow = immediate && !timeout
                if (!timeout) {
                    timeout = setTimeout(later, wait)
                }
                if (callNow) {
                    result = func.apply(context, args)
                    context = args = null
                }
                return result
            }
        }

        export var safeApply = (func: Function, context: any, ...args: any[]) => {
            if (object.isFunction(func)) {
                func.apply(context, args);
            }
        }
    }

    export var convertToString = (value: any): string => {
        if (!(object.isNull(value) || object.isUndefined(value)))
            return value + ''
        else
            return ''
    }

    export var now = Date.now || (() => new Date().getTime())

    export var id = <T>(item: T) => item
}