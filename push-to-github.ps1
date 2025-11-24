# PowerShell script to initialize git and push to GitHub
# Auto-detects Git installation and adds to PATH if needed

# Function to find Git installation
function Find-Git {
    $gitPaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
        "$env:ProgramFiles\Git\cmd\git.exe"
    )
    
    foreach ($path in $gitPaths) {
        if (Test-Path $path) {
            $gitDir = Split-Path (Split-Path $path)
            return $gitDir
        }
    }
    
    return $null
}

# Check if git is available
$gitCmd = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitCmd) {
    Write-Host "Git not found in PATH. Searching for Git installation..." -ForegroundColor Yellow
    $gitDir = Find-Git
    
    if ($gitDir) {
        Write-Host "Found Git at: $gitDir" -ForegroundColor Green
        $env:Path = "$gitDir\cmd;$env:Path"
        Write-Host "Added Git to PATH for this session." -ForegroundColor Green
    } else {
        Write-Host "`nERROR: Git is not installed or could not be found." -ForegroundColor Red
        Write-Host "`nPlease install Git using one of these methods:" -ForegroundColor Yellow
        Write-Host "1. Download from: https://git-scm.com/download/win" -ForegroundColor Cyan
        Write-Host "   Make sure to select 'Add Git to PATH' during installation." -ForegroundColor Cyan
        Write-Host "`n2. Or install via winget (if available):" -ForegroundColor Cyan
        Write-Host "   winget install --id Git.Git -e --source winget" -ForegroundColor Cyan
        Write-Host "`n3. Or install via Chocolatey (if available):" -ForegroundColor Cyan
        Write-Host "   choco install git" -ForegroundColor Cyan
        Write-Host "`nAfter installing Git, restart your terminal and run this script again." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "Git found in PATH." -ForegroundColor Green
}

# Check if git user is configured
Write-Host "`nChecking git configuration..." -ForegroundColor Green
$gitUserName = git config user.name 2>$null
$gitUserEmail = git config user.email 2>$null

if ([string]::IsNullOrWhiteSpace($gitUserName) -or [string]::IsNullOrWhiteSpace($gitUserEmail)) {
    Write-Host "WARNING: Git user.name or user.email is not configured." -ForegroundColor Yellow
    Write-Host "This is required to make commits. The script will attempt to continue," -ForegroundColor Yellow
    Write-Host "but you may need to configure Git first if the commit fails." -ForegroundColor Yellow
    Write-Host "`nTo configure Git, run:" -ForegroundColor Cyan
    Write-Host "  git config --global user.name 'Your Name'" -ForegroundColor Cyan
    Write-Host "  git config --global user.email 'your.email@example.com'" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "`nInitializing git repository..." -ForegroundColor Green
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to initialize git repository." -ForegroundColor Red
    exit 1
}

Write-Host "Adding remote repository..." -ForegroundColor Green
# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote 'origin' already exists. Updating..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/AnmolChoudharyCode/Blue-Fire-Wealth.git
} else {
    git remote add origin https://github.com/AnmolChoudharyCode/Blue-Fire-Wealth.git
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to add remote repository." -ForegroundColor Red
    exit 1
}

Write-Host "Adding all files..." -ForegroundColor Green
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to add files." -ForegroundColor Red
    exit 1
}

