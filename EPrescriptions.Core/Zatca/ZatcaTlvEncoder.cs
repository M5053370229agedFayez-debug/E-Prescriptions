using System;
using System.Collections.Generic;
using System.Text;

namespace EPrescriptions.Core.Zatca
{
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
}
