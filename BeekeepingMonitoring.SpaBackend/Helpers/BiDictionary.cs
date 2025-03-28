using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace BeekeepingMonitoring.SpaBackend.Helpers;

// Partially inspired by https://codereview.stackexchange.com/questions/227474/bidirectional-map-in-c
// and https://github.com/farlee2121/BidirectionalMap/blob/4d0b33fe2303f00f061aac7637264d38dd8a36e8/BidirectionalMap/BiMap.cs

public interface IReadOnlyBiDictionary<TForwardKey, TReverseKey>
    where TForwardKey : notnull
    where TReverseKey : notnull
{
    IReadOnlyDictionary<TForwardKey, TReverseKey> Forward { get; }
    IReadOnlyDictionary<TReverseKey, TForwardKey> Reverse { get; }
}

public interface IBiDictionary<TForwardKey, TReverseKey> : IReadOnlyBiDictionary<TForwardKey, TReverseKey>
    where TForwardKey : notnull
    where TReverseKey : notnull
{
    new BiDictionaryPerspective<TForwardKey, TReverseKey> Forward { get; }
    new BiDictionaryPerspective<TReverseKey, TForwardKey> Reverse { get; }
}

public class BiDictionary<TForwardKey, TReverseKey> : IBiDictionary<TForwardKey, TReverseKey>
    where TForwardKey : notnull
    where TReverseKey : notnull
{
    private readonly IDictionary<TForwardKey, TReverseKey> _backingForward;
    private readonly IDictionary<TReverseKey, TForwardKey> _backingReverse;

    public BiDictionaryPerspective<TForwardKey, TReverseKey> Forward { get; }
    public BiDictionaryPerspective<TReverseKey, TForwardKey> Reverse { get; }

    IReadOnlyDictionary<TForwardKey, TReverseKey> IReadOnlyBiDictionary<TForwardKey, TReverseKey>.Forward => Forward;
    IReadOnlyDictionary<TReverseKey, TForwardKey> IReadOnlyBiDictionary<TForwardKey, TReverseKey>.Reverse => Reverse;

    public BiDictionary() : this(0)
    {
    }

    public BiDictionary(int capacity)
    {
        _backingForward = new Dictionary<TForwardKey, TReverseKey>(capacity);
        _backingReverse = new Dictionary<TReverseKey, TForwardKey>(capacity);

        Forward = new ForwardDictionary(this);
        Reverse = new BackwardsDictionary(this);
    }

    private void Add(TForwardKey forwardKey, TReverseKey reverseKey)
    {
        if (forwardKey == null) throw new ArgumentNullException(nameof(forwardKey));
        if (reverseKey == null) throw new ArgumentNullException(nameof(reverseKey));

        if (_backingForward.ContainsKey(forwardKey))
        {
            throw new ArgumentException(
                $"{forwardKey} already present in the dictionary",
                nameof(forwardKey)
            );
        }

        if (_backingReverse.ContainsKey(reverseKey))
        {
            throw new ArgumentException(
                $"{reverseKey} already present in the dictionary",
                nameof(reverseKey)
            );
        }

        _backingForward.Add(forwardKey, reverseKey);
        _backingReverse.Add(reverseKey, forwardKey);
    }

    private void Set(TForwardKey forwardKey, TReverseKey reverseKey)
    {
        if (forwardKey == null) throw new ArgumentNullException(nameof(forwardKey));
        if (reverseKey == null) throw new ArgumentNullException(nameof(reverseKey));

        _backingForward[forwardKey] = reverseKey;
        _backingReverse[reverseKey] = forwardKey;
    }

    private bool Remove(TForwardKey forwardKey)
    {
        if (forwardKey == null) throw new ArgumentNullException(nameof(forwardKey));

        // ReSharper disable once InvertIf
        if (_backingForward.TryGetValue(forwardKey, out TReverseKey? reverseKey))
        {
            _backingForward.Remove(forwardKey);
            _backingReverse.Remove(reverseKey);

            return true;
        }

        return false;
    }

    private bool Remove(TReverseKey reverseKey)
    {
        if (reverseKey == null) throw new ArgumentNullException(nameof(reverseKey));

        // ReSharper disable once InvertIf
        if (_backingReverse.TryGetValue(reverseKey, out TForwardKey? forwardKey))
        {
            _backingForward.Remove(forwardKey);
            _backingReverse.Remove(reverseKey);

            return true;
        }

        return false;
    }

    private void Clear()
    {
        _backingForward.Clear();
        _backingReverse.Clear();
    }

    private class ForwardDictionary : BiDictionaryPerspective<TForwardKey, TReverseKey>
    {
        private readonly BiDictionary<TForwardKey, TReverseKey> _owner;

        public ForwardDictionary(BiDictionary<TForwardKey, TReverseKey> owner)
            : base(owner._backingForward)
        {
            _owner = owner;
        }

        public override void Add(TForwardKey key, TReverseKey value)
        {
            _owner.Add(key, value);
        }

        protected override void Set(TForwardKey key, TReverseKey value)
        {
            _owner.Set(key, value);
        }

        public override bool Remove(TForwardKey key)
        {
            return _owner.Remove(key);
        }

        public override void Clear()
        {
            _owner.Clear();
        }
    }

    private class BackwardsDictionary : BiDictionaryPerspective<TReverseKey, TForwardKey>
    {
        private readonly BiDictionary<TForwardKey, TReverseKey> _owner;

        public BackwardsDictionary(BiDictionary<TForwardKey, TReverseKey> owner)
            : base(owner._backingReverse)
        {
            _owner = owner;
        }

        public override void Add(TReverseKey key, TForwardKey value)
        {
            _owner.Add(value, key);
        }

        protected override void Set(TReverseKey key, TForwardKey value)
        {
            _owner.Set(value, key);
        }

        public override bool Remove(TReverseKey key)
        {
            return _owner.Remove(key);
        }

        public override void Clear()
        {
            _owner.Clear();
        }
    }
}

