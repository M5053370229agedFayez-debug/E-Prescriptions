using System;
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
}
