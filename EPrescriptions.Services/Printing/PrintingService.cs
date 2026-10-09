using System;
using System.Drawing;
using System.Drawing.Printing;
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

                g.DrawString($"صافي المستحق: {invoice.NetPayable:F2} ج.م", fontHeader, brush, e.PageBounds.Width / 2, y, formatRtl);
                y += 30;
                g.DrawString("نتمنى لكم الشفاء العاجل", fontNormal, brush, e.PageBounds.Width / 2, y, formatRtl);
            };

            printDoc.Print();
        }
    }
}
