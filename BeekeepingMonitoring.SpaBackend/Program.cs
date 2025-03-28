using Microsoft.AspNetCore.Builder;

namespace BeekeepingMonitoring.SpaBackend;

public static class Program
{
    public const string ProjectName = "BeekeepingMonitoring";

    public static void Main(string[] args)
    {
        WebApplication app = Bootstrapper.BuildApp(args);

        app.Run();
    }
}