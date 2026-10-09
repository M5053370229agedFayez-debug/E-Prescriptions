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
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON OwnerAuditLog(TimestampUtc DESC);
