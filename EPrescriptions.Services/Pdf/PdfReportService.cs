using System;
using System.IO;
using EPrescriptions.Domain.Entities;

namespace EPrescriptions.Services.Pdf
{
    public class PdfReportService
    {
        public byte[] GenerateSalesInvoicePdf(SaleInvoice invoice)
        {
            using (var ms = new MemoryStream())
            {
                return ms.ToArray();
            }
        }
    }
}
