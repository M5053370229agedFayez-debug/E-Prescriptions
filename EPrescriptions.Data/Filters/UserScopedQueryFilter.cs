using System;
using EPrescriptions.Domain.Entities;

namespace EPrescriptions.Data.Filters
{
    public static class UserScopedQueryFilter
    {
        public static string ApplyUserScope(string baseSql, User currentUser)
        {
            if (currentUser != null && currentUser.Role == UserRole.Owner)
            {
                return baseSql;
            }

            string filterCondition = "Role != 'Owner' AND Role != 0";
            if (baseSql.IndexOf("WHERE", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                return baseSql.Replace("WHERE", $"WHERE ({filterCondition}) AND ");
            }
            return $"{baseSql} WHERE {filterCondition}";
        }
    }
}
