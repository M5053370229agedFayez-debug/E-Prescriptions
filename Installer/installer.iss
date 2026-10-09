; Inno Setup Script for e_prescriptions Pharmacy Management System
; Supports Windows 7 SP1, 8.1, 10, 11 (32-bit & 64-bit)

#define MyAppName "e_prescriptions"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "e_prescriptions Egyptian Pharmacy Systems"
#define MyAppExeName "EPrescriptions.App.exe"

[Setup]
AppId={{9C82B144-8422-4241-94EE-19A2DF9865A1}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputDir=Output
OutputBaseFilename=EPrescriptions_Setup_v{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequired=admin

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "..\EPrescriptions.App\bin\Release\net48\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Code]
function IsDotNet48Detected(): Boolean;
var
  installedRelease: Cardinal;
begin
  Result := False;
  if RegQueryDWordValue(HKLM, 'SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full', 'Release', installedRelease) then
  begin
    if installedRelease >= 528040 then
      Result := True;
  end;
end;

function InitializeSetup(): Boolean;
begin
  if not IsDotNet48Detected() then
  begin
    MsgBox('This application requires .NET Framework 4.8. Please install .NET Framework 4.8 first.', mbError, MB_OK);
    Result := False;
  end
  else
    Result := True;
end;
