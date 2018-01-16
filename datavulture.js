var readline = require('readline')
var Twitter = require('twitter')
var sqlite3 = require('sqlite3')
var fs = require('fs')
var query

//parse query and create start message
query = process.argv.slice(2)[0]
var subQueries = query.split(",")
var startmessage = "DataVulture runing! Searching on: '"
for(var j = 0; j < subQueries.length; j++){
  if(j === 0){
    startmessage += subQueries[0] + "'"
    query = subQueries[0] + " "
  }
  else{
    startmessage += " and '" + subQueries[j] + "'"
    query += "," + subQueries[j] + " "
  }
}

//read credentials
fs.readFile("tokens.txt", "UTF-8", ((err, data) => {
    if(err){
      console.log("Could not read credentials file! (tokens.txt in root directory)")
        throw err
    }
    var result = JSON.parse(data)
    startClient(result)
}))

var coordinateAVG = (coord1, coord2) => {
  var long = coord1[0] + ((coord2[0] - coord1[0])/2)
  var lat = coord1[1] + ((coord2[1] - coord1[1])/2)
  return([long, lat])
}

var startClient = (credentials) => {
  console.log(startmessage)

  var client = new Twitter({
    consumer_key: credentials.consumerKey,
    consumer_secret: credentials.consumerSecret,
    access_token_key: credentials.accessToken,
    access_token_secret: credentials.accessTokenSecret
  }, ((err) => {
    if(err){
      console.log(err)
    }
  }))

  var db = new sqlite3.Database('vultureNest.db')
  db.run("CREATE TABLE if not exists tweet_info (id TEXT NOT NULL PRIMARY KEY, query TEXT, longitude TEXT, latitude TEXT, place TEXT, country TEXT, time TEXT, text TEXT)")
  
  client.stream("statuses/filter", {track: query}, ((stream) => {   
    stream.on("data", ((tweet) => {
      if(tweet.coordinates || tweet.place){
        var text = tweet.text.replace(/['"]+/g, '')
        for(var i = 0; i < subQueries.length; i++){
          if(text.indexOf(subQueries[i]) > -1){

            var coordinates
            if(tweet.coordinates){
              coordinates = tweet.coordinates.coordinates
            }else{
              coordinates = tweet.place.bounding_box.coordinates[0]
              var pointA = coordinates[0].toString().split(",")
              var pointB = coordinates[2].toString().split(",")

              coordinates = coordinateAVG([Number(pointA[0]), Number(pointA[1])],
                [Number(pointB[0]), Number(pointB[1])])
            }

            db.run("INSERT INTO tweet_info VALUES ('"
            + JSON.stringify(tweet.id) + "','"
            + subQueries[i] + "','"
            + coordinates[0] + "','"
            + coordinates[1] + "','"
            + JSON.stringify(tweet.place.full_name) + "','"
            + JSON.stringify(tweet.place.country) + "','"
            + Date.now() + "','" 
            + text +"'"
            +" )", ((err) => {
              if(err){
                console.log(err)
              }
            }))

            console.log(":::Search Query hit: " + subQueries[i])
            console.log("ID: " + JSON.stringify(tweet.id))
            console.log("Coordinates: " + JSON.stringify(coordinates))
            console.log("Place: " + JSON.stringify(tweet.place.full_name))
            console.log("Country: " + JSON.stringify(tweet.place.country))
            console.log("Time: " + Date.now()) 
            console.log("Text: " + tweet.text)
            console.log("------------------------------")
  
          }
        }
      }
    }))
    stream.on("error", ((error) => {
      throw error
    }))
  }))
}