var express = require('express')
var fs = require('fs')
var sqlite3 = require('sqlite3')

var db = new sqlite3.Database('vultureNest.db')
var app = express()

app.get('/test', (req, res, next) => {
    res.send("testing testing")
})

app.get('/', (req, res, next) => {
    res.sendFile(__dirname + "/index.html")
})

app.get('/JSON/:searchTerm', (req, res, next) => {
    if(req.params.searchTerm === '*'){
        db.serialize( () => {
            db.all("SELECT * FROM tweet_info" , (err, data) => {
                res.send(JSON.stringify(data))
                console.log("Request for " + req.params.searchTerm + " from " + req.connection.remoteAddress)
            })
        })
    } else {
        db.serialize( () => {
            db.all("SELECT * FROM tweet_info WHERE query='" + req.params.searchTerm + "'" , (err, data) => {
                res.send(JSON.stringify(data))
                console.log("Request for " + req.params.searchTerm + " from " + req.connection.remoteAddress)
            })
        })
    }

})
app.use(express.static('public'))
app.use(express.static('vendor'))

var server = app.listen(3000, () => {
    var host = server.address().address;
	var port = server.address().port;
	console.log('VultureServer is listening at http://%s:%s', host, port);
})

