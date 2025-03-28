using Microsoft.AspNetCore.Builder;

namespace SmartAgriFlex.SpaBackend;

public static class Program
{
    public const string ProjectName = "SmartAgriFlex";

    public static void Main(string[] args)
    {
        WebApplication app = Bootstrapper.BuildApp(args);

        app.Run();
    }
}