Write-Host "دورت على صفحات Student (courses/quizzes/certificates):" -ForegroundColor Cyan
$pages = Get-ChildItem -Path . -Recurse -Filter "page.tsx" -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -like "*student*" -and ($_.FullName -like "*course*" -or $_.FullName -like "*quiz*" -or $_.FullName -like "*certificat*") }

$pages | Select-Object -ExpandProperty FullName

Write-Host ""
Write-Host "دورت على ملفات الترجمة الحالية:" -ForegroundColor Cyan
$msgFiles = Get-ChildItem -Path . -Recurse -Filter "*.json" -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -like "*messages*" }
$msgFiles | Select-Object -ExpandProperty FullName

$output = @()
$output += "===================== الصفحات ====================="
foreach ($p in $pages) {
  $output += "===== $($p.FullName) ====="
  $output += Get-Content -LiteralPath $p.FullName -Raw
  $output += ""
}

$output += "===================== ملفات الترجمة ====================="
foreach ($m in $msgFiles) {
  $output += "===== $($m.FullName) ====="
  $output += Get-Content -LiteralPath $m.FullName -Raw
  $output += ""
}

$output | Out-File -FilePath "student_pages_dump.txt" -Encoding utf8
notepad student_pages_dump.txt
