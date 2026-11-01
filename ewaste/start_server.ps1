# EcoCycle Lightweight Local HTTP Server (Built-in .NET HttpListener)
# No external dependencies or packages needed!

$Port = 8080
$Folder = $PSScriptRoot

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://localhost:$Port/")
$Listener.Prefixes.Add("http://127.0.0.1:$Port/")

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  EcoCycle - Smart E-Waste Management & Circular Platform" -ForegroundColor Cyan
Write-Host "  Local Web Server running on: http://localhost:$Port/" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green

try {
    $Listener.Start()
    Start-Process "http://localhost:$Port/"
} catch {
    Write-Warning "Could not start HTTP listener: $_. Opening file directly in browser..."
    Start-Process "$Folder\index.html"
    exit
}

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".json" = "application/json"
}

while ($Listener.IsListening) {
    try {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $UrlPath = $Request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($UrlPath)) {
            $UrlPath = "index.html"
        }

        $FilePath = Join-Path $Folder $UrlPath.Replace('/', '\')

        if (Test-Path $FilePath -PathType Leaf) {
            $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }
            $Bytes = [System.IO.File]::ReadAllBytes($FilePath)

            $Response.ContentType = $ContentType
            $Response.ContentLength64 = $Bytes.Length
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $NotFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $Response.OutputStream.Write($NotFound, 0, $NotFound.Length)
        }
        $Response.OutputStream.Close()
    } catch {
        # ignore client disconnects
    }
}
