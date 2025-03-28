using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MailKitSimplified.Sender.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.Web.HtmlRendering;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace SmartAgriFlex.SpaBackend.Emails;

public interface IEmailHelper
{
    Task<string> Render<T>(IDictionary<string, object?> parameters)
        where T : IComponent;

    InternetAddress GetDefaultFrom();
}

[AutoConstructor]
[RegisterTransient]
public partial class EmailHelper : IEmailHelper
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILoggerFactory _loggerFactory;
    private readonly IConfiguration _configuration;

    public async Task<string> Render<T>(IDictionary<string, object?> parameters)
        where T : IComponent
    {
        await using HtmlRenderer htmlRenderer = new(_serviceProvider, _loggerFactory);

        return await htmlRenderer.Dispatcher.InvokeAsync(async () =>
        {
            ParameterView parameterView = ParameterView.FromDictionary(parameters);
            HtmlRootComponent output = await htmlRenderer.RenderComponentAsync<T>(parameterView);

            return output.ToHtmlString();
        });
    }

    public InternetAddress GetDefaultFrom()
    {
        return new MailboxAddress(_configuration["App:DefaultProjectName"], _configuration["App:Email:DefaultFromAddress"]);
    }
}

public static class EmailExtension
{
    public static IEmailWriter DefaultFrom(this IEmailWriter emailWriter, IEmailHelper helper)
    {
        emailWriter.MimeMessage.From.Add(helper.GetDefaultFrom());

        return emailWriter;
    }
}