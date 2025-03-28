using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SmartAgriFlex.SpaBackend.Helpers;

public static class EfCoreHelpers
{
    /// <summary>
    /// Fetches the DB-mapped entities that are represented by <paramref name="identifiers"/>.
    /// </summary>
    /// <param name="entitiesSource">
    /// A queryable which will be used to fetch the entities from the database.
    /// Usually this will be a <see cref="DbSet{TEntity}"/> but can also be 
    /// configured with <c>.Include()</c> or other options if needed.
    /// </param>
    /// <param name="identifiers">
    /// The identifiers for which entities will be fetched.
    /// This list will automatically be <c>.Distinct()</c>ed.
    /// Each identifier must correspond to at most 1 entity.
    /// </param>
    /// <param name="rowPredicateProvider">
    /// A provider of a DB-translatable filter that will be used to map between
    /// an identifier and the associated entity. 
    /// </param>
    /// <typeparam name="TIdentifier">
    /// The type of the identifiers. This must behave with value semantics as it will be used as
    /// a dictionary key (and in <c>.Distinct()</c>).
    /// </typeparam>
    /// <typeparam name="TEntity">Entity type that is mapped to database.</typeparam>
    /// <returns>
    /// A dictionary of identifiers to entities.
    /// Identifiers for which no entity was found will not be added to this dictionary.  
    /// </returns>
    /// <remarks>
    /// This was created for M2M controller plumbing, but can be used for other purposes as well.
    /// </remarks>
    // TODO: better name
    // ==== Performance/optimization considerations ===
    // When thinking about performance of this logic, there are 3 key metrics:
    // * Database round trips (individual queries)
    // * Query execution plan caching ("query caching" from now on)
    // * Minimizing the number of (or eliminating entirely) non-matching
    // entities being sent over and hydrated by the ORM.  
    // 
    // There are 3 approaches, each with its own drawbacks:
    // 1) A query per ID (current implementation). This can cause excessive network traffic
    // (especially if a malicious user crafts a request with a huge list of IDs) but is very
    // query caching friendly as it's the exact same query, just the ID param values are different.
    // 2) A single query with a N amount of ORs or UNIONs. This solves the round trip issue
    // and is resistant to malicious input but effectively no query caching is possible.
    // 2.1) An IN statement can also be used, but this cannot support composite PKs.
    // 2.2) It's possible to do a single IN statement per PK field, but this is arguably the worst
    // possible approach as it can also cause a potentially infinite amount of non-matching
    // entities being sent over.
    // 3) https://github.com/yv989c/BlazarTech.QueryableValues which solves the above issues by
    // (ab)using SqlServer's XML functionality but (a) is limited to SqlServer (b) I don't want
    // to take a dependency on a low-popularity library without a good reason.
    //
    // Also important to note that minimizing the number of round trips (current implementation's
    // drawback) is of limited use as EF Core itself will issue a query per each join table row
    // that needs to be added/updated/deleted.
    public static async Task<IDictionary<TIdentifier, TEntity>> GetForIdentifiers<TIdentifier, TEntity>(
        this IQueryable<TEntity> entitiesSource,
        IEnumerable<TIdentifier> identifiers,
        Func<TIdentifier, Expression<Func<TEntity, bool>>> rowPredicateProvider
    )
        where TEntity : class
        where TIdentifier : IEquatable<TIdentifier>
    {
        Dictionary<TIdentifier, TEntity> result = new();

        foreach (TIdentifier identifier in identifiers.Distinct())
        {
            TEntity? entity = await entitiesSource.FirstOrDefaultAsync(rowPredicateProvider(identifier));

            if (entity != null)
            {
                result[identifier] = entity;
            }
        }

        return result;
    }

    /// <summary>
    /// Marks the entity as keyless and excludes it from migrations 
    /// </summary>
    public static void QueryResultOnly(this EntityTypeBuilder builder)
    {
        builder.HasNoKey();

        // https://github.com/dotnet/EntityFramework.Docs/issues/4144#issuecomment-1318520376
        string tableName = $"_______NON_EXISTING_TABLE_{builder.Metadata.Name}";
        builder.ToTable(tableName, tableBuilder => tableBuilder.ExcludeFromMigrations());
    }
}