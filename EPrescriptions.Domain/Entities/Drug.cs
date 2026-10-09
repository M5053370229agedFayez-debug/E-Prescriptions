using System;
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
        public string Location { get; set; }
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
}
