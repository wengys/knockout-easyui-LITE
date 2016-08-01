/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["panel"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        utils.component.ensureComponentInited(element, "panel", allBindingsAccessor, ko.unwrap(valueAccessor()));
    }
}