public abstract class BiDictionaryPerspective<TKey, TValue> :
    IDictionary<TKey, TValue>,
    IReadOnlyDictionary<TKey, TValue>
    where TKey : notnull
    where TValue : notnull
{
    private readonly IDictionary<TKey, TValue> _backingDictionary;

    private protected BiDictionaryPerspective(IDictionary<TKey, TValue> backingDictionary)
    {
        _backingDictionary = backingDictionary;
    }

    public abstract void Add(TKey key, TValue value);

    protected abstract void Set(TKey key, TValue value);

    public abstract bool Remove(TKey key);

    public abstract void Clear();

    #region CommmonImplementation

    public void Add(KeyValuePair<TKey, TValue> item)
    {
        Add(item.Key, item.Value);
    }

    public TValue this[TKey key]
    {
        get => _backingDictionary[key];
        set => Set(key, value);
    }

    public bool Remove(KeyValuePair<TKey, TValue> item)
    {
        return Remove(item.Key);
    }

    #endregion

    #region Proxy

    public bool ContainsKey(TKey key)
    {
        return _backingDictionary.ContainsKey(key);
    }

    public bool TryGetValue(TKey key, [MaybeNullWhen(false)] out TValue value)
    {
        return _backingDictionary.TryGetValue(key, out value);
    }

    public void CopyTo(KeyValuePair<TKey, TValue>[] array, int arrayIndex)
    {
        _backingDictionary.CopyTo(array, arrayIndex);
    }

    public int Count => _backingDictionary.Count;

    public bool IsReadOnly => _backingDictionary.IsReadOnly;

    public bool Contains(KeyValuePair<TKey, TValue> item)
    {
        return _backingDictionary.Contains(item);
    }

    public IEnumerator<KeyValuePair<TKey, TValue>> GetEnumerator()
    {
        return _backingDictionary.GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }

    public ICollection<TValue> Values => _backingDictionary.Values;
    public ICollection<TKey> Keys => _backingDictionary.Keys;

    IEnumerable<TKey> IReadOnlyDictionary<TKey, TValue>.Keys => Keys;
    IEnumerable<TValue> IReadOnlyDictionary<TKey, TValue>.Values => Values;

    #endregion
}