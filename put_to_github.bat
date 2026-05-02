@echo off
set "projectPath=C:\Users\rayya\Documents\videomaker\videomaker"
set "repoURL=https://github.com/rayyanmirza123/"

echo Moving to project directory...
cd /d "%projectPath%"

:: Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo Creating .gitignore for React...
    echo # dependencies > .gitignore
    echo /node_modules >> .gitignore
    echo /.pnp >> .gitignore
    echo .pnp.js >> .gitignore
    echo. >> .gitignore
    echo # testing >> .gitignore
    echo /coverage >> .gitignore
    echo. >> .gitignore
    echo # production >> .gitignore
    echo /build >> .gitignore
    echo. >> .gitignore
    echo # misc >> .gitignore
    echo .DS_Store >> .gitignore
    echo .env.local >> .gitignore
    echo .env.development.local >> .gitignore
    echo .env.test.local >> .gitignore
    echo .env.production.local >> .gitignore
)

echo Initializing local Git repository...
git init

echo Adding all files...
git add .

echo Committing files...
git commit -m "Initial commit with auto-generated .gitignore"

echo Setting branch to main...
git branch -M main

:: Remove old remote if it exists and add the new one
git remote remove origin >nul 2>&1
echo Connecting to GitHub...
git remote add origin %repoURL%

echo Pushing to GitHub...
git push -u origin main

echo Done! Refresh your GitHub page to see your files.
pause
	