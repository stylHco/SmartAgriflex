using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace SmartAgriFlex.SpaBackend.Helpers;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class ErrorIfAuthenticated : Attribute, IResourceFilter
{
    public void OnResourceExecuting(ResourceExecutingContext context)
    {
        if (!context.HttpContext.User.Identity!.IsAuthenticated) return;

        ProblemDetailsFactory problemDetailsFactory = context.HttpContext.RequestServices
            .GetRequiredService<ProblemDetailsFactory>();

        ProblemDetails problemDetails = problemDetailsFactory.CreateProblemDetails(
            context.HttpContext,
            statusCode: 400,
            detail: "This API is only for unauthenticated access"
        );

        context.Result = new BadRequestObjectResult(problemDetails)
        {
            StatusCode = problemDetails.Status,
        };
    }

    public void OnResourceExecuted(ResourceExecutedContext context)
    {
    }
}