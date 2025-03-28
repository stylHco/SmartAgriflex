using System;
using System.Collections.Generic;
using System.Linq;

namespace BeekeepingMonitoring.SpaBackend.Features.Dashboard;

public static class HierarchicalData
{
    public const string SurrogateRootValue = "___ROOT";
    
    public delegate TNode NodeFactory<TRow, TNode>(int level, object levelValue, IEnumerable<TRow> matchingRows,
        IEnumerable<TNode> childNodes);

    /// <summary>
    /// Derives the tree using <paramref name="levelSelectors"/> and walks it depth-first,
    /// generating the <typeparamref name="TNode"/>s.
    /// </summary>
    /// <param name="levelSelectors">The returned values must be comparable using the default equality comparer</param>
    /// <returns>The top level nodes</returns>
    public static IReadOnlyList<TNode> TabularToHierarchical<TRow, TNode>(
        IEnumerable<TRow> allRows,
        NodeFactory<TRow, TNode> nodeFactory,
        bool surrogateRoot,
        params Func<TRow, object>[] levelSelectors
    )
    {
        TNode[] level0Nodes = BuildChildNodes(0, allRows).ToArray();
        TNode[] rootNodes = level0Nodes;

        if (surrogateRoot)
        {
            rootNodes = new[] { nodeFactory(-1, SurrogateRootValue, allRows, level0Nodes) };
        }

        return rootNodes;

        IEnumerable<TNode> BuildChildNodes(int level, IEnumerable<TRow> parentNodeRows)
        {
            if (level > levelSelectors.Length - 1) yield break;

            IEnumerable<IGrouping<object, TRow>> groupings = parentNodeRows
                .GroupBy(levelSelectors[level]);

            foreach (IGrouping<object, TRow> grouping in groupings)
            {
                yield return nodeFactory(
                    level,
                    grouping.Key,
                    grouping,
                    BuildChildNodes(level + 1, grouping)
                );
            }
        }
    }
}