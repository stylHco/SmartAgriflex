using System;
using System.Threading;
using System.Threading.Tasks;
using MailKit;
using MailKit.Net.Smtp;
using MailKitSimplified.Sender;
using MailKitSimplified.Sender.Abstractions;
using MailKitSimplified.Sender.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MimeKit;

namespace BeekeepingMonitoring.SpaBackend;

public static partial class Bootstrapper
{
    private static void ConfigureEmail(WebApplicationBuilder builder)
    {
        IServiceCollection services = builder.Services;

        if (!builder.Configuration.GetSection(EmailSenderOptions.SectionName).Exists())
        {
            Console.Error.WriteLine(
                EmailSenderOptions.SectionName + " configuration section was not provided. Email sending will not work."
            );

            services.AddSingleton<ISmtpSender, ThrowingEmailSender>();
            return;
        }

        services.AddMailKitSimplifiedEmailSender(builder.Configuration);
    }
}

file class ThrowingEmailSender : ISmtpSender
{
    public ValueTask DisposeAsync()
    {
        return ValueTask.CompletedTask;
    }

    public void Dispose()
    {
    }

    private static Exception Exception()
    {
        return new Exception(EmailSenderOptions.SectionName + " configuration section was not provided ");
    }

    public IEmailWriter WithTemplate(MimeMessage mimeMessageTemplate) => throw Exception();

    public Task<IEmailWriter> WithTemplateAsync(string fileName = "template.eml",
        CancellationToken cancellationToken = new()) => throw Exception();

    public ValueTask<ISmtpClient> ConnectSmtpClientAsync(CancellationToken cancellationToken = new()) =>
        throw Exception();

    public Task SendAsync(MimeMessage mimeMessage, CancellationToken cancellationToken = new(),
        ITransferProgress transferProgress = null) => throw Exception();

    public Task<bool> TrySendAsync(MimeMessage mimeMessage, CancellationToken cancellationToken = new(),
        ITransferProgress transferProgress = null) => throw Exception();

    public IEmailWriter WriteEmail => throw Exception();

    public ISmtpClient SmtpClient => throw Exception();
}