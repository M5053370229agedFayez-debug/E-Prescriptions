using System;

namespace EPrescriptions.Services.Zakat
{
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
}
