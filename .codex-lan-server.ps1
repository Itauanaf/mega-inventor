$root = [System.IO.Path]::GetFullPath('D:\Mega-Inventor\mega-inventor\.lan-preview')
$server = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, 8000)
$server.Start()

while ($true) {
    $client = $server.AcceptTcpClient()
    try {
        $stream = $client.GetStream()
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
        $requestLine = $reader.ReadLine()
        while (($headerLine = $reader.ReadLine()) -ne '') {
            if ($null -eq $headerLine) { break }
        }

        $requestPath = if ($requestLine -match '^GET\s+([^\s]+)') { $matches[1] } else { '/' }
        $relativePath = [Uri]::UnescapeDataString(($requestPath.Split('?')[0]).TrimStart('/'))
        if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }
        $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))

        if (-not $filePath.StartsWith($root) -or -not [System.IO.File]::Exists($filePath)) {
            $body = [System.Text.Encoding]::UTF8.GetBytes('404 - Arquivo não encontrado')
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        } else {
            $mimeTypes = @{
                '.html' = 'text/html; charset=utf-8'
                '.css' = 'text/css; charset=utf-8'
                '.js' = 'text/javascript; charset=utf-8'
                '.png' = 'image/png'
                '.jpg' = 'image/jpeg'
                '.jpeg' = 'image/jpeg'
                '.svg' = 'image/svg+xml'
                '.webp' = 'image/webp'
            }
            $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
            $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
            $body = [System.IO.File]::ReadAllBytes($filePath)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        }

        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($body, 0, $body.Length)
        $stream.Flush()
    } finally {
        $client.Close()
    }
}
