var readline = require('readline')
var Twitter = require('twitter')
var sqlite3 = require('sqlite3')
var query

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

var prompt = ((question, callback) => {
  var stdin = process.stdin
  var stdout = process.stdout
  stdin.resume()
  stdout.write(question)
  stdin.once('data', function (data) {
      callback(data.toString().trim())
  })
})

console.log(startmessage)
prompt('Enter acces token secret: ', ((input1)=>{
  prompt('Enter consumer secret', ((input2) => {
    var client = new Twitter({
      consumer_key: 'SuXJxrU2JTpeKbyXBtwrgCml2',
      consumer_secret: input2,
      access_token_key: '242694137-y0301nTcEGnUZCCoe1Z64iog2VHHv4OV1zZIO7t3',
      access_token_secret: input1
    }, ((err) => {
      if(err){
        console.log(err)
      }
    }))
    
    var db = new sqlite3.Database('vultureNest.db')
    db.run("CREATE TABLE if not exists tweet_info (id TEXT, query TEXT, place TEXT, country TEXT, time TEXT, text TEXT)")

    client.stream("statuses/filter", {track: query}, ((stream) => {   
      stream.on("data", ((tweet) => {
        if(tweet.place){
          var text = tweet.text.replace(/['"]+/g, '')
          for(var i = 0; i < subQueries.length; i++){
            if(text.indexOf(subQueries[i]) > -1){
    
              db.run("INSERT INTO tweet_info VALUES ('"
              + JSON.stringify(tweet.id) + "','"
              + subQueries[i] + "','"
              + JSON.stringify(tweet.place.full_name) + "','"
              + JSON.stringify(tweet.place.country) + "','"
              + Date.now() + "','" 
              + text +"'"
              +" )", ((err) => {
                if(err){
                  console.log(err)
                }
              }))
              // console.log(text)
              console.log(":::Search Query hit: " + subQueries[i])
              console.log("ID: " + JSON.stringify(tweet.id))
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
  }))
}))






const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

var count = ((count) => {
  readline.clearLine()
  readline.cursorTo(rl.output, 0)
  rl.write("Count:" + count)
})




