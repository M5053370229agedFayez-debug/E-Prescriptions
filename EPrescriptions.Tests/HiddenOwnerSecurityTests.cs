using System;
using System.Threading.Tasks;
using Xunit;
using Moq;
using EPrescriptions.Domain.Entities;
using EPrescriptions.Data.Filters;
using EPrescriptions.Data.Interceptors;
using EPrescriptions.App.Navigation;

namespace EPrescriptions.Tests
{
    public class HiddenOwnerSecurityTests
    {
        [Fact]
        public void QueryFromAdmin_NeverReturnsOwner()
        {
            var adminUser = new User { Id = Guid.NewGuid(), Username = "admin", Role = UserRole.Admin };
            string originalSql = "SELECT * FROM Users";

            string scopedSql = UserScopedQueryFilter.ApplyUserScope(originalSql, adminUser);

            Assert.Contains("Role != 'Owner'", scopedSql);
            Assert.DoesNotContain("SELECT * FROM Users WHERE 1=1", scopedSql);
        }

        [Fact]
        public async Task OnlyOwnerModifications_AreRecordedInAuditLog()
        {
            var mockRepo = new Mock<IOwnerAuditRepository>();
            mockRepo.Setup(r => r.GetLatestHashAsync()).ReturnsAsync("GENESIS_HASH");

            var adminUser = new User { Id = Guid.NewGuid(), Username = "admin", Role = UserRole.Admin };
            var interceptorForAdmin = new OwnerAuditSaveChangesInterceptor(() => adminUser, mockRepo.Object);
            await interceptorForAdmin.OnEntityChangedAsync("Drug", "123", "Update", "Price", "10", "15", Guid.NewGuid());

            mockRepo.Verify(r => r.InsertLogAsync(It.IsAny<OwnerAuditLog>()), Times.Never);

            var ownerUser = new User { Id = Guid.NewGuid(), Username = "owner", Role = UserRole.Owner };
            var interceptorForOwner = new OwnerAuditSaveChangesInterceptor(() => ownerUser, mockRepo.Object);
            await interceptorForOwner.OnEntityChangedAsync("Drug", "123", "Update", "Price", "10", "15", Guid.NewGuid());

            mockRepo.Verify(r => r.InsertLogAsync(It.IsAny<OwnerAuditLog>()), Times.Once);
        }

        [Fact]
        public void OwnerAuditLogScreen_InaccessibleToNonOwner()
        {
            var cashierUser = new User { Id = Guid.NewGuid(), Username = "cashier1", Role = UserRole.Cashier };
            var navService = new NavigationService(null, () => cashierUser);

            bool canNavigate = navService.NavigateTo("OwnerAuditLogView");

            Assert.False(canNavigate);
        }
    }
}
