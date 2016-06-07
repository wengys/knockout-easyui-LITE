/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["window"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        setTimeout(function(){
            utils.component.ensureComponentInited(element, "window", allBindingsAccessor,{"closed":true});
            $.data(element).panel.options.onBeforeClose = function () {
                valueAccessor()(false);
            }
            ko.computed(function(){
                var value = ko.unwrap(valueAccessor())
                if (value) {
                    //setTimeout(function(){
                        $(element)["window"]('open')
                    //},1)
                } else {
                    //setTimeout(function(){
                        $(element)["window"]('close')
                    //},1)
                }

            })
        },1)
    }
}