ECHO OFF
CLS

IF NOT EXIST X:\ (
	TIMEOUT /T 10
)

GOTO:ScriptMain

==========================================================================

::L1 Start::
Default
First Run
Local State
::L1 End::

::L2 Start::
Bookmarks
Login Data
Preferences
Secure Preferences
Extensions
Local Extension Settings
::L2 End::

::L3 Start::
lang
tools
torrents
BitComet.exe
BitComet.xml
Downloads.xml
::L3 End::

::L4 Start::
Cubase 10.5_64
::L4 End::

::L5 Start::
vlc-qt-interface.ini
vlcrc
::L5 End::

::L6 Start::
AStyle.exe
clang-format.exe
Format.cmd
::L6 End::

::L7 Start::
env.ini
EUDC
sgim_ext.bin
sgim_fix_first.bin
sgim_usr_v3new.bin
::L7 End::

::L8 Start::
Config.cupf
Correction.ini
HWSignature.dll
Install64.exe
pandorabox.cupf
PersonalCenter.cupf
PersonalCenter.ini
PinyinUp.exe
Punctures.ini
Resource.dll
RichInput.cupf
runtime.ini
SetupUI.cupf
SGDownload.exe
sgim_adjcache.bin
sgim_annex.bin
sgim_core.bin
sgim_eng.bin
sgim_eng_pre.bin
sgim_hz.bin
sgim_phrases.bin
sgim_py.bin
sgim_quick.bin
sgim_simtra.bin
sgim_url.bin
SGTool.exe
Skin.dat
SmartInfo.cupf
SoftKeyBoard.cupf
SogouPY7.ime
Uninstall.exe
userNetSchedule.exe
Wizard.cupf
ZipLib.dll
ZipLib64.dll
::L8 End::

::L9 Start::
config
log
sdmc
rom
::L9 End::

==========================================================================

REM %1: abspath to cleanup. %2: whitelist name
:HandleDirectory
IF EXIST "%~dpnx1\" (
	FOR /F "DELIMS=" %%i IN ('DIR /A:- /B "%~dpnx1"') DO (
		CALL:HandleSingleEntry "%~dpnx1\%%i" %2
	)
)
GOTO:EOF

REM %1: abspath to check. %2: whitelist name
:HandleSingleEntry
REM Never delete script itself
IF /I "%~dpnxs0"=="%~dpnxs1" (
	ECHO Skipped "%~dpnxs1" since it's script itself
	GOTO:EOF
)
REM Search in list
SETLOCAL EnableDelayedExpansion
SET listFound=0
FOR /F "USEBACKQ DELIMS=" %%i IN ("%~dpnx0") DO (
	IF !listFound!==0 (
		REM Whitelist start found
		IF /I "%%i"=="::%~2 Start::" (
			SET listFound=1
		)
	) ELSE (
		REM Name is in whitelist, exit without delete.
		IF /I "%%i"=="%~nx1" (
			GOTO:EXIT
		)
		REM Reached end of whitelist, will do delete.
		IF /I "%%i"=="::%~2 End::" (
			GOTO:DELETE
		)
	)
)
:DELETE
IF EXIST "%~dpnx1\" (
	RD /S /Q "%~dpnx1"
) ELSE (
	DEL /A:- "%~dpnx1"
)
:EXIT
ENDLOCAL
GOTO:EOF

==========================================================================

REM %1 Path to delete empty dir recursively. %2: Dir to keep
:CleanEmptyDir
IF EXIST "%~dpnx1\" (
	FOR /F "DELIMS=" %%i IN ('DIR /B /A:D-L %1') DO (
		CALL:CleanEmptyDir "%~dpnx1\%%i" %2
	)
	FOR /F "DELIMS=" %%i IN ('DIR /B /A:- %1') DO (
		GOTO:EOF
	)
	IF /I NOT "%~dpnxs2"=="%~dpnxs1" (
		RD %1
	)
)
GOTO:EOF

==========================================================================

:ScriptMain

REM Chrome
SET ChromeAppData=Z:\Chromium
CALL:HandleDirectory "%ChromeAppData%" L1
CALL:HandleDirectory "%ChromeAppData%\Default" L2
DEL /F /S /Q /A:- "%ChromeAppData%\Default\Local Extension Settings\LO*" >nul 2>nul
REG DELETE HKCU\Software\Chromium /f >nul 2>nul
REG DELETE HKCU\Software\Google /f >nul 2>nul
REG DELETE HKLM\Software\Wow6432Node\Google /f >nul 2>nul

REM BitComet
CALL:HandleDirectory "C:\Users\Administrator\AppData\Roaming\BitComet" L3

REM Cubase
CALL:HandleDirectory "C:\Users\Administrator\AppData\Roaming\Steinberg" L4

REM VLC
CALL:HandleDirectory "C:\Users\Administrator\AppData\Roaming\vlc" L5

