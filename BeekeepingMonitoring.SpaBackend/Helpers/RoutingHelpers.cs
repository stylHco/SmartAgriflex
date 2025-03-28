using Microsoft.AspNetCore.Http;

namespace BeekeepingMonitoring.SpaBackend.Helpers;

public static class RoutingHelpers
{
    public const string ApiRoutePrefix = "/_api";

    public static bool IsSpaRequest(this HttpContext context)
    {
        // Do not forward typo-d api requests to the SPA
        if (context.Request.Path.StartsWithSegments(ApiRoutePrefix))
        {
            return false;
        }

        // If an endpoint has been found in the C# app, the request shouldn't hit the SPA
        if (context.GetEndpoint() != null)
        {
            return false;
        }

        return true;
    }

    public static bool IsApiRequest(this HttpContext context)
    {
        // Currently we assume that a request can be only API or SPA
        return !IsSpaRequest(context);
    }
}