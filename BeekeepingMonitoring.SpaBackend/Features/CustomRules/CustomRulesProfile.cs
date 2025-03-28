using AutoMapper;
using JetBrains.Annotations;

namespace BeekeepingMonitoring.SpaBackend.Features.CustomRules;

[UsedImplicitly]
public class CustomRulesProfile : Profile
{
    public CustomRulesProfile()
    {
        CreateMap<CustomRule, CustomRuleIdentifier>();

        CreateMap<CustomRulesController.CreateModel, CustomRule>(MemberList.Source)
            ;

        CreateMap<CustomRulesController.UpdateModel, CustomRule>(MemberList.Source)
            .ReverseMap()
            ;

        CreateMap<CustomRule, CustomRulesController.ListModel>()
            ;

        CreateMap<CustomRule, CustomRuleReferenceModel>()
            ;

        CreateMap<CustomRule, CustomRulesController.DetailsModel>()
            ;
    }
}