REM DevCpp
CALL:HandleDirectory "C:\Program Files (x86)\Dev-Cpp\AStyle" L6

REM SougouPY
CALL:HandleDirectory "C:\Users\Administrator\AppData\LocalLow\SogouPY" L7
CALL:HandleDirectory "C:\Program Files (x86)\SogouInput\9.5.0.3517" L8
REG DELETE HKCU\Software\SogouInput\IMEPB /f >nul 2>nul

REM Citra
CALL:HandleDirectory "e:\Citra\user" L9

REM Clear tracing
REG DELETE HKLM\SOFTWARE\Microsoft\Tracing /f >nul 2>nul
REG DELETE HKLM\Software\Wow6432Node\Microsoft\Tracing /f >nul 2>nul

REM Reset explorer window size
REG DELETE "HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\Bags\AllFolders\Shell" /v "MinPos1920x1080x120(1).x" /f >nul 2>nul
REG DELETE "HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\Bags\AllFolders\Shell" /v "MinPos1920x1080x120(1).y" /f >nul 2>nul
REG DELETE "HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\Bags\AllFolders\Shell" /v "MaxPos1920x1080x120(1).x" /f >nul 2>nul
REG DELETE "HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\Bags\AllFolders\Shell" /v "MaxPos1920x1080x120(1).y" /f >nul 2>nul
REG DELETE "HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\Bags\AllFolders\Shell" /v "WinPos1920x1080x120(1).left" /f >nul 2>nul
REG DELETE "HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\Bags\AllFolders\Shell" /v "WinPos1920x1080x120(1).top" /f >nul 2>nul
REG DELETE "HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\Bags\AllFolders\Shell" /v "WinPos1920x1080x120(1).right" /f >nul 2>nul
REG DELETE "HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\Bags\AllFolders\Shell" /v "WinPos1920x1080x120(1).bottom" /f >nul 2>nul

REM Reset notepad window size
REG DELETE "HKCU\Software\Microsoft\Notepad" /v "iWindowPosDX" /f >nul 2>nul
REG DELETE "HKCU\Software\Microsoft\Notepad" /v "iWindowPosDY" /f >nul 2>nul
REG DELETE "HKCU\Software\Microsoft\Notepad" /v "iWindowPosX" /f >nul 2>nul
REG DELETE "HKCU\Software\Microsoft\Notepad" /v "iWindowPosY" /f >nul 2>nul

REM General
"C:\Program Files\CCleaner\CCleaner64.exe" /Auto

REM Documents
"C:\Tools\ProjectClean.exe" "D:\Administrator\Documents\Cubase Projects" "D:\Administrator\Documents\Cubase Projects older"
CALL:CleanEmptyDir "C:\Users\Administrator\Documents" "C:\Users\Administrator\Documents"

IF EXIST "%PROGRAMDATA%\autobk.inc" (
REM IK Multimedia license cache
DEL /A:- "%PROGRAMDATA%\autobk.inc" "%APPDATA%\Microsoft\Windows\Cookies\isindex.dat" "%APPDATA%\msregsvv.dll"
DEL /A:- "%WINDIR%\msocreg32.dat" "%WINDIR%\System32\isindex.dat" "%WINDIR%\System32\msvcsv60.dll" "%WINDIR%\System32\w3data.vss"
)

IF EXIST X:\ (
REM PE mode cleanup. C:\*.log may delete chrome extension data, make sure they're in ramdisk.
REM C:\desktop.ini is removed from here.
DEL /F /S /Q /A:- C:\*.log C:\*.tmp C:\*.chk C:\*.old C:\*.bak C:\*.dmp C:\index.dat
DEL /F /S /Q /A:- C:\*.regtrans-ms C:\*.tm.blf C:\*.TxR.blf C:\*.etl C:\*.etl.* C:\*.evtx
DEL /A:- C:\ProgramData\Huorong\Sysdiag\applog.db C:\ProgramData\Huorong\Sysdiag\log.db C:\ProgramData\Huorong\Sysdiag\*.db-*

RD /S /Q "C:\Users\Administrator\AppData\LocalLow\Microsoft\CryptnetUrlCache"
RD /S /Q "C:\Windows\ServiceProfiles\NetworkService\AppData\LocalLow\Microsoft\CryptnetUrlCache"
RD /S /Q "C:\Windows\ServiceProfiles\LocalService\AppData"
RD /S /Q "C:\ProgramData\Microsoft\Windows\Caches"
RD /S /Q "C:\Users\Administrator\AppData\Local\Microsoft\Windows\Caches"
RD /S /Q "C:\ProgramData\Microsoft\Network"
RD /S /Q "C:\ProgramData\Microsoft\Search"

CALL:CleanEmptyDir "C:\Users\Administrator\AppData" "C:\Users\Administrator\AppData\Local\Temp"
CALL:CleanEmptyDir "C:\ProgramData" "C:\ProgramData\Microsoft\Windows\DeviceMetadataStore"
)