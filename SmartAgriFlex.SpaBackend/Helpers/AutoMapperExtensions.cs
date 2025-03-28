using System;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using AutoMapper.QueryableExtensions;

namespace SmartAgriFlex.SpaBackend.Helpers;

public static class AutoMapperExtensions
{
    public static IQueryable<TDestination> ProjectTo<TDestination>(
        this IQueryable source,
        IMapper mapper,
        params Expression<Func<TDestination, object>>[] membersToExpand
    )
    {
        return source.ProjectTo(mapper.ConfigurationProvider, membersToExpand);
    }
}