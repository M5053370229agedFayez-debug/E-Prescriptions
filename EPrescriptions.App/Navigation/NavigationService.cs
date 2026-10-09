using System;
using System.Windows.Controls;
using EPrescriptions.Domain.Entities;

namespace EPrescriptions.App.Navigation
{
    public class NavigationService
    {
        private readonly Frame _frame;
        private readonly Func<User> _currentUserAccessor;

        public NavigationService(Frame frame, Func<User> currentUserAccessor)
        {
            _frame = frame;
            _currentUserAccessor = currentUserAccessor;
        }

        public bool NavigateTo(string viewName, object parameter = null)
        {
            var currentUser = _currentUserAccessor();

            if (string.Equals(viewName, "OwnerAuditLogView", StringComparison.OrdinalIgnoreCase))
            {
                if (currentUser == null || currentUser.Role != UserRole.Owner)
                {
                    return false;
                }
            }

            return true;
        }
    }
}
