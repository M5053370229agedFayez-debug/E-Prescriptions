using System;

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
}
