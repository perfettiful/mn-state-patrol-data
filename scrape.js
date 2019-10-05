var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
// Require all models
var db = require("./models");


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/incident-scrape";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});

let startAt = parseInt(process.argv[2])
let endAt = parseInt(process.argv[3])

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
            "fullURL" : fullURL,
            "injury": incidentPage['0']['0']['1'].trim(),
            "ICR": incidentPage['0']['0']['3'].trim(),
            "date": incidentPage['0']['0']['5'].trim(),
            "district": incidentPage['2']['2']['1'].trim(),
            "location": incidentPage['4']['4']['1'].trim(),
            "description": incidentPage['6']['6']['1'].trim(),
            "roadConditions"  : incidentPage['9']['9']['1'].trim(),
            "infoComplete"  : incidentPage['12']['12']['0'].trim(),
            "vehicle"  : incidentPage['14']['14']['0'].trim(),
            "airbagDeployed"  : incidentPage['15']['15']['2'].trim(),
            "driverInjury"  : incidentPage['16']['16']['18'].trim(),
            "seatBelt"  : incidentPage['16']['16']['24'].trim(),
            "helmet"  : incidentPage['16']['16']['27'].trim(),
            "alcoholInvolved"  : incidentPage['16']['16']['30'].trim()
        }   
        
        console.log(incidentObj)
        console.log("----------^ SCRAPED PAGE "+i+" ^-----------\n\n");

        db.Incident.create(incidentObj)

        .then(function (dbIncident) {
            console.log("----------v v INSERTED PAGE "+i+"  vvv")
            console.log(dbIncident)

        })

        .catch(function (err) {
            console.log("---ERROR Code on page "+i+"\n===  ",err.code +"\n===  " + err.errmsg)
        })

        
    }).catch((err) => {
        let incidentObj = {
            "type": "N/A",
            "ICR": "N/A",
            "date":  "N/A",
            "district":  "N/A",
            "location":  "N/A",
            "description":  "N/A",
            "roadConditions"  : "N/A",
            "infoComplete"  :  "N/A",
            "vehicle"  :  "N/A",
            "airbagDeployed"  : "N/A",
            "driverInjury"  :  "N/A",
            "seatBelt"  :  "N/A",
            "helmet"  :  "N/A",
            "alcoholInvolved"  :  "N/A"
        }
        console.log("-------vv  Database ERROR data  "+i+" vvv---")
        console.log(err)

    })
} //end pageResult fct def 


//pageResults('/MSPMedia2/IncidentDisplay/12386')
async function run (start , end){

    for ( i = start ; i < end +1; i++){
        console.log('=========== On Page ', i)

        await pageResults('/MSPMedia2/IncidentDisplay/'+i, i)

    }
}//end run fct def


//run(12373,12386)
run(startAt,endAt)
//https://app.dps.mn.gov/MSPMedia2/IncidentDisplay/<index>
//first page in DB: https://app.dps.mn.gov/MSPMedia2/IncidentDisplay/7749
//last page in DB: https://app.dps.mn.gov/MSPMedia2/IncidentDisplay/12446