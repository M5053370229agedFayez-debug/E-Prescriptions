// Service to package all C# .NET solution projects into a downloadable ZIP
import JSZip from 'jszip';
import { CSHARP_SOLUTION_FILES } from '../csharp-source';

export async function downloadCSharpSolutionZip(): Promise<void> {
  const zip = new JSZip();

  // Add all solution files into their respective project folders
  for (const file of CSHARP_SOLUTION_FILES) {
    zip.file(file.path, file.content);
  }

  // Add documentation README for Visual Studio 2022 setup
  const readmeContent = `# e_prescriptions - حل نظام إدارة الصيدليات المتكامل لسطح المكتب (.NET Framework 4.8 / WPF)

## متطلبات التشغيل والتطوير:
1. نظام التشغيل: Windows 7 SP1, 8.1, 10, 11 (32-bit & 64-bit).
2. إطار العمل: .NET Framework 4.8 Developer Pack.
3. بيئة التطوير: Visual Studio 2022 (أو 2019) مع تثبيت حزمة ".NET desktop development".
4. قاعدة البيانات: SQLite المحلية المضمنة (System.Data.SQLite) مع تشفير SQLCipher.
5. مثبت Inno Setup 6 (لتجميع ملف EPrescriptions_Setup_v1.0.0.exe).

## المشاريع المضمنة في الحل (EPrescriptions.sln):
- EPrescriptions.Core: أدوات مساعدة، تشفير PBKDF2، سلسلة هاش لسجل المالك، تشفير ZATCA TLV Base64، تفقيط العملة المصرية.
- EPrescriptions.Domain: الكيانات (الأدوية، فواتير المبيعات والمشتريات، المستخدمين، العملاء، الموردين، سجل المالك).
- EPrescriptions.Data: طبقة البيانات Dapper/SQLite مع الفلتر المركزي لعزل حساب المالك (UserScopedQueryFilter) ومراقب الحفظ (OwnerAuditSaveChangesInterceptor).
- EPrescriptions.Services: الطباعة الحرارية (80مم / 58مم) وفواتير A4، تقارير PDF عبر QuestPDF، تصدير ClosedXML، باركود ZXing.Net، حاسبة الزكاة الشرعية.
- EPrescriptions.App: واجهات WPF بتصميم عربي أصيل RTL وتدرجات الألوان الزرقاء والبنفسجية ونظام MVVM و Dependency Injection.
- EPrescriptions.Tests: اختبارات xUnit و Moq لعزل المالك والتأكد من أمان النظام.

## خطوات البناء:
1. افتح EPrescriptions.sln في Visual Studio 2022.
2. اضغط بالزر الأيمن على الحل واختر "Restore NuGet Packages".
3. اختر Configuration: Release و Platform: Any CPU.
4. اضغط Build Solution (F6).
5. لتشغيل الاختبارات: Test -> Run All Tests.
`;
  zip.file('README.md', readmeContent);

  const contentBlob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(contentBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'EPrescriptions-dotnet48-full-solution.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
