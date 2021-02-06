ECHO OFF
CLS
SETLOCAL
SET RAMDISK=Z:\

REM ========================================================================

REM Write makelink rules in this section.
REM If a link with correct target already exists, will do nothing.
REM Else it will try to repair link and its target.

CALL:MakeLink /D "E:\Kontakt 5\UserData\Kontakt 5" "%RAMDISK%\Kontakt 5"
CALL:MakeLink /D "E:\Kontakt 5\UserData\NI Resources" "%RAMDISK%\Kontakt 5"
CALL:MakeLink "E:\Kontakt 5\UserData\Service Center\pal.db" "%RAMDISK%\Kontakt 5\pal.db"
CALL:MakeLink /D "E:\Kontakt 6\UserData\Kontakt" "%RAMDISK%\Kontakt 6"
CALL:MakeLink /D "E:\Kontakt 6\UserData\NI Resources" "%RAMDISK%\Kontakt 6"
CALL:MakeLink "E:\Kontakt 6\UserData\Service Center\pal.db" "%RAMDISK%\Kontakt 6\pal.db"
CALL:MakeLink /D "%PROGRAMFILES(X86)%\foobar2000\profile" "%RAMDISK%\Foobar2k"
CALL:MakeLink /D "%LOCALAPPDATA%\Chromium\User Data" "%RAMDISK%\Chromium"
CALL:MakeLink /D "%APPDATA%\Lantern\logs" "%RAMDISK%\Lantern"

REM These cases should be blocked:

REM Is root path
CALL:MakeLink /D C:\..\.a\..\ a

REM Is empty
CALL:MakeLink /D "   " b

REM Missing argument
CALL:MakeLink c:\1

REM Although MakeLink subroutine has a simple security check,
REM it's suggested that you should only use valid absolute path here.

REM ========================================================================

REM Auto pause if new links were made
IF "%MklinkCalled%" == "1" ( PAUSE )
GOTO:EOF

REM ========================================================================

REM GOTO:ReturnTrue to return 1
REM GOTO:ReturnFalse to return 0

:ReturnTrue
EXIT /B 1

:ReturnFalse
EXIT /B 0

REM Assume all path are fully qualified (already expanded by %~f)
REM If relative path is involved, the result may be wrong

:RemoveFile
IF EXIST %1 (
	IF NOT EXIST %1\ (
		DEL /A:- %1 2>nul
	)
)
GOTO:EOF

:RemoveDir
IF EXIST %1\ (
	ECHO Removing directory: %1
	RD /S /Q %1 2>nul
)
GOTO:EOF

:CreateDir
IF EXIST %1\ ( GOTO:EOF )
CALL:RemoveFile %1
MKDIR %1 2>nul
GOTO:EOF

:VerifyLink
SETLOCAL ENABLEDELAYEDEXPANSION
SET V=0
FOR /F "DELIMS=" %%I IN ('DIR /O:N /A:L /B "%~dp1" 2^>nul') DO (
	IF /I "%%I" == "%~nx1" ( GOTO:VerifyLink_LocalLabel )
	SET /A V=!V!+1
)
GOTO:ReturnFalse
:VerifyLink_LocalLabel
REM If delimiter [] is in %2 or current target of %1, result will be wrong
FOR /F "TOKENS=2 DELIMS=[]" %%I IN ('DIR /O:N /A:L "%~dp1"') DO (
	IF !V! == 0 ( IF /I "%%~fsI" == "%~fs2" ( GOTO:ReturnTrue ) ELSE ( GOTO:ReturnFalse ) )
	SET /A V=!V!-1
)
GOTO:ReturnFalse

:CreateDirLink
REM Create parent directory
CALL:CreateDir "%~dp1"
REM Target directory must exist
CALL:CreateDir %2
REM If directory %1 does not exist, just create link
CALL:RemoveFile %1
IF NOT EXIST %1 ( GOTO:CreateDirLink_LocalLabel )
REM Else create link if is not a valid link
CALL:VerifyLink %1 %2
IF %ERRORLEVEL% == 1 ( GOTO:ReturnFalse )
CALL:RemoveDir %1
:CreateDirLink_LocalLabel
MKLINK /D %1 %2 2>nul
IF NOT %ERRORLEVEL% == 0 (
	ECHO Failed to create directory link: %1 =^> %2
)
GOTO:ReturnTrue

:CreateFileLink
REM Create parent directory
CALL:CreateDir "%~dp1"
REM Target must not be a directory
CALL:RemoveDir %2
REM If file %1 does not exist, just create link
CALL:RemoveDir %1
IF NOT EXIST %1 ( GOTO:CreateFileLink_LocalLabel )
REM Else create link if is not a valid link
CALL:VerifyLink %1 %2
IF %ERRORLEVEL% == 1 ( GOTO:ReturnFalse )
CALL:RemoveFile %1
:CreateFileLink_LocalLabel
MKLINK %1 %2 2>nul
IF NOT %ERRORLEVEL% == 0 (
	ECHO Failed to create file link: %1 =^> %2
)
GOTO:ReturnTrue

REM ========================================================================

:IsEmptyArgument
SETLOCAL
SET S=%~1
:IsEmptyArgument_LocalLabel
IF "%S%" == "" ( GOTO:ReturnTrue )
IF NOT "%S:~0,1%" == " " ( GOTO:ReturnFalse )
SET S=%S:~1%
GOTO:IsEmptyArgument_LocalLabel

:IsRootDirectory
SETLOCAL
SET S=%~f1
IF "%S:~-2%" == ":\" ( GOTO:ReturnTrue )
GOTO:ReturnFalse

:MakeLink
SETLOCAL
REM Determine which subroutine to go
IF /I "%~1" == "/D" (
	SHIFT
	SET CreateLink=CreateDirLink
) ELSE (
	SET CreateLink=CreateFileLink
)
REM Expand link path
SET LinkPath="%~f1"
CALL:IsEmptyArgument %LinkPath%
IF %ERRORLEVEL% == 1 (
	ECHO %LinkPath% is not a valid link path!
	GOTO:EOF
)
REM Expand target path
SET TargetPath="%~f2"
CALL:IsEmptyArgument %TargetPath%
IF %ERRORLEVEL% == 1 (
	ECHO %TargetPath% is not a valid target path!
	GOTO:EOF
)
REM Check if link path is root
CALL:IsRootDirectory %1
IF %ERRORLEVEL% == 1 (
	ECHO %LinkPath% is not a valid link path!
	GOTO:EOF
)
REM Do make link
CALL:%CreateLink% %LinkPath% %TargetPath%
IF %ERRORLEVEL% == 1 (
	ENDLOCAL
	SET MklinkCalled=1
	ECHO.
)
GOTO:EOF

REM ========================================================================

REM Unused. How to keep %MklinkCalled% without passing %X% outside?

:RedirectDirToRamDisk
SETLOCAL
SET X=%~d1
CALL:MakeLink /D %1 "%RAMDISK%\%X:~0,1%\%~pnx1"
GOTO:EOF
