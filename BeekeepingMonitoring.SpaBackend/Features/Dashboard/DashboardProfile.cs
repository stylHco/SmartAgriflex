using AutoMapper;
using AutoMapper.EquivalencyExpression;
using JetBrains.Annotations;

namespace BeekeepingMonitoring.SpaBackend.Features.Dashboard;

[UsedImplicitly]
public class DashboardProfile : Profile
{
    public DashboardProfile()
    {
        CreateMap<ConfigurableDashboardController.CreateModel, ConfigurableDashboard>(MemberList.Source);

        CreateMap<ConfigurableDashboard, ConfigurableDashboardController.ListModel>();
        CreateMap<ConfigurableDashboard, ConfigurableDashboardController.DetailsModel>();

        CreateMap<ConfigurableDashboardTile, ConfigurableDashboardController.TileDetailsModel>();

        CreateMap<ConfigurableDashboardController.TileUpdateModel, ConfigurableDashboardTile>(MemberList.Source)
            .EqualityComparison((dto, entity) => dto.Id == entity.Id)
            .ForSourceMember(model => model.TempId, opts => opts.DoNotValidate())
            .AfterMap((dto, entity, context) =>
            {
                if (dto.TempId is null) return;

                // Currently we don't expect to invoke this mapping without the dictionary set. 
                // ReSharper disable once SuggestVarOrType_SimpleTypes - explicit cast
                var createdTiles = (ConfigurableDashboardController.CreatedTiles)
                    context.Items[ConfigurableDashboardController.CreatedTilesMapKey];

                createdTiles[dto] = entity;
            });
    }
}