$pages = Get-ChildItem -Path . -Recurse -Filter "page.tsx" -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -like "*student*" -and ($_.FullName -like "*course*" -or $_.FullName -like "*quiz*" -or $_.FullName -like "*certificat*") }

$msgFiles = Get-ChildItem -Path ".\messages" -Filter "*.json" -ErrorAction SilentlyContinue

$output = @()
$output += "===================== ملفات الترجمة ====================="
foreach ($m in $msgFiles) {
  $output += "===== $($m.FullName) ====="
  $output += Get-Content -LiteralPath $m.FullName -Raw
  $output += ""
}

$output += "===================== الصفحات ====================="
foreach ($p in $pages) {
  $output += "===== $($p.FullName) ====="
  $output += Get-Content -LiteralPath $p.FullName -Raw
  $output += ""
}

$output | Out-File -FilePath "student_pages_dump2.txt" -Encoding utf8
notepad student_pages_dump2.txt
