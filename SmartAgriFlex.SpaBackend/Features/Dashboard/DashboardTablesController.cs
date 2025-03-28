using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAgriFlex.SpaBackend.Data;
using SmartAgriFlex.SpaBackend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NJsonSchema.Annotations;

namespace SmartAgriFlex.SpaBackend.Features.Dashboard;

[ApiController]
[Route(RoutingHelpers.ApiRoutePrefix + "/dashboard-tables")]
[Authorize]
[AutoConstructor]
[ResponseCache(NoStore = true)]
public partial class DashboardTablesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    #region AssociationRules

    [HttpGet("association-rules")]
    public async Task<IList<AssociationRule>> AssociationRules()
    {
        return await _dbContext.MinerAssocRules
            .Select(record => new AssociationRule
            {
                Rule = record.Rule,
                Confidence = record.Confidence,
                Support = record.Support,
                Lift = record.Lift,
            })
            .ToArrayAsync();
    }

    [JsonSchema("DashboardTableAssociationRule")]
    public record AssociationRule
    {
        public required string Rule { get; init; }

        public required double Confidence { get; init; }
        public required double Support { get; init; }
        public required double Lift { get; init; }
    }

    #endregion
}