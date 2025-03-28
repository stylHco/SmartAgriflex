using System;
using System.Collections.Generic;
using System.Linq;

namespace SmartAgriFlex.SpaBackend.Helpers;

public static class EnumerableExtensions
{
    public static IEnumerable<T> GetDuplicates<T>(this IEnumerable<T> source, IEqualityComparer<T>? comparer = null)
    {
        HashSet<T> seenItems = new(comparer);
        HashSet<T> reportedItems = new(comparer);

        foreach (T item in source)
        {
            // If we added the item, then it's the first time we saw it
            if (seenItems.Add(item)) continue;

            // If we couldn't add the item, then it was already added (reported) before
            if (!reportedItems.Add(item)) continue;

            // First time reporting this item
            yield return item;
        }
    }

    public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T?> source)
        where T : class
    {
        // Here we (ab)use the fact that .OfType() uses `is`, which fails on nulls.
        // This is more efficient than .Where(x => x is not null) as this
        // approach avoids a function call per element.

        // ReSharper disable once RedundantEnumerableCastCall
        return source.OfType<T>();
    }

    public static IEnumerable<T> InsertBetween<T>(this IEnumerable<T> source, T betweenValue)
        => InsertBetween(source, () => betweenValue);

    public static IEnumerable<T> InsertBetween<T>(this IEnumerable<T> source, Func<T> betweenValueFactory)
    {
        bool firstItem = true;
        foreach (T item in source)
        {
            if (!firstItem)
            {
                yield return betweenValueFactory();
            }

            yield return item;

            firstItem = false;
        }
    }
}