$files = Get-ChildItem -Path "c:\manage\web\app" -Recurse -Include "*.ts","*.tsx" -Exclude "node_modules",".next"
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the file contains "/fitness"
    if ($content -match "/fitness") {
        # 1. Replace "/fitness/ (and variants)
        $content = $content -replace '"/fitness/', '"/'
        $content = $content -replace "'/fitness/", "'/"
        $content = $content -replace '`/fitness/', '`/'

        # 2. Replace "/fitness" with "/" (and variants)
        $content = $content -replace '"/fitness"', '"/"'
        $content = $content -replace "'/fitness'", "'/'"
        $content = $content -replace '`/fitness`', '`/`'

        # 3. Handle query params directly after
        $content = $content -replace '"/fitness\?', '"/?'
        $content = $content -replace "'/fitness\?", "'/?"
        $content = $content -replace '`/fitness\?', '`/?'

        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated $($file.Name)"
    }
}