# Check if there are any changes to commit
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes to commit. Checking if repository already has commits..." -ForegroundColor Yellow
    $commitCount = (git rev-list --count HEAD 2>$null)
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($commitCount)) {
        Write-Host "ERROR: No files to commit and no existing commits." -ForegroundColor Red
        exit 1
    } else {
        Write-Host "Repository already has commits. Proceeding to push..." -ForegroundColor Green
    }
} else {
    Write-Host "Creating initial commit..." -ForegroundColor Green
    git commit -m "Initial commit: Blue Fire Wealth management application"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create commit." -ForegroundColor Red
        Write-Host "This might be because:" -ForegroundColor Yellow
        Write-Host "  - Git user.name and user.email are not configured" -ForegroundColor Yellow
        Write-Host "  - Run: git config --global user.name 'Your Name'" -ForegroundColor Cyan
        Write-Host "  - Run: git config --global user.email 'your.email@example.com'" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host "Setting main branch..." -ForegroundColor Green
# Get current branch name
$currentBranch = git branch --show-current 2>$null
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    # No branch exists yet, create main
    git checkout -b main 2>$null
    if ($LASTEXITCODE -ne 0) {
        git branch -M main
    }
} else {
    if ($currentBranch -ne "main") {
        git branch -M main
    }
}

# Verify that we have a branch to push
$branchExists = git rev-parse --verify main 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: 'main' branch does not exist. Cannot push." -ForegroundColor Red
    Write-Host "Current git status:" -ForegroundColor Yellow
    git status
    exit 1
}

Write-Host "Pushing to GitHub..." -ForegroundColor Green
Write-Host "Note: You may be prompted for your GitHub credentials" -ForegroundColor Yellow

# Try to push and capture output
$pushOutput = git push -u origin main 2>&1 | Out-String
$pushExitCode = $LASTEXITCODE

if ($pushExitCode -ne 0) {
    # Check if it's a non-fast-forward error (remote has commits we don't have)
    if ($pushOutput -match "non-fast-forward" -or $pushOutput -match "Updates were rejected") {
        Write-Host "`nRemote repository has commits that your local repository doesn't have." -ForegroundColor Yellow
        Write-Host "This usually happens when the repository was initialized on GitHub with a README." -ForegroundColor Yellow
        Write-Host "`nPulling remote changes and merging..." -ForegroundColor Green
        
        # Fetch remote changes
        git fetch origin main
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to fetch from remote." -ForegroundColor Red
            exit 1
        }
        
        # Try to merge (allow unrelated histories if needed)
        Write-Host "Merging remote changes..." -ForegroundColor Green
        git pull origin main --allow-unrelated-histories --no-edit
        if ($LASTEXITCODE -ne 0) {
            Write-Host "WARNING: Merge had conflicts or failed. Attempting to continue..." -ForegroundColor Yellow
            # If merge fails, try rebase
            git pull --rebase origin main --allow-unrelated-histories
            if ($LASTEXITCODE -ne 0) {
                Write-Host "ERROR: Failed to merge remote changes." -ForegroundColor Red
                Write-Host "You may need to resolve conflicts manually or force push." -ForegroundColor Yellow
                Write-Host "`nTo force push (overwrites remote): git push -u origin main --force" -ForegroundColor Cyan
                exit 1
            }
        }
        
        # Try pushing again after merge
        Write-Host "Pushing merged changes..." -ForegroundColor Green
        git push -u origin main
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`nERROR: Failed to push after merge." -ForegroundColor Red
            Write-Host "This might be due to:" -ForegroundColor Yellow
            Write-Host "  - Authentication issues (check your GitHub credentials)" -ForegroundColor Yellow
            Write-Host "  - Repository permissions" -ForegroundColor Yellow
            Write-Host "  - Merge conflicts that need to be resolved" -ForegroundColor Yellow
            exit 1
        }
    } else {
        # Other error (authentication, network, etc.)
        Write-Host "`nERROR: Failed to push to GitHub." -ForegroundColor Red
        Write-Host "This might be due to:" -ForegroundColor Yellow
        Write-Host "  - Authentication issues (check your GitHub credentials)" -ForegroundColor Yellow
        Write-Host "    GitHub requires a Personal Access Token instead of password." -ForegroundColor Yellow
        Write-Host "    Create one at: https://github.com/settings/tokens" -ForegroundColor Cyan
        Write-Host "  - Repository permissions" -ForegroundColor Yellow
        Write-Host "  - Network connectivity" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`nDone! Your code has been pushed to GitHub." -ForegroundColor Green

