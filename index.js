const { exec } = require('child_process');
const http = require('http');
const url = require('url');

http.createServer(function(req, res) {
    var queryObject = url.parse(req.url, true).query;
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    if (queryObject.videoUrl) {
        var ipadIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        if (ipadIp && ipadIp.includes(',')) {
            ipadIp = ipadIp.split(',')[0].trim();
        }

        var command = 'yt-dlp -g ' +
                      '--add-header "X-Forwarded-For:' + ipadIp + '" ' +
                      '--add-header "Client-IP:' + ipadIp + '" ' +
                      '"' + queryObject.videoUrl + '"';

        exec(command, function(error, stdout, stderr) {
            if (error) {
                res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end('Ошибка парсинга: ' + stderr);
            } else {
                res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end(stdout.trim());
            }
        });
    } else {
        res.writeHead(400);
        res.end('Missing videoUrl');
    }
}).listen(process.env.PORT || 3000);
