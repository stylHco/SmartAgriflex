using AutoMapper;
using JetBrains.Annotations;

namespace BeekeepingMonitoring.SpaBackend.Features.Devices;

[UsedImplicitly]
public class DevicesProfile : Profile
{
    public DevicesProfile()
    {
        CreateMap<Device, DeviceIdentifier>();

        CreateMap<DevicesController.CreateModel, Device>(MemberList.Source)
            ;

        CreateMap<DevicesController.UpdateModel, Device>(MemberList.Source)
            .ReverseMap()
            ;

        CreateMap<Device, DevicesController.ListModel>()
            ;

        CreateMap<Device, DeviceReferenceModel>()
            ;

        CreateMap<Device, DevicesController.DetailsModel>()
            ;
    }
}