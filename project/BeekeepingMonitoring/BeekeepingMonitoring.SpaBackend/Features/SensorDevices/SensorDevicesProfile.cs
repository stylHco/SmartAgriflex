using AutoMapper;
using JetBrains.Annotations;

namespace BeekeepingMonitoring.SpaBackend.Features.SensorDevices;

[UsedImplicitly]
public class SensorDevicesProfile : Profile
{
    public SensorDevicesProfile()
    {
        CreateMap<SensorDevice, SensorDeviceIdentifier>();

        CreateMap<SensorDevicesController.CreateModel, SensorDevice>(MemberList.Source)
            ;

        CreateMap<SensorDevicesController.UpdateModel, SensorDevice>(MemberList.Source)
            .ReverseMap()
            ;

        CreateMap<SensorDevice, SensorDevicesController.ListModel>()
            ;

        CreateMap<SensorDevice, SensorDeviceReferenceModel>()
            ;

        CreateMap<SensorDevice, SensorDevicesController.DetailsModel>()
            ;
    }
}