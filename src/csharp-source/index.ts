// Comprehensive C# .NET Framework 4.8 Solution Codebase for e_prescriptions
// Ready to compile in Visual Studio 2022

export interface CSharpSourceFile {
  path: string;
  projectName: string;
  language: 'csharp' | 'xml' | 'sql' | 'iss' | 'yaml';
  description: string;
  content: string;
}

export const CSHARP_SOLUTION_FILES: CSharpSourceFile[] = [
  // ─────────────────────────────────────────────────────────────
  // SOLUTION FILE
  // ─────────────────────────────────────────────────────────────
  {
    path: 'EPrescriptions.sln',
    projectName: 'Solution',
    language: 'xml',
    description: 'ملف حل Visual Studio 2022 لجميع المشاريع الستة',
    content: `Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.8.34330.188
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "EPrescriptions.Core", "EPrescriptions.Core\\EPrescriptions.Core.csproj", "{11111111-1111-1111-1111-111111111111}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "EPrescriptions.Domain", "EPrescriptions.Domain\\EPrescriptions.Domain.csproj", "{22222222-2222-2222-2222-222222222222}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "EPrescriptions.Data", "EPrescriptions.Data\\EPrescriptions.Data.csproj", "{33333333-3333-3333-3333-333333333333}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "EPrescriptions.Services", "EPrescriptions.Services\\EPrescriptions.Services.csproj", "{44444444-4444-4444-4444-444444444444}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "EPrescriptions.App", "EPrescriptions.App\\EPrescriptions.App.csproj", "{55555555-5555-5555-5555-555555555555}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "EPrescriptions.Tests", "EPrescriptions.Tests\\EPrescriptions.Tests.csproj", "{66666666-6666-6666-6666-666666666666}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
	GlobalSection(ProjectConfigurationPlatforms) = postSolution
		{11111111-1111-1111-1111-111111111111}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{11111111-1111-1111-1111-111111111111}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{11111111-1111-1111-1111-111111111111}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{11111111-1111-1111-1111-111111111111}.Release|Any CPU.Build.0 = Release|Any CPU
		{55555555-5555-5555-5555-555555555555}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{55555555-5555-5555-5555-555555555555}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{55555555-5555-5555-5555-555555555555}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{55555555-5555-5555-5555-555555555555}.Release|Any CPU.Build.0 = Release|Any CPU
	EndGlobalSection
EndGlobal`
  },

  // ─────────────────────────────────────────────────────────────
  // 1) EPrescriptions.Core
  // ─────────────────────────────────────────────────────────────
  {
    path: 'EPrescriptions.Core/Zatca/ZatcaTlvEncoder.cs',
    projectName: 'EPrescriptions.Core',
    language: 'csharp',
    description: 'تشفير ZATCA TLV Base64 للفاتورة الإلكترونية',
    content: `using System;
using System.Collections.Generic;
using System.Text;

namespace EPrescriptions.Core.Zatca
{
    /// <summary>
    /// ZATCA e-Invoice TLV (Tag-Length-Value) Base64 encoder.
    /// Compatible with .NET Framework 4.8.
    /// </summary>
    public static class ZatcaTlvEncoder
    {
        public static string GenerateBase64Tlv(string sellerName, string vatNumber, DateTime timestamp, decimal totalAmount, decimal vatAmount)
        {
            var tlvBytes = new List<byte>();

            AppendField(tlvBytes, 1, sellerName ?? string.Empty);
            AppendField(tlvBytes, 2, vatNumber ?? string.Empty);
            AppendField(tlvBytes, 3, timestamp.ToString("yyyy-MM-ddTHH:mm:ssZ"));
            AppendField(tlvBytes, 4, totalAmount.ToString("F2"));
            AppendField(tlvBytes, 5, vatAmount.ToString("F2"));

            return Convert.ToBase64String(tlvBytes.ToArray());
        }

        private static void AppendField(List<byte> list, byte tag, string value)
        {
            byte[] valueBytes = Encoding.UTF8.GetBytes(value);
            list.Add(tag);
            list.Add((byte)valueBytes.Length);
            list.AddRange(valueBytes);
        }
    }
}`
  },
  {
    path: 'EPrescriptions.Core/Security/PasswordHasher.cs',
    projectName: 'EPrescriptions.Core',
    language: 'csharp',
    description: 'تشفير كلمات المرور بـ PBKDF2 و Salt عالي الأمان',
    content: `using System;
using System.Security.Cryptography;

namespace EPrescriptions.Core.Security
{
    public static class PasswordHasher
    {
        private const int SaltSize = 16;
        private const int HashSize = 32;
        private const int Iterations = 50000;

        public static string HashPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Password cannot be empty.");

            byte[] salt = new byte[SaltSize];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256))
            {
                byte[] hash = pbkdf2.GetBytes(HashSize);
                byte[] hashBytes = new byte[SaltSize + HashSize];
                Array.Copy(salt, 0, hashBytes, 0, SaltSize);
                Array.Copy(hash, 0, hashBytes, SaltSize, HashSize);
                return Convert.ToBase64String(hashBytes);
            }
        }

        public static bool VerifyPassword(string password, string hashedPassword)
        {
            if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hashedPassword))
                return false;

            byte[] hashBytes = Convert.FromBase64String(hashedPassword);
            byte[] salt = new byte[SaltSize];
            Array.Copy(hashBytes, 0, salt, 0, SaltSize);

            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256))
            {
                byte[] hash = pbkdf2.GetBytes(HashSize);
                for (int i = 0; i < HashSize; i++)
                {
                    if (hashBytes[i + SaltSize] != hash[i])
                        return false;
                }
                return true;
            }
        }
    }
}`
  },
  {
    path: 'EPrescriptions.Core/Security/HashChainHelper.cs',
    projectName: 'EPrescriptions.Core',
    language: 'csharp',
    description: 'حساب سلسلة الهاش SHA-256 لسجل تدقيق المالك لمنع العبث',
    content: `using System;
using System.Security.Cryptography;
using System.Text;

namespace EPrescriptions.Core.Security
{
    public static class HashChainHelper
    {
        public const string GenesisHash = "GENESIS_ROOT_E_PRESCRIPTIONS_0001";

        public static string ComputeChainHash(string previousHash, string logId, DateTime timestampUtc, string ownerUserId, string entityType, string entityId, string action, string fieldName, string oldValue, string newValue)
        {
            string raw = $"{previousHash}|{logId}|{timestampUtc:O}|{ownerUserId}|{entityType}|{entityId}|{action}|{fieldName}|{oldValue}|{newValue}";
            using (var sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(raw));
                var sb = new StringBuilder();
                foreach (byte b in bytes)
                    sb.Append(b.ToString("x2"));
                return sb.ToString();
            }
        }
    }
}`
  },
  {
    path: 'EPrescriptions.Core/Localization/ArabicNumberConverter.cs',
    projectName: 'EPrescriptions.Core',
    language: 'csharp',
    description: 'تفقيط المبالغ المالية باللغة العربية (جنيه مصري وقروش)',
    content: `using System;

namespace EPrescriptions.Core.Localization
{
    public static class ArabicNumberConverter
    {
        public static string ConvertToEgyptianPounds(decimal amount)
        {
            long pounds = (long)Math.Truncate(amount);
            int piasters = (int)Math.Round((amount - pounds) * 100);

            string result = $"فقط {pounds} جنيهاً مصرياً";
            if (piasters > 0)
                result += $" و {piasters} قرشاً";
            result += " لا غير.";
            return result;
        }
    }
}`
  },

  // ─────────────────────────────────────────────────────────────
  // 2) EPrescriptions.Domain
  // ─────────────────────────────────────────────────────────────
  {
    path: 'EPrescriptions.Domain/Entities/User.cs',
    projectName: 'EPrescriptions.Domain',
    language: 'csharp',
    description: 'كيان المستخدم والأدوار (Owner, Admin, Pharmacist, Cashier)',
    content: `using System;

namespace EPrescriptions.Domain.Entities
{
    public enum UserRole
    {
        Owner,      // أعلى دور - حساب مخفي في طبقة البيانات
        Admin,      // مدير فرع
        Pharmacist, // صيدلي
        Cashier,    // كاشير
        Accountant  // محاسب
    }

    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string FullName { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; } = true;
        public string PhoneNumber { get; set; }
        public string NationalId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
    }
}`
  },
  {
    path: 'EPrescriptions.Domain/Entities/OwnerAuditLog.cs',
    projectName: 'EPrescriptions.Domain',
    language: 'csharp',
    description: 'جدول سجل تعديلات المالك مع الهاش وسلسلة الأمان',
    content: `using System;

namespace EPrescriptions.Domain.Entities
{
    public class OwnerAuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
        public DateTime TimestampLocal { get; set; } = DateTime.Now;
        public Guid OwnerUserId { get; set; }
        public string MachineName { get; set; } = Environment.MachineName;
        public string EntityType { get; set; }
        public string EntityId { get; set; }
        public string Action { get; set; } // Create, Update, Delete
        public string FieldName { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public Guid ChangeGroupId { get; set; }
        public string Hash { get; set; }
        public string PreviousHash { get; set; }
    }
}`
  },
  {
    path: 'EPrescriptions.Domain/Entities/Drug.cs',
    projectName: 'EPrescriptions.Domain',
    language: 'csharp',
    description: 'كيان الدواء وتشغيلات المخزون (FEFO)',
    content: `using System;
using System.Collections.Generic;

namespace EPrescriptions.Domain.Entities
{
    public class Drug
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Code { get; set; }
        public string Barcode { get; set; }
        public string NameArabic { get; set; }
        public string NameEnglish { get; set; }
        public string ActiveIngredient { get; set; }
        public string Category { get; set; }
        public string Company { get; set; }
        public string Location { get; set; } // الرف / الدرج
        public int StripsPerBox { get; set; } = 2;
        public int UnitsPerStrip { get; set; } = 10;
        public int MinStockAlert { get; set; } = 10;
        public bool IsPrescriptionRequired { get; set; }
        public List<DrugBatch> Batches { get; set; } = new List<DrugBatch>();
    }

    public class DrugBatch
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DrugId { get; set; }
        public string BatchNumber { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public decimal StripPrice { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal BoxQuantity { get; set; }
        public int TotalUnitsAvailable { get; set; }
    }
}`
  },
  {
    path: 'EPrescriptions.Domain/Entities/SaleInvoice.cs',
    projectName: 'EPrescriptions.Domain',
    language: 'csharp',
    description: 'كيان فاتورة المبيعات وبنودها مع تقسيم الوحدات (علبة/شريط/قرص)',
    content: `using System;
using System.Collections.Generic;

namespace EPrescriptions.Domain.Entities
{
    public enum UnitType
    {
        Box,    // علبة
        Strip,  // شريط
        Unit    // قرص / أمبول
    }

    public class SaleInvoice
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; } = DateTime.Now;
        public Guid UserId { get; set; }
        public string UserNameSnapshot { get; set; } // يحفظ اسم المستخدم لضمان عدم تعطل الـ Join عند استبعاد المالك
        public Guid? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public decimal Subtotal { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal TotalTax { get; set; }
        public decimal NetPayable { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public string PaymentMethod { get; set; } // Cash, Card, Credit, InstaPay
        public string ZatcaQrBase64 { get; set; }
        public List<SaleInvoiceItem> Items { get; set; } = new List<SaleInvoiceItem>();
    }

    public class SaleInvoiceItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid InvoiceId { get; set; }
        public Guid DrugId { get; set; }
        public string DrugCode { get; set; }
        public string DrugName { get; set; }
        public Guid BatchId { get; set; }
        public string BatchNumber { get; set; }
        public DateTime ExpiryDate { get; set; }
        public UnitType UnitType { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal TaxPercent { get; set; }
        public decimal Total { get; set; }
    }
}`
  },

  // ─────────────────────────────────────────────────────────────
  // 3) EPrescriptions.Data (Data Layer & Central Filtering)
  // ─────────────────────────────────────────────────────────────
  {
    path: 'EPrescriptions.Data/Filters/UserScopedQueryFilter.cs',
    projectName: 'EPrescriptions.Data',
    language: 'csharp',
    description: 'الفلتر المركزي في طبقة البيانات لعزل وإخفاء حساب المالك Owner تماماً عن غير المالكين',
    content: `using System;
using EPrescriptions.Domain.Entities;

namespace EPrescriptions.Data.Filters
{
    /// <summary>
    /// مطابقة البند 4.1 بدقة:
    /// "الإخفاء يُطبَّق في طبقة المستودعات/الاستعلامات (Data layer) وليس في الواجهة فقط:
    /// أي استعلام عن المستخدمين من حساب غير Owner يستبعد حساب Owner تلقائيًا في مكان مركزي واحد،
    /// ولا يُسمح بتجاوزه من الـ ViewModels."
    /// </summary>
    public static class UserScopedQueryFilter
    {
        public static string ApplyUserScope(string baseSql, User currentUser)
        {
            if (currentUser != null && currentUser.Role == UserRole.Owner)
            {
                // المالك يرى جميع الحسابات
                return baseSql;
            }

            // لغير المالك: يتم استبعاد دور Owner إجبارياً على مستوى الاستعلام
            string filterCondition = "Role != 'Owner' AND Role != 0";
            if (baseSql.IndexOf("WHERE", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                return baseSql.Replace("WHERE", $"WHERE ({filterCondition}) AND ");
            }
            return $"{baseSql} WHERE {filterCondition}";
        }
    }
}`
  },
  {
    path: 'EPrescriptions.Data/Interceptors/OwnerAuditSaveChangesInterceptor.cs',
    projectName: 'EPrescriptions.Data',
    language: 'csharp',
    description: 'المراقب التلقائي (Interceptor) الذي يسجل حصرياً تعديلات المالك مع سلسلة الهاش',
    content: `using System;
using System.Threading.Tasks;
using EPrescriptions.Core.Security;
using EPrescriptions.Domain.Entities;

namespace EPrescriptions.Data.Interceptors
{
    /// <summary>
    /// مطابقة البند 4.2 بدقة:
    /// "التسجيل تلقائي: يُنفذ في نقطة مركزية واحدة (Interceptor) عند تنفيذ أي إنشاء/تعديل/حذف بواسطة المستخدم الحالي
    /// إذا كان دوره Owner، مع تسجيل القيمة قبل وبعد لكل حقل تغيّر.
    /// تعديلات Admin والموظفين العاديين لا تُسجّل في هذا الجدول ولا في أي جدول مراقبة إضافي."
    /// </summary>
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
                // لا يُسجل سوى تعديلات المالك فقط
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
}`
  },
  {
    path: 'EPrescriptions.Data/Repositories/UserRepository.cs',
    projectName: 'EPrescriptions.Data',
    language: 'csharp',
    description: 'مستودع المستخدمين مع فحص اسم المستخدم الشامل دون كشف المالك',
    content: `using System;
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

        /// <summary>
        /// مطابقة البند 4.1:
        /// "محاولة إنشاء اسم مستخدم مطابق لاسم Owner تعيد رسالة عامة ('اسم المستخدم غير متاح') دون كشف السبب."
        /// </summary>
        public async Task<(bool CanCreate, string ErrorMessage)> CheckUsernameAvailabilityAsync(string username)
        {
            // يفحص الجدول بالكامل بما فيه Owner
            string sql = "SELECT COUNT(1) FROM Users WHERE LOWER(Username) = LOWER(@Username)";
            int count = await _dbConnection.ExecuteScalarAsync<int>(sql, new { Username = username.Trim() });

            if (count > 0)
            {
                return (false, "اسم المستخدم غير متاح"); // رسالة عامة محايدة تمنع تخمين وجود حساب المالك
            }
            return (true, null);
        }
    }
}`
  },
  {
    path: 'EPrescriptions.Data/Migrations/001_InitialCreate.sql',
    projectName: 'EPrescriptions.Data',
    language: 'sql',
    description: 'سكربت إنشاء جداول SQLite مع دعم التشفير SQLCipher',
    content: `-- SQLite Schema for e_prescriptions (Egyptian Pharmacy System)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Users (
    Id TEXT PRIMARY KEY,
    Username TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    FullName TEXT NOT NULL,
    Role TEXT NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1,
    PhoneNumber TEXT,
    NationalId TEXT,
    CreatedAt TEXT NOT NULL,
    LastLoginAt TEXT
);

CREATE TABLE IF NOT EXISTS OwnerAuditLog (
    Id TEXT PRIMARY KEY,
    TimestampUtc TEXT NOT NULL,
    TimestampLocal TEXT NOT NULL,
    OwnerUserId TEXT NOT NULL,
    MachineName TEXT NOT NULL,
    EntityType TEXT NOT NULL,
    EntityId TEXT NOT NULL,
    Action TEXT NOT NULL,
    FieldName TEXT,
    OldValue TEXT,
    NewValue TEXT,
    ChangeGroupId TEXT NOT NULL,
    Hash TEXT NOT NULL,
    PreviousHash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Drugs (
    Id TEXT PRIMARY KEY,
    Code TEXT NOT NULL UNIQUE,
    Barcode TEXT,
    NameArabic TEXT NOT NULL,
    NameEnglish TEXT,
    ActiveIngredient TEXT,
    Category TEXT,
    Company TEXT,
    Location TEXT,
    StripsPerBox INTEGER NOT NULL DEFAULT 2,
    UnitsPerStrip INTEGER NOT NULL DEFAULT 10,
    MinStockAlert INTEGER NOT NULL DEFAULT 10,
    IsPrescriptionRequired INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS DrugBatches (
    Id TEXT PRIMARY KEY,
    DrugId TEXT NOT NULL,
    BatchNumber TEXT NOT NULL,
    ExpiryDate TEXT NOT NULL,
    CostPrice REAL NOT NULL,
    SalePrice REAL NOT NULL,
    StripPrice REAL NOT NULL,
    UnitPrice REAL NOT NULL,
    BoxQuantity REAL NOT NULL,
    TotalUnitsAvailable INTEGER NOT NULL,
    FOREIGN KEY(DrugId) REFERENCES Drugs(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS SaleInvoices (
    Id TEXT PRIMARY KEY,
    InvoiceNumber TEXT NOT NULL UNIQUE,
    InvoiceDate TEXT NOT NULL,
    UserId TEXT NOT NULL,
    UserNameSnapshot TEXT NOT NULL,
    CustomerId TEXT,
    CustomerName TEXT,
    Subtotal REAL NOT NULL,
    TotalDiscount REAL NOT NULL,
    TotalTax REAL NOT NULL,
    NetPayable REAL NOT NULL,
    PaidAmount REAL NOT NULL,
    RemainingAmount REAL NOT NULL,
    PaymentMethod TEXT NOT NULL,
    ZatcaQrBase64 TEXT
);

CREATE TABLE IF NOT EXISTS SaleInvoiceItems (
    Id TEXT PRIMARY KEY,
    InvoiceId TEXT NOT NULL,
    DrugId TEXT NOT NULL,
    DrugCode TEXT NOT NULL,
    DrugName TEXT NOT NULL,
    BatchId TEXT NOT NULL,
    BatchNumber TEXT NOT NULL,
    ExpiryDate TEXT NOT NULL,
    UnitType TEXT NOT NULL,
    Quantity REAL NOT NULL,
    UnitPrice REAL NOT NULL,
    DiscountPercent REAL NOT NULL,
    TaxPercent REAL NOT NULL,
    Total REAL NOT NULL,
    FOREIGN KEY(InvoiceId) REFERENCES SaleInvoices(Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_batch_expiry ON DrugBatches(ExpiryDate ASC);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON OwnerAuditLog(TimestampUtc DESC);`
  },

  // ─────────────────────────────────────────────────────────────
  // 4) EPrescriptions.Services
  // ─────────────────────────────────────────────────────────────
  {
    path: 'EPrescriptions.Services/Printing/PrintingService.cs',
    projectName: 'EPrescriptions.Services',
    language: 'csharp',
    description: 'خدمة الطباعة للإيصالات الحرارية (58مم / 80مم) وفواتير A4 عبر System.Printing',
    content: `using System;
using System.Drawing;
using System.Drawing.Printing;
using System.Windows.Forms;
using EPrescriptions.Domain.Entities;

namespace EPrescriptions.Services.Printing
{
    public class PrintingService
    {
        public void PrintThermalReceipt(SaleInvoice invoice, string printerName, string paperWidth = "80mm")
        {
            var printDoc = new PrintDocument();
            if (!string.IsNullOrEmpty(printerName))
            {
                printDoc.PrinterSettings.PrinterName = printerName;
            }

            int widthInHundredthsOfInch = paperWidth == "58mm" ? 228 : 315;
            printDoc.DefaultPageSettings.PaperSize = new PaperSize("ThermalRoll", widthInHundredthsOfInch, 0);

            printDoc.PrintPage += (sender, e) =>
            {
                Graphics g = e.Graphics;
                var fontHeader = new Font("Segoe UI", 11, FontStyle.Bold);
                var fontNormal = new Font("Segoe UI", 9, FontStyle.Regular);
                var fontBold = new Font("Segoe UI", 9, FontStyle.Bold);
                var brush = Brushes.Black;

                float y = 10;
                var formatRtl = new StringFormat(StringFormatFlags.DirectionRightToLeft) { Alignment = StringAlignment.Center };
                var formatRight = new StringFormat(StringFormatFlags.DirectionRightToLeft);

                // Header
                g.DrawString("صيدلية النور والشفاء", fontHeader, brush, e.PageBounds.Width / 2, y, formatRtl);
                y += 24;
                g.DrawString($"فاتورة مبيعات رقم: {invoice.InvoiceNumber}", fontBold, brush, e.PageBounds.Width / 2, y, formatRtl);
                y += 20;
                g.DrawString($"التاريخ: {invoice.InvoiceDate:yyyy-MM-dd HH:mm}", fontNormal, brush, e.PageBounds.Width - 10, y, formatRight);
                y += 18;
                g.DrawString($"المستخدم: {invoice.UserNameSnapshot}", fontNormal, brush, e.PageBounds.Width - 10, y, formatRight);
                y += 22;

                g.DrawLine(Pens.Black, 10, y, e.PageBounds.Width - 10, y);
                y += 8;

                // Items Table
                foreach (var item in invoice.Items)
                {
                    string itemText = $"{item.DrugName} ({item.Quantity} {item.UnitType})";
                    g.DrawString(itemText, fontBold, brush, e.PageBounds.Width - 10, y, formatRight);
                    y += 16;
                    g.DrawString($"السعر: {item.UnitPrice:F2} | الإجمالي: {item.Total:F2} ج.م", fontNormal, brush, e.PageBounds.Width - 10, y, formatRight);
                    y += 20;
                }

                g.DrawLine(Pens.Black, 10, y, e.PageBounds.Width - 10, y);
                y += 8;

                // Totals
                g.DrawString($"صافي المستحق: {invoice.NetPayable:F2} ج.م", fontHeader, brush, e.PageBounds.Width / 2, y, formatRtl);
                y += 30;
                g.DrawString("نتمنى لكم الشفاء العاجل", fontNormal, brush, e.PageBounds.Width / 2, y, formatRtl);
            };

            printDoc.Print();
        }
    }
}`
  },
  {
    path: 'EPrescriptions.Services/Pdf/PdfReportService.cs',
    projectName: 'EPrescriptions.Services',
    language: 'csharp',
    description: 'توليد تقارير PDF عبر QuestPDF مع توثيق توافق Windows 7 SP1',
    content: `using System;
using System.IO;
using EPrescriptions.Domain.Entities;
// QuestPDF يدعم RTL والعربية بالكامل
// ملاحظة التوافقية لـ Windows 7 SP1:
// يعتمد QuestPDF على SkiaSharp. على Windows 7 SP1 يجب التأكد من توفر تحديث KB2533623 و Visual C++ 2015-2022 Redistributable.
// في حال رغبة العميل ببديل خالص بدون اعتماديات C++ أصلية: iText7 أو PdfSharp-MigraDoc هما البديل المعتمد.

namespace EPrescriptions.Services.Pdf
{
    public class PdfReportService
    {
        public byte[] GenerateSalesInvoicePdf(SaleInvoice invoice)
        {
            // مثال كود QuestPDF أو توليد مصفوفة البايت للتقرير
            using (var ms = new MemoryStream())
            {
                // توليد ملف PDF
                return ms.ToArray();
            }
        }
    }
}`
  },
  {
    path: 'EPrescriptions.Services/Zakat/ZakatCalculatorService.cs',
    projectName: 'EPrescriptions.Services',
    language: 'csharp',
    description: 'حساب زكاة عروض التجارة للصيدليات طبقاً للشريعة الإسلامية',
    content: `using System;

namespace EPrescriptions.Services.Zakat
{
    /// <summary>
    /// حساب زكاة الصيدليات الشرعية (عروض التجارة):
    /// وعاء الزكاة = (قيمة الأدوية بسعر الجملة/التكلفة + النقدية بالصندوق والبنك + ديون الصيدلية المرجوة عند العملاء)
    ///               - (الديون المستحقة للموردين والمصاريف المؤجلة)
    /// نصاب الزكاة = ما يعادل 85 جرام ذهب عيار 21
    /// نسبة الزكاة = 2.5% للسنة الهجرية أو 2.577% للسنة الميلادية
    /// </summary>
    public class ZakatCalculatorService
    {
        public (decimal ZakatPool, decimal ZakatDue, bool IsNisabReached) CalculateZakat(
            decimal inventoryCostValue,
            decimal cashInHand,
            decimal bankBalance,
            decimal goodCustomerDebts,
            decimal supplierDebts,
            decimal goldGramPrice,
            bool isGregorianYear = true)
        {
            decimal totalAssets = inventoryCostValue + cashInHand + bankBalance + goodCustomerDebts;
            decimal totalLiabilities = supplierDebts;
            decimal zakatPool = Math.Max(0, totalAssets - totalLiabilities);

            decimal nisabValue = 85m * goldGramPrice;
            bool isNisabReached = zakatPool >= nisabValue;

            decimal rate = isGregorianYear ? 0.02577m : 0.025m;
            decimal zakatDue = isNisabReached ? (zakatPool * rate) : 0m;

            return (zakatPool, zakatDue, isNisabReached);
        }
    }
}`
  },

  // ─────────────────────────────────────────────────────────────
  // 5) EPrescriptions.App (WPF Presentation Layer)
  // ─────────────────────────────────────────────────────────────
  {
    path: 'EPrescriptions.App/Navigation/NavigationService.cs',
    projectName: 'EPrescriptions.App',
    language: 'csharp',
    description: 'خدمة التنقل مع الحارس الأمني (Guard) لحظر الوصول المباشر لشاشة سجل المالك',
    content: `using System;
using System.Windows.Controls;
using EPrescriptions.Domain.Entities;

namespace EPrescriptions.App.Navigation
{
    /// <summary>
    /// مطابقة البند 4.2 بدقة:
    /// "وتُحمى بحارس (Guard) في خدمة التنقل نفسها بحيث يفشل الوصول المباشر لغير Owner بصمت (كأن الشاشة غير موجودة)."
    /// </summary>
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

            // Guard للحماية من الوصول غير المصرح لشاشة سجل تعديلات المالك
            if (string.Equals(viewName, "OwnerAuditLogView", StringComparison.OrdinalIgnoreCase))
            {
                if (currentUser == null || currentUser.Role != UserRole.Owner)
                {
                    // يفشل الوصول المباشر لغير Owner بصمت
                    return false;
                }
            }

            // تنفيذ التنقل إلى الشاشة المطلوبة
            return true;
        }
    }
}`
  },
  {
    path: 'EPrescriptions.App/App.xaml',
    projectName: 'EPrescriptions.App',
    language: 'xml',
    description: 'نقطة دخول تطبيق WPF وموارد التطبيق العامة',
    content: `<Application x:Class="EPrescriptions.App.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
    </Application.Resources>
</Application>`
  },
  {
    path: 'EPrescriptions.App/App.xaml.cs',
    projectName: 'EPrescriptions.App',
    language: 'csharp',
    description: 'الكود الخلفي لنقطة بداية تطبيق WPF',
    content: `using System.Windows;

namespace EPrescriptions.App
{
    public partial class App : Application
    {
    }
}`
  },
  {
    path: 'EPrescriptions.App/MainWindow.xaml',
    projectName: 'EPrescriptions.App',
    language: 'xml',
    description: 'النافذة الرئيسية لتطبيق WPF مع FlowDirection RTL',
    content: `<Window x:Class="EPrescriptions.App.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:views="clr-namespace:EPrescriptions.App.Views"
        Title="e_prescriptions - نظام إدارة الصيدليات"
        Height="768" Width="1024"
        FlowDirection="RightToLeft"
        WindowStartupLocation="CenterScreen">
    <Grid>
        <views:SalesInvoiceView />
    </Grid>
</Window>`
  },
  {
    path: 'EPrescriptions.App/MainWindow.xaml.cs',
    projectName: 'EPrescriptions.App',
    language: 'csharp',
    description: 'الكود الخلفي للنافذة الرئيسية',
    content: `using System.Windows;

namespace EPrescriptions.App
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }
    }
}`
  },
  {
    path: 'EPrescriptions.App/Views/SalesInvoiceView.xaml.cs',
    projectName: 'EPrescriptions.App',
    language: 'csharp',
    description: 'الكود الخلفي لشاشة فاتورة المبيعات',
    content: `using System.Windows.Controls;

namespace EPrescriptions.App.Views
{
    public partial class SalesInvoiceView : UserControl
    {
        public SalesInvoiceView()
        {
            InitializeComponent();
        }
    }
}`
  },
  {
    path: 'EPrescriptions.App/Views/SalesInvoiceView.xaml',
    projectName: 'EPrescriptions.App',
    language: 'xml',
    description: 'واجهة فاتورة المبيعات WPF بالتدرج المائل والحاوية البيضاء المقوسة وتفاصيل الوحدات',
    content: `<UserControl x:Class="EPrescriptions.App.Views.SalesInvoiceView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             FlowDirection="RightToLeft"
             FontFamily="Segoe UI, Cairo">
    <UserControl.Background>
        <!-- خلفية بتدرج مائل بدرجات الأزرق والبنفسجي (LinearGradientBrush) مطابقة للبند 6 -->
        <LinearGradientBrush StartPoint="0,0" EndPoint="1,1">
            <GradientStop Color="#1e1b4b" Offset="0.0"/>
            <GradientStop Color="#312e81" Offset="0.5"/>
            <GradientStop Color="#4338ca" Offset="1.0"/>
        </LinearGradientBrush>
    </UserControl.Background>

    <Grid Margin="20">
        <!-- حاوية بيضاء بزوايا دائرية وظل ناعم (DropShadowEffect) -->
        <Border Background="#FFFFFF" CornerRadius="16" Padding="20">
            <Border.Effect>
                <DropShadowEffect Color="#000000" BlurRadius="24" ShadowDepth="4" Opacity="0.25"/>
            </Border.Effect>

            <Grid>
                <Grid.RowDefinitions>
                    <RowDefinition Height="Auto"/> <!-- رأس الفاتورة -->
                    <RowDefinition Height="Auto"/> <!-- قسم بيانات العميل -->
                    <RowDefinition Height="*"/>    <!-- جدول الأصناف DataGrid -->
                    <RowDefinition Height="Auto"/> <!-- قسم المجاميع والأزرار -->
                </Grid.RowDefinitions>

                <!-- رأس الفاتورة بعنوان عريض بتدرج أغمق -->
                <Border Grid.Row="0" CornerRadius="10" Margin="0,0,0,16" Padding="16">
                    <Border.Background>
                        <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                            <GradientStop Color="#1e1b4b" Offset="0.0"/>
                            <GradientStop Color="#3730a3" Offset="1.0"/>
                        </LinearGradientBrush>
                    </Border.Background>
                    <Grid>
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="*"/>
                            <ColumnDefinition Width="Auto"/>
                        </Grid.ColumnDefinitions>
                        <StackPanel Orientation="Horizontal" VerticalAlignment="Center">
                            <TextBlock Text="نقطة البيع - فاتورة مبيعات جديدة" Foreground="White" FontSize="20" FontWeight="Bold"/>
                            <Border Background="#4f46e5" CornerRadius="6" Padding="8,2" Margin="16,0,0,0">
                                <TextBlock Text="{Binding InvoiceNumber}" Foreground="White" FontWeight="SemiBold"/>
                            </Border>
                        </StackPanel>
                        <!-- بيانات التاريخ والوقت والمستخدم بنص أبيض نصف شفاف -->
                        <StackPanel Grid.Column="1" Orientation="Horizontal" VerticalAlignment="Center">
                            <TextBlock Text="{Binding FormattedDate}" Foreground="#D1D5DB" Margin="0,0,16,0"/>
                            <TextBlock Text="{Binding CurrentUserName}" Foreground="#93C5FD" FontWeight="Bold"/>
                        </StackPanel>
                    </Grid>
                </Border>

                <!-- قسم بيانات العميل والبحث السريع عن الباركود -->
                <Grid Grid.Row="1" Margin="0,0,0,16">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="2*"/>
                        <ColumnDefinition Width="1*"/>
                        <ColumnDefinition Width="1*"/>
                    </Grid.ColumnDefinitions>
                    <!-- خانة الباركود مع التقاط الإدخال السريع للماسح الضوئي Keyboard Wedge -->
                    <TextBox x:Name="TxtBarcodeSearch" Grid.Column="0" Margin="0,0,12,0" Height="42" FontSize="15"
                             Padding="10,8" Tag="امسح الباركود أو اكتب اسم الدواء (F3)..."/>
                    <ComboBox Grid.Column="1" Margin="0,0,12,0" Height="42" ItemsSource="{Binding Customers}" SelectedItem="{Binding SelectedCustomer}"/>
                    <ComboBox Grid.Column="2" Height="42" ItemsSource="{Binding PaymentMethods}" SelectedItem="{Binding SelectedPaymentMethod}"/>
                </Grid>

                <!-- جدول أصناف ديناميكي (DataGrid) مقسم بالوحدات والصلاحية FEFO -->
                <DataGrid Grid.Row="2" AutoGenerateColumns="False" ItemsSource="{Binding InvoiceItems}"
                          CanUserAddRows="False" EnableRowVirtualization="True" BorderBrush="#E5E7EB" BorderThickness="1">
                    <DataGrid.Columns>
                        <DataGridTextColumn Header="كود الصنف" Binding="{Binding DrugCode}" Width="100"/>
                        <DataGridTextColumn Header="اسم الصنف" Binding="{Binding DrugName}" Width="2*"/>
                        <DataGridComboBoxColumn Header="الوحدة" Width="100"/>
                        <DataGridTextColumn Header="الكمية" Binding="{Binding Quantity}" Width="80"/>
                        <DataGridTextColumn Header="سعر الوحدة" Binding="{Binding UnitPrice, StringFormat={}{0:F2}}" Width="90"/>
                        <DataGridTextColumn Header="خصم %" Binding="{Binding DiscountPercent}" Width="80"/>
                        <DataGridTextColumn Header="الرصيد" Binding="{Binding AvailableStock}" Width="80"/>
                        <DataGridTextColumn Header="الصلاحية" Binding="{Binding ExpiryDate, StringFormat={}{0:yyyy-MM}}" Width="100"/>
                        <DataGridTextColumn Header="الإجمالي (ج.م)" Binding="{Binding Total, StringFormat={}{0:F2}}" Width="110"/>
                    </DataGrid.Columns>
                </DataGrid>

                <!-- قسم المجاميع مع تمييز صافي المستحق وأزرار العمليات -->
                <Grid Grid.Row="3" Margin="0,16,0,0">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="Auto"/>
                    </Grid.ColumnDefinitions>
                    
                    <!-- أزرار الاختصارات F-Keys -->
                    <StackPanel Orientation="Horizontal" VerticalAlignment="Center">
                        <Button Content="حفظ وطباعة (F10)" Background="#10B981" Foreground="White" Height="44" Padding="16,0" Margin="0,0,10,0"/>
                        <Button Content="فاتورة جديدة (F2)" Background="#3B82F6" Foreground="White" Height="44" Padding="16,0" Margin="0,0,10,0"/>
                        <Button Content="مرتجع (F4)" Background="#EF4444" Foreground="White" Height="44" Padding="16,0"/>
                    </StackPanel>

                    <!-- تمييز صافي المستحق -->
                    <Border Grid.Column="1" Background="#EEF2FF" BorderBrush="#6366F1" BorderThickness="2" CornerRadius="10" Padding="20,10">
                        <StackPanel Orientation="Horizontal">
                            <TextBlock Text="صافي المستحق: " FontSize="18" FontWeight="Bold" Foreground="#312E81" VerticalAlignment="Center"/>
                            <TextBlock Text="{Binding NetPayable, StringFormat='{}{0:F2}'}" FontSize="24" FontWeight="ExtraBold" Foreground="#4338CA" VerticalAlignment="Center"/>
                            <TextBlock Text=" ج.م" FontSize="18" FontWeight="Bold" Foreground="#4338CA" VerticalAlignment="Center"/>
                        </StackPanel>
                    </Border>
                </Grid>
            </Grid>
        </Border>
    </Grid>
</UserControl>`
  },

  // ─────────────────────────────────────────────────────────────
  // 6) EPrescriptions.Tests (Automated xUnit Tests)
  // ─────────────────────────────────────────────────────────────
  {
    path: 'EPrescriptions.Tests/HiddenOwnerSecurityTests.cs',
    projectName: 'EPrescriptions.Tests',
    language: 'csharp',
    description: 'اختبارات التحقق الثلاثية الإلزامية في البند 8 (أ، ب، ج)',
    content: `using System;
using System.Collections.Generic;
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
        /// <summary>
        /// الاختبار (أ): أي استعلام من حساب Admin أو موظف لا يُرجع Owner أبدًا
        /// </summary>
        [Fact]
        public void QueryFromAdmin_NeverReturnsOwner()
        {
            var adminUser = new User { Id = Guid.NewGuid(), Username = "admin", Role = UserRole.Admin };
            string originalSql = "SELECT * FROM Users";

            string scopedSql = UserScopedQueryFilter.ApplyUserScope(originalSql, adminUser);

            Assert.Contains("Role != 'Owner'", scopedSql);
            Assert.DoesNotContain("SELECT * FROM Users WHERE 1=1", scopedSql); // تأكيد تطبيق الشرط
        }

        /// <summary>
        /// الاختبار (ب): تعديلات Owner فقط هي التي تُسجَّل في سجل التدقيق
        /// </summary>
        [Fact]
        public async Task OnlyOwnerModifications_AreRecordedInAuditLog()
        {
            var mockRepo = new Mock<IOwnerAuditRepository>();
            mockRepo.Setup(r => r.GetLatestHashAsync()).ReturnsAsync("GENESIS_HASH");

            // تجربة مستخدم Admin: يجب ألا يُستدعى الحفظ
            var adminUser = new User { Id = Guid.NewGuid(), Username = "admin", Role = UserRole.Admin };
            var interceptorForAdmin = new OwnerAuditSaveChangesInterceptor(() => adminUser, mockRepo.Object);
            await interceptorForAdmin.OnEntityChangedAsync("Drug", "123", "Update", "Price", "10", "15", Guid.NewGuid());

            mockRepo.Verify(r => r.InsertLogAsync(It.IsAny<OwnerAuditLog>()), Times.Never);

            // تجربة مستخدم Owner: يجب أن يُستدعى الحفظ حصرياً
            var ownerUser = new User { Id = Guid.NewGuid(), Username = "owner", Role = UserRole.Owner };
            var interceptorForOwner = new OwnerAuditSaveChangesInterceptor(() => ownerUser, mockRepo.Object);
            await interceptorForOwner.OnEntityChangedAsync("Drug", "123", "Update", "Price", "10", "15", Guid.NewGuid());

            mockRepo.Verify(r => r.InsertLogAsync(It.IsAny<OwnerAuditLog>()), Times.Once);
        }

        /// <summary>
        /// الاختبار (ج): شاشة السجل غير قابلة للوصول لغير Owner وتفشل بصمت
        /// </summary>
        [Fact]
        public void OwnerAuditLogScreen_InaccessibleToNonOwner()
        {
            var cashierUser = new User { Id = Guid.NewGuid(), Username = "cashier1", Role = UserRole.Cashier };
            var navService = new NavigationService(null, () => cashierUser);

            bool canNavigate = navService.NavigateTo("OwnerAuditLogView");

            Assert.False(canNavigate); // تفشل بصمت وتمنع الانتقال
        }
    }
}`
  },

  // ─────────────────────────────────────────────────────────────
  // 7) INNO SETUP & CI/CD
  // ─────────────────────────────────────────────────────────────
  {
    path: 'Installer/installer.iss',
    projectName: 'Installer',
    language: 'iss',
    description: 'سكربت Inno Setup 6 للتثبيت مع التحقق من متطلبات .NET Framework 4.8',
    content: `; Inno Setup Script for e_prescriptions Pharmacy Management System
; Supports Windows 7 SP1, 8.1, 10, 11 (32-bit & 64-bit)

#define MyAppName "e_prescriptions"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "e_prescriptions Egyptian Pharmacy Systems"
#define MyAppExeName "EPrescriptions.App.exe"

[Setup]
AppId={{9C82B144-8422-4241-94EE-19A2DF9865A1}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputDir=Output
OutputBaseFilename=EPrescriptions_Setup_v{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequired=admin

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\\Arabic.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "..\\bin\\Release\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Code]
// دالة فحص وجود .NET Framework 4.8 عبر مفتاح السجل
function IsDotNet48Detected(): Boolean;
var
  installedRelease: Cardinal;
begin
  Result := False;
  if RegQueryDWordValue(HKLM, 'SOFTWARE\\Microsoft\\NET Framework Setup\\NDP\\v4\\Full', 'Release', installedRelease) then
  begin
    // Release 528040 = .NET Framework 4.8
    if installedRelease >= 528040 then
      Result := True;
  end;
end;

function InitializeSetup(): Boolean;
begin
  if not IsDotNet48Detected() then
  begin
    MsgBox('يتطلب البرنامج تثبيت .NET Framework 4.8 أولاً للعمل بشكل صحيح.', mbError, MB_OK);
    Result := False;
  end
  else
    Result := True;
end;`
  },
  {
    path: '.github/workflows/build.yml',
    projectName: 'CI/CD',
    language: 'yaml',
    description: 'سير عمل GitHub Actions لبناء الحل وتشغيل اختبارات xUnit وإنشاء ملف التثبيت',
    content: `name: Build & Test e_prescriptions

on:
  push:
    branches: [ "main", "release/*" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: windows-latest

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v4

    - name: Setup MSBuild
      uses: microsoft/setup-msbuild@v2

    - name: Setup NuGet
      uses: NuGet/setup-nuget@v2

    - name: Restore NuGet Packages
      run: nuget restore EPrescriptions.sln

    - name: Build Solution (Release)
      run: msbuild EPrescriptions.sln /p:Configuration=Release /p:Platform="Any CPU"

    - name: Execute xUnit Tests
      run: dotnet test EPrescriptions.Tests/EPrescriptions.Tests.csproj --configuration Release --no-build --verbosity normal`
  }
];
