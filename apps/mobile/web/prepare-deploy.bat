@echo off
echo Preparing web app for deployment...

REM Copy SDK files from the monorepo
echo Copying SDK files...
if not exist "lib" mkdir "lib"
if not exist "lib\sdk" mkdir "lib\sdk"
xcopy "..\..\packages\sdk\dist" "lib\sdk" /E /I /Y
copy "..\..\packages\sdk\package.json" "lib\sdk\package.json"

REM Fix the SDK package.json paths
echo Fixing SDK package.json paths...
powershell -Command "(Get-Content 'lib\sdk\package.json') -replace './dist/', './' | Set-Content 'lib\sdk\package.json'"

REM Update package.json to use local SDK
echo Updating package.json...
copy "package.deploy.json" "package.json"

echo Deployment preparation complete!
echo You can now deploy from this directory with: vercel deploy --prod
