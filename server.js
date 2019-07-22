var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.port || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrap3";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});


// Routes

let baseURL = "https://app.dps.mn.gov";

function pageResults (link) {

  axios.get(baseURL+link).then(function (incidentRes) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var cherrio = cheerio.load(incidentRes.data);

    console.log("Scrape per page");
    console.log(cheerio);

    //incident.page = cheerio
    

    })

}//end pageResult fct def 

pageResults('https://app.dps.mn.gov/MSPMedia2/IncidentDisplay/12386')

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
      // First, we grab the body of the html with axios
       axios.get("https://app.dps.mn.gov/MSPMedia2/Current").then(function (searchRes) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(searchRes.data);
            var result = {};

            // Now, we grab every h2 within an article tag, and do the following:
            $("a").each(function (i, element) {
              // Save an empty result object
              var incident = {};

              

              // Add the text and href of every link, and save them as properties of the result object
              incident.link = $(this)
                //.find("a")
                .attr("href")

              //await pageResults(incident.link)

                  result["link" + i] = incident

                  console.log(i)

                  // result.title = $(this)
                  //   .find("a")
                  //   .text();

                  // result.summary = $(this)
                  //   .find("p")
                  //   .text()


                  // Create a new Article using the `result` object built from scraping
                  // db.Article.create(result)
                  //   .then(function (dbArticle) {
                  //     // View the added result in the console
                  //     console.log(dbArticle);
                  //   })
                  //   .catch(function (err) {
                  //     // If an error occurred, log it
                  //     console.log(err);
                  //   });

                });
                // Send a message to the client

                console.log('Scrapes:', result)
                //res.send("Scrape Complete\n");
                res.json(result)

              });
            });

            // Route for getting all Articles from the db
            app.get("/articles", function (req, res) {
              // TODO: Finish the route so it grabs all of the articles
              db.Article.find({})
                .then(function (dbArticle) {
                  // If all Users are successfully found, send them back to the client
                  res.json(dbArticle);
                })
                .catch(function (err) {
                  // If an error occurs, send the error back to the client
                  res.json(err);
                });
            });

            // Route for grabbing a specific Article by id, populate it with it's note
            app.get("/articles/:id", function (req, res) {
              // TODO
              // ====
              // Finish the route so it finds one article using the req.params.id,
              // and run the populate method with "note",
              // then responds with the article with the note included
              db.Article.findOne({
                  _id: req.params.id
                })
                // Specify that we want to populate the retrieved libraries with any associated books
                .populate("note")
                .then(function (dbArticle) {
                  // If any Libraries are found, send them to the client with any associated Books
                  res.json(dbArticle);
                })
            });

            // Route for saving/updating an Article's associated Note
            app.post("/articles/:id", function (req, res) {
              // TODO
              // ====
              // save the new note that gets posted to the Notes collection
              // then find an article from the req.params.id
              // and update it's "note" property with the _id of the new note
              db.Note.create(req.body)
                .then(function (dbNote) {
                  return db.Article.findOneAndUpdate({
                    _id: req.params.id
                  }, {
                    note: dbNote._id
                  }, {
                    new: true
                  });
                })
                .then(function (dbArticle) {
                  // If the User was updated successfully, send it back to the client
                  res.json(dbArticle);
                })
                .catch(function (err) {
                  // If an error occurs, send it back to the client
                  res.json(err);
                });
            });

            // Start the server
            app.listen(PORT, function () {
              console.log("App running on port " + PORT + "!");
            });