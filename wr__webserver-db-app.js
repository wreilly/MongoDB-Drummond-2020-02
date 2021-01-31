/* EC2 VERSION
ec2-3-221-127-38.compute-1.amazonaws.com

2020-06-07
http://www.robert-drummond.com/2013/04/25/a-node-js-application-on-amazon-cloud-part-3-a-simple-webserver-in-javascript-using-node-express-and-mongodb/

https://github.com/wreilly/MongoDB-Drummond-2020-02


 */

const http = require('http');
const mongoose = require('mongoose');
const express = require('express');

const app = express();

let db;

// WR__ 2021-01-31
/* Finding:
Each STOP and START of EC2 w. MongoDB
gets you a NEW Public IP # and Public DNS URL.

WAS (2020...)
ec2-3-221-127-38.compute-1.amazonaws.com
IS NOW (2021 Jan/Feb)
ec2-18-207-104-167.compute-1.amazonaws.com
*/
const myHostAtAWS = 'ec2-18-207-104-167.compute-1.amazonaws.com';

const configWRLocal = {
    "USER": "",
    "PASS": "",
// WAS:    "HOST": "ec2-3-221-127-38.compute-1.amazonaws.com",
    "HOST": myHostAtAWS,
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

console.log('EDITED 999 !!! dbConnectPathProtocol: ', dbConnectPathProtocol)

const standardGreeting = 'Hello World! the 2nd'; // sez Dennis Ritchie


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
/* Oops. 'Model', not 'model'
const Greeting = mongoose.Model('Greeting', greetingSchema);
*/
const Greeting = mongoose.model('Greeting', greetingSchema);

console.log('\nEDITED 999 !!! 001 Attempting to connect to MongoDB instance on EC2!... ', configWRLocal.HOST)

if ( !(db = mongoose.connect(dbConnectPathProtocol)) )
    console.log('Unable to connect to MongoDB at ' + dbConnectPathProtocol);
else
    console.log('connecting to MongoDB at ' + dbConnectPathProtocol);


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
                console.log('btw greetingsav was ', greetingsav); // see notes at bottom
                Greeting.find( function(err, greetings) {
                    if (greetings) {
                        console.log('checked after save: did find ' + greetings.length + ' greetings now in the database. Tres bien. EDITED 999 !!! ')
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
                console.log('found ' + greetings.length + ' greetings in the database. Great. EDITED 999 !!! ')
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

console.log('Starting the Express / Node web server... EDITED 999 !!! ');
app.listen(9000);
console.log('Webserver is listening on port 9000');

/*
$ node wr__webserver-db-app.js
dbConnectPathProtocol:  mongodb://:@localhost:27017/video

001 Attempting to connect to MongoDB instance on LOCAL!...  localhost
Starting the Express / Node web server...
Webserver is listening on port 9000
(node:7695) DeprecationWarning: `open()` is deprecated in mongoose >= 4.11.0, use `openUri()` instead, or set the `useMongoClient` option if using `connect()` or `createConnection()`. See http://mongoosejs.com/docs/4.x/docs/connections.html#use-mongo-client
database video  is now open on localhost
3 greeting(s) already exist in database.
(node:7695) DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
new greeting Hello World! was successfully saved to the database. Bon.
btw greetingsav was  model {
  '$__': InternalCache {
    strictMode: true,
    selected: undefined,
    shardval: undefined,
    saveError: undefined,
    validationError: undefined,
    adhocPaths: undefined,
    removing: undefined,
    inserting: true,
    version: undefined,
    getters: {},
    _id: 5edd070fe174611e0f865208,
    populate: undefined,
    populated: undefined,
    wasPopulated: false,
    scope: undefined,
    activePaths: StateMachine {
      paths: {},
      states: [Object],
      stateNames: [Array],
      map: [Function]
    },
    pathsToScopes: {},
    ownerDocument: undefined,
    fullPath: undefined,
    emitter: EventEmitter {
      _events: [Object: null prototype] {},
      _eventsCount: 0,
      _maxListeners: 0
    },
    '$options': true
  },
  isNew: false,
  errors: undefined,
  _doc: {
    _id: 5edd070fe174611e0f865208,
    wr__sentence: 'Hello World!',
    __v: 0
  }
}
checked after save: did find 4 greetings now in the database. Tres bien.


 */
