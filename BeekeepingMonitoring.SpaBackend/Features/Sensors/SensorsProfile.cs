using AutoMapper;
using JetBrains.Annotations;

namespace BeekeepingMonitoring.SpaBackend.Features.Sensors;

[UsedImplicitly]
public class SensorsProfile : Profile
{
    public SensorsProfile()
    {
        CreateMap<Sensor, SensorIdentifier>();

        CreateMap<SensorsController.CreateModel, Sensor>(MemberList.Source)
            ;

        CreateMap<SensorsController.UpdateModel, Sensor>(MemberList.Source)
            .ReverseMap()
            ;

        CreateMap<Sensor, SensorsController.ListModel>()
            ;

        CreateMap<Sensor, SensorReferenceModel>()
            ;

        CreateMap<Sensor, SensorsController.DetailsModel>()
            ;
    }
}