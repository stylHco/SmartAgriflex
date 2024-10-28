using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BeekeepingMonitoring.SpaBackend.Helpers;

public static class ControllerHelpers
{
    /// <summary>
    /// Checks that each identifier was used at most once and that each one has an associated entity.
    /// </summary>
    /// <param name="entitiesByIdentifier">
    /// Result of <c>EfCoreHelpers.GetForIdentifiers</c>
    /// </param>
    public static void ValidateManyToMany<TModel, TEntry, TIdentifier, TEntity>(
        ModelStateDictionary modelState,
        TModel model,
        IDictionary<TIdentifier, TEntity> entitiesByIdentifier,
        [InstantHandle] Func<TModel, IList<TEntry>> entriesGetter,
        [InstantHandle] Func<TEntry, TIdentifier> identifierGetter,
        [InstantHandle] Func<int, Expression<Func<TModel, object>>> errorLocationProvider
    )
    {
        IList<TEntry> entries = entriesGetter(model);

        HashSet<TIdentifier> duplicatedIdentifiers = entries
            .Select(identifierGetter)
            .GetDuplicates()
            .ToHashSet();

        for (int i = 0; i < entries.Count; i++)
        {
            TIdentifier identifier = identifierGetter(entries[i]);

            if (!entitiesByIdentifier.ContainsKey(identifier))
            {
                modelState.AddModelError(
                    errorLocationProvider(i),
                    "not found" // TODO: better message
                );
            }
            else if (duplicatedIdentifiers.Contains(identifier))
            {
                modelState.AddModelError(
                    errorLocationProvider(i),
                    "multiples not permitted" // TODO: better message
                );
            }
        }
    }
    
    public static void ValidateNoDuplicate<TModel, TEntry, TIdentifier>(
        ModelStateDictionary modelState,
        TModel model,
        [InstantHandle] Func<TModel, IList<TEntry>> entriesGetter,
        [InstantHandle] Func<TEntry, TIdentifier> identifierGetter,
        [InstantHandle] Func<int, Expression<Func<TModel, object>>> errorLocationProvider
    )
    {
        IList<TEntry> entries = entriesGetter(model);

        HashSet<TIdentifier> duplicatedIdentifiers = entries
            .Select(identifierGetter)
            .GetDuplicates()
            .ToHashSet();

        for (int i = 0; i < entries.Count; i++)
        {
            TIdentifier identifier = identifierGetter(entries[i]);

            if (duplicatedIdentifiers.Contains(identifier))
            {
                modelState.AddModelError(
                    errorLocationProvider(i),
                    "multiples not permitted" // TODO: better message
                );
            }
        }
    }
}