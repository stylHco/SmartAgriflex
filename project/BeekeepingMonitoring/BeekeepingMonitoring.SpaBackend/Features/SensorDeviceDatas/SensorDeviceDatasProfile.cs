using AutoMapper;
using JetBrains.Annotations;

namespace BeekeepingMonitoring.SpaBackend.Features.SensorDeviceDatas;

[UsedImplicitly]
public class SensorDeviceDatasProfile : Profile
{
    public SensorDeviceDatasProfile()
    {
        CreateMap<SensorDeviceData, SensorDeviceDataIdentifier>();

        CreateMap<SensorDeviceDatasController.CreateModel, SensorDeviceData>(MemberList.Source)
            ;

        CreateMap<SensorDeviceDatasController.UpdateModel, SensorDeviceData>(MemberList.Source)
            .ReverseMap()
            ;

        CreateMap<SensorDeviceData, SensorDeviceDatasController.ListModel>()
            ;

        CreateMap<SensorDeviceData, SensorDeviceDataReferenceModel>()
            ;

        CreateMap<SensorDeviceData, SensorDeviceDatasController.DetailsModel>()
            ;
    }
}