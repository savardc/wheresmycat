const Request = require('request')
const MongoClient = require('mongodb').MongoClient

/**
 * Webtask to store ins & outs of my cat and the weather at the time of the event.
 * Two secrets are required:
 * - mongoUrl which is the url of the MongoDB to use to store the events
 * - forecastToken is the token API for Forecast.io
 *
 * Query parameters:
 * - catIsOut: boolean to specify whether the can is going in or out
 * - longitude: current longitude for the weather
 * - latitude: current latitude for the weather
*/
module.exports = function (ctx, done) {
  MongoClient.connect(ctx.data.mongoUrl, function (err, db) {
    if (err) {
      return done(err)
    }

    // Get current weather from Forecast.io
    const reqOptions = {
      json: true,
      url: `https://api.forecast.io/forecast/${ctx.data.forecastToken}/${ctx.data.latitude},${ctx.data.longitude}`
    }
    Request.get(reqOptions, (err, res, body) => {
      if (err != null) {
        return done(err)
      }

      // Insert event in collection
      db.collection('inandout', (err, collection) => {
        if (err) {
          return done(err)
        }

        const ev = {
          time: Date.now(),
          catIsOut: ctx.data.catIsOut,
          weather: body.currently.icon
        }
        collection.insertOne(ev, (err, r) => {
          if (err) {
            return done(err)
          }
          done(null)
        })
      })
    })
  })
}
