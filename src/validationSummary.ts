/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="util/utils.ts" />

ko.bindingHandlers["validationSummary"] = <KnockoutBindingHandler>{
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
        setInterval(()=>{
            var errors=[];
            var invalidElements = $(element).find('.validatebox-invalid');
            $.each(invalidElements, (index, iElem)=>{
                if($(iElem).data('validatebox')){
                    errors.push($(iElem).data('validatebox').message)
                }
            })
            valueAccessor()(errors)
        },100)
    }
}