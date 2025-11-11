# Test n8n Content Generation Webhook (PowerShell version for Windows)
# Usage: .\test-n8n-webhook.ps1

Write-Host "🚀 Testing n8n Content Generation Workflow..." -ForegroundColor Cyan
Write-Host ""

# Webhook URL from your n8n instance
$webhookUrl = "https://n8n-production-30ce.up.railway.app/webhook/generate-content"

# Test payload with your existing proposal
$payload = @{
    proposalId = "c3b74454-50a4-40d1-aa61-b66c4dea5043"
    courseId = 1
} | ConvertTo-Json

Write-Host "📤 Sending request to: $webhookUrl" -ForegroundColor Yellow
Write-Host "📝 Payload: $payload" -ForegroundColor Gray
Write-Host ""
Write-Host "⏱️  Expected execution time: 5-15 minutes (if loop works)" -ForegroundColor Green
Write-Host "⏱️  Bug execution time: ~3 seconds (if loop still broken)" -ForegroundColor Red
Write-Host ""

# Measure execution time
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

try {
    # Send request
    $response = Invoke-WebRequest -Uri $webhookUrl `
        -Method POST `
        -ContentType "application/json" `
        -Body $payload `
        -TimeoutSec 1000

    $stopwatch.Stop()

    Write-Host "📥 Response:" -ForegroundColor Cyan
    Write-Host "HTTP Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Time: $($stopwatch.Elapsed.TotalSeconds)s" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Gray
    Write-Host $response.Content

    Write-Host ""
    if ($stopwatch.Elapsed.TotalSeconds -lt 10) {
        Write-Host "❌ LOOP BUG: Completed in $($stopwatch.Elapsed.TotalSeconds)s (expected 5-15 minutes)" -ForegroundColor Red
        Write-Host "   The loop did NOT iterate properly." -ForegroundColor Red
    } else {
        Write-Host "✅ SUCCESS: Took $($stopwatch.Elapsed.TotalSeconds)s - loop appears to be working!" -ForegroundColor Green
    }
} catch {
    $stopwatch.Stop()
    Write-Host "❌ ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Time elapsed before error: $($stopwatch.Elapsed.TotalSeconds)s" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Check n8n Executions tab for detailed results:" -ForegroundColor Cyan
Write-Host "   https://n8n-production-30ce.up.railway.app/workflows" -ForegroundColor Blue
