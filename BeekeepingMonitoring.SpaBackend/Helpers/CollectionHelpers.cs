using System;
using System.Collections.Generic;
using System.Linq;

namespace BeekeepingMonitoring.SpaBackend.Helpers;

public static class CollectionHelpers
{
    public static TValue GetOrCreate<TKey, TValue>(
        this IDictionary<TKey, TValue> dictionary,
        TKey key,
        Func<TValue> valueFactory
    )
    {
        return GetOrCreate(dictionary, key, _ => valueFactory());
    }

    public static TValue GetOrCreate<TKey, TValue>(
        this IDictionary<TKey, TValue> dictionary,
        TKey key,
        Func<TKey, TValue> valueFactory
    )
    {
        if (!dictionary.ContainsKey(key))
        {
            dictionary[key] = valueFactory(key);
        }

        return dictionary[key];
    }

    /// <summary>
    /// Creates a new dictionary where the keys become values and values become keys (pairwise).
    /// The original dictionary is not modified.
    /// </summary>
    /// <exception cref="ArgumentException">The original dictionary had duplicate values</exception>
    public static Dictionary<TOriginalValue, TOriginalKey> Invert<TOriginalKey, TOriginalValue>(
        this IDictionary<TOriginalKey, TOriginalValue> originalDictionary
    )
        where TOriginalValue : notnull
    {
        return originalDictionary.ToDictionary(pair => pair.Value, pair => pair.Key);
    }
}