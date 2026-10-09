using System;
using System.Threading.Tasks;
using EPrescriptions.Core.Security;
using EPrescriptions.Domain.Entities;

namespace EPrescriptions.Data.Interceptors
{
    public class OwnerAuditSaveChangesInterceptor
    {
        private readonly Func<User> _currentUserAccessor;
        private readonly IOwnerAuditRepository _auditRepository;

        public OwnerAuditSaveChangesInterceptor(Func<User> currentUserAccessor, IOwnerAuditRepository auditRepository)
        {
            _currentUserAccessor = currentUserAccessor;
            _auditRepository = auditRepository;
        }

        public async Task OnEntityChangedAsync(string entityType, string entityId, string action, string fieldName, string oldValue, string newValue, Guid changeGroupId)
        {
            var currentUser = _currentUserAccessor();
            if (currentUser == null || currentUser.Role != UserRole.Owner)
            {
                return;
            }

            string previousHash = await _auditRepository.GetLatestHashAsync() ?? HashChainHelper.GenesisHash;
            var log = new OwnerAuditLog
            {
                Id = Guid.NewGuid(),
                TimestampUtc = DateTime.UtcNow,
                TimestampLocal = DateTime.Now,
                OwnerUserId = currentUser.Id,
                MachineName = Environment.MachineName,
                EntityType = entityType,
                EntityId = entityId,
                Action = action,
                FieldName = fieldName,
                OldValue = oldValue,
                NewValue = newValue,
                ChangeGroupId = changeGroupId,
                PreviousHash = previousHash
            };

            log.Hash = HashChainHelper.ComputeChainHash(
                log.PreviousHash,
                log.Id.ToString(),
                log.TimestampUtc,
                log.OwnerUserId.ToString(),
                log.EntityType,
                log.EntityId,
                log.Action,
                log.FieldName,
                log.OldValue,
                log.NewValue
            );

            await _auditRepository.InsertLogAsync(log);
        }
    }

    public interface IOwnerAuditRepository
    {
        Task<string> GetLatestHashAsync();
        Task InsertLogAsync(OwnerAuditLog log);
    }
}
