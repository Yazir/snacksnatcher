const fs = require('fs')
const http = require('http')
const path = require('path')
const open = require('open')
const port = 8080

const app = http.createServer(function (req, res) {
    fs.readFile(path.join(__dirname, 'dst', req.url), function (err,data) {
        if (err) {
            res.writeHead(404)
            res.end(JSON.stringify(err))
            return
        }
        res.writeHead(200)
        res.end(data)
    })

}).listen(port)

if (app.listening) {
    console.log(`Listening at ${port}`)
    open('http://localhost:8080/index.html')
} else {
    console.error(`There was an error opening a server`)
}


