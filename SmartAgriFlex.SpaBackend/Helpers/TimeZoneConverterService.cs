using System;
using NodaTime;

namespace SmartAgriFlex.SpaBackend.Helpers;

[RegisterScoped]
public class TimeZoneConverterService
{
    private const string TimeZoneId = "Asia/Nicosia";
    
    public LocalDate ConvertToCurrentTimezone(DateTime date)
    {
        var timeZone = DateTimeZoneProviders.Tzdb[TimeZoneId];
        var instant = Instant.FromDateTimeUtc(date.ToUniversalTime());

        var zonedDateTime = instant.InZone(timeZone);
    
        return zonedDateTime.Date;
    }
}