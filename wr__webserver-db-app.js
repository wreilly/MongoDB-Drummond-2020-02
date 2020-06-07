/*
2020-06-07
http://www.robert-drummond.com/2013/04/25/a-node-js-application-on-amazon-cloud-part-3-a-simple-webserver-in-javascript-using-node-express-and-mongodb/

https://github.com/wreilly/MongoDB-Drummond-2020-02
 */

const http = require('http');
const mongoose = require('mongoose');
const express = require('express');

const app = express();

let db;

const configWRLocal = {
    "USER": "",
    "PASS": "",
    "HOST": "localhost",
    "PORT": "27017",
    "DATABASE": "video"
};
/*
> use video
switched to db video
> show collections
greetings
movieDetails
movies
moviesScratch
reviews
> db.greetings.find()
{ "_id" : ObjectId("59fdb08957d97ac1bfd8d34c"), "wr__sentence" : "Hello Voild!", "__v" : 0 }
{ "_id" : ObjectId("59fdb1845efa9cc1e6b648a2"), "wr__sentence" : "Hello Voild!", "__v" : 0 }
{ "_id" : ObjectId("5a003b62971cc21a513515b3"), "wr__sentence" : "Hello Voild!", "__v" : 0 }
>
 */

const dbConnectPathProtocol = "mongodb://" +
    configWRLocal.USER + ":" +
    configWRLocal.PASS + "@" +
    configWRLocal.HOST + ":" +
    configWRLocal.PORT + "/" +
    configWRLocal.DATABASE;

console.log('dbConnectPathProtocol: ', dbConnectPathProtocol)

const standardGreeting = 'Hello World!'; // sez Dennis Ritchie


/*
https://mongoosejs.com/docs/4.x/docs/guide.html
 */
const greetingSchema = mongoose.Schema({
    wr__sentence: String
});

/*
https://mongoosejs.com/docs/4.x/docs/models.html
'Greeting' is *singular* for Model name.
It corresponds to *plural* name of Collection:
'greetings'
 */
const Greeting = mongoose.Model('Greeting', greetingSchema);

console.log('\n001 Attempting to connect to MongoDB instance on LOCAL!... ', configWRLocal.HOST)

db = mongoose.connect(dbConnectPathProtocol);


mongoose.connection.on('error', function(err) {
   console.log('database connect error: ', err);
});

mongoose.connection.once('open', function() {
    let greeting = '';
    console.log('database ' + configWRLocal.DATABASE + '  is now open on ' + configWRLocal.HOST)

    Greeting.find( function (err, greetings) {
        if (!err && greetings) {
            console.log(greetings.length + ' greeting(s) already exist in database.')
        } else {
            console.log('no greetings in database yet, creating one')
        }
        greeting = new Greeting({ wr__sentence: standardGreeting})
        greeting.save(function (err, greetingsav) {
            if (err) {
                // TODO handle the error
                console.log('couldn\'t save a greeting to the database!')
            } else {
                console.log('new greeting ' + greeting.wr__sentence + ' was successfully saved to the database. Bon.');
                console.log('btw greetingsav was ', greetingsav);
                Greeting.find( function(err, greetings) {
                    if (greetings) {
                        console.log('checked after save: did find ' + greetings.length + ' greetings now in the database. Tres bien.')
                    }
                })
            }
        }) // /greeting.save()
    }) // /Greeting.find()
}); // /mongoose.connection.once()

app.get('/', function(req, res) {
    let responseText;
    console.log('received client request')
    if ( !Greeting ) {
        console.log('Database not ready. sigh.')
    }

    Greeting.find(function(err, greetings) {
        if(err) {
            console.log('couldn\'t find a greeting in the database. error ' + err)
            next(err)
        } else {
            if(greetings) {
                console.log('found ' + greetings.length + ' greetings in the database. Great.')
                responseText = greetings[0].wr__sentence
            }
            console.log('sending greeting to client ' + responseText)
            res.send(responseText)
        }
    })
}); // /app.get()

app.use(function (err, req, res, next) {
    if (req.xhr) {
        res.send(500, 'uh-oh');
    } else {
        next(err);
    }
});

console.log('Starting the Express / Node web server...');
app.listen(9000);
console.log('Webserver is listening on port 9000');
