using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using EPrescriptions.Data.Filters;
using EPrescriptions.Domain.Entities;

namespace EPrescriptions.Data.Repositories
{
    public class UserRepository
    {
        private readonly IDbConnection _dbConnection;
        private readonly Func<User> _currentUserAccessor;

        public UserRepository(IDbConnection dbConnection, Func<User> currentUserAccessor)
        {
            _dbConnection = dbConnection;
            _currentUserAccessor = currentUserAccessor;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            string sql = "SELECT * FROM Users";
            sql = UserScopedQueryFilter.ApplyUserScope(sql, _currentUserAccessor());
            return await _dbConnection.QueryAsync<User>(sql);
        }

        public async Task<User> GetByIdAsync(Guid id)
        {
            string sql = "SELECT * FROM Users WHERE Id = @Id";
            sql = UserScopedQueryFilter.ApplyUserScope(sql, _currentUserAccessor());
            return await _dbConnection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task<(bool CanCreate, string ErrorMessage)> CheckUsernameAvailabilityAsync(string username)
        {
            string sql = "SELECT COUNT(1) FROM Users WHERE LOWER(Username) = LOWER(@Username)";
            int count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { Username = username.Trim() });

            if (count > 0)
            {
                return (false, "اسم المستخدم غير متاح");
            }
            return (true, null);
        }
    }
}
