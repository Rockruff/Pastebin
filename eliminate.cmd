@ECHO OFF
GOTO:Main

:EliminateSingleFile
IF NOT EXIST %1 (
	REM %1 may already be removed from other hardlink
	GOTO:EOF
)
FSUTIL HARDLINK LIST %1 >nul 2>nul
IF %ERRORLEVEL% == 0 (
	REM Is NTFS, delete the file and its hardlinks.
	FOR /F "DELIMS=" %%i IN ('FSUTIL HARDLINK LIST %1 2^>nul') DO (
		DEL /A:- "%~d1%%i"
	)
) ELSE (
	REM Not NTFS, just delete the file.
	DEL /A:- %1
)
GOTO:EOF

:EliminateFolder
REM Delete files
FOR /F "DELIMS=" %%i IN ('DIR /B /A:-D-L %1 2^>nul') DO (
	CALL:EliminateSingleFile "%~1\%%i"
)
REM Delete subfolders recursively
FOR /F "DELIMS=" %%i IN ('DIR /B /A:D-L %1 2^>nul') DO (
	CALL:EliminateFolder "%~1\%%i"
)
REM Remove self if empty
RD %1 2>nul
GOTO:EOF

:Main
REM No argument provided
IF "%~1" == "" (
	ECHO Deletes files and their hardlinks.
	ECHO.
	ECHO Usage:
	ECHO In terminal: %~n0 path
	ECHO In script: CMD /C %~n0 path
	GOTO:EOF
)
REM Eliminate file if it exists
IF NOT EXIST %1\ (
	CALL:EliminateSingleFile "%~f1"
	GOTO:EOF
)
REM Normalize path
SETLOCAL
SET S=%~f1
IF "%S:~-1%" == "\" (
	SET S=%S:~0,-1%
)
IF "%S:~-1%" == ":" (
	ECHO %S%\ is root directory, operation blocked.
	GOTO:EOF
)
REM Eliminate folder
CALL:EliminateFolder "%S%"
