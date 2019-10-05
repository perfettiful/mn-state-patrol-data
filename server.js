var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/incident-scrape";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});


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

function pageResults(link) {

  axios.get(baseURL + link).then(function (incidentRes) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var cherrio = cheerio.load(incidentRes.data);

    console.log("Scrape per page");
    console.log(cheerio);

    //incident.page = cheerio


  })

} //end pageResult fct def 

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


app.get("/scrape-range/:start/:end", (req, res) => {

  let startAt = parseInt(req.params.start)
  let endAt = parseInt(req.params.end)

  let i = startAt;

  async function pageResults(link, i) {

    let baseURL = "https://app.dps.mn.gov";

    let fullURL = baseURL + link;

    axios.get(baseURL + link).then((incidentRes) => {

      let incidentPg = incidentRes.data;

      var $ = cheerio.load(incidentRes.data);

      var incidentPage = [];
      $(".row").each(function (i, element) {

        pageContent = $(this).find("div").text().replace(/\n|   |\t/g, '').split("   ")
        let headerRow = pageContent[0]
        let dataRow = pageContent[1]


        let dataObj = {}
        dataObj[i] = pageContent;
        incidentPage.push(dataObj)

      }) //end each loop 

      let incidentObj = {
        "page": i,
        "fullURL": fullURL,
        "injury": incidentPage['0']['0']['1'].trim(),
        "ICR": incidentPage['0']['0']['3'].trim(),
        "date": incidentPage['0']['0']['5'].trim(),
        "district": incidentPage['2']['2']['1'].trim(),
        "location": incidentPage['4']['4']['1'].trim(),
        "description": incidentPage['6']['6']['1'].trim(),
        "roadConditions": incidentPage['9']['9']['1'].trim(),
        "infoComplete": incidentPage['12']['12']['0'].trim(),
        "vehicle": incidentPage['14']['14']['0'].trim(),
        "airbagDeployed": incidentPage['15']['15']['2'].trim(),
        "driverInjury": incidentPage['16']['16']['18'].trim(),
        "seatBelt": incidentPage['16']['16']['24'].trim(),
        "helmet": incidentPage['16']['16']['27'].trim(),
        "alcoholInvolved": incidentPage['16']['16']['30'].trim()
      }

      console.log(incidentObj)
      console.log("----------^ SCRAPED PAGE " + i + " ^-----------\n\n");

      db.Incident.create(incidentObj)

        .then(function (dbIncident) {
          console.log("----------v v INSERTED PAGE " + i + "  vvv")
          console.log(dbIncident)

        })

        .catch(function (err) {
          console.log("---ERROR Code on page " + i + "\n===  ", err.code + "\n===  " + err.errmsg)
        })


    }).catch((err) => {
      let incidentObj = {
        "type": "N/A",
        "ICR": "N/A",
        "date": "N/A",
        "district": "N/A",
        "location": "N/A",
        "description": "N/A",
        "roadConditions": "N/A",
        "infoComplete": "N/A",
        "vehicle": "N/A",
        "airbagDeployed": "N/A",
        "driverInjury": "N/A",
        "seatBelt": "N/A",
        "helmet": "N/A",
        "alcoholInvolved": "N/A"
      }
      console.log("-------vv  Database ERROR data  " + i + " vvv---")
      console.log(err)

    })
  } //end pageResult fct def 


  //pageResults('/MSPMedia2/IncidentDisplay/12386')
  async function run(start, end) {

    for (i = start; i < end + 1; i++) {
      console.log('=========== On Page ', i)

      await pageResults('/MSPMedia2/IncidentDisplay/' + i, i)

    }
  } //end run fct def


  //run(12373,12386)
  run(startAt, endAt)
  //https://app.dps.mn.gov/MSPMedia2/IncidentDisplay/<index>
  //first page in DB: https://app.dps.mn.gov/MSPMedia2/IncidentDisplay/7749
  //last page in DB: https://app.dps.mn.gov/MSPMedia2/IncidentDisplay/12446

  res.send("---Scraped!!!---")
}); //END GET route '/scrape-range'
// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});