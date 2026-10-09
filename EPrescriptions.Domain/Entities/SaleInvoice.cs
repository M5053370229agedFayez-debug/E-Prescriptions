using System;
using System.Collections.Generic;

namespace EPrescriptions.Domain.Entities
{
    public enum UnitType
    {
        Box,
        Strip,
        Unit
    }

    public class SaleInvoice
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; } = DateTime.Now;
        public Guid UserId { get; set; }
        public string UserNameSnapshot { get; set; }
        public Guid? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public decimal Subtotal { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal TotalTax { get; set; }
        public decimal NetPayable { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public string PaymentMethod { get; set; }
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
}
