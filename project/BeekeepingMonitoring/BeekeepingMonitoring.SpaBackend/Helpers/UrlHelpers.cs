using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeekeepingMonitoring.SpaBackend.Helpers;

public static class UrlHelpers
{
    public static string RelativeToAbsolute(this IUrlHelper urlHelper, string relative)
    {
        HttpRequest request = urlHelper.ActionContext.HttpContext.Request;

        return string.Concat(
            request.Scheme,
            "://",
            request.Host.ToUriComponent(),
            relative
        );
    }
}