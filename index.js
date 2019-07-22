var axios = require("axios");
var cheerio = require("cheerio");
let jsonframe = require('jsonframe-cheerio');

let startAt = process.argv[2]
let endAt = process.argv[3]


 function pageResults(link) {

    let baseURL = "https://app.dps.mn.gov";
    console.log('inside pageResuls fct')

    axios.get(baseURL + link).then((incidentRes) => {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        let incidentPg = incidentRes.data;

        //console.log(incidentPg);

        //let pgContent = incidentPg.match(/<\s*a[^>]*>(.*?)<\s*/\s*a>/g);
        //let pgContent = incidentPg.getElementById()

        var $ = cheerio.load(incidentRes.data);
        jsonframe($); // initializes the plugin

        let frame = {
            "data": {
                _s: "label[for=IncidentTypeDesc]",
                _d: [{
                    "type": "div"
                }]
                //"title": "h1", // this is an inline selector
                //"email": "span[itemprop=email] < email" // output an extracted email
            }
        }

        //console.log( $('#incident-body').scrape(frame, { string: true } ))
        var incidentPage = [];
        $(".row").each(function (i, element) {

            //console.log($(this).find('div').children);
            pageContent = $(this).find("div").text().replace(/\n|   |\t/g, '').split("   ")
            let headerRow = pageContent[0]
            let dataRow = pageContent[1]

            //console.log(headerRow)
            //console.log('--------------')
            //console.log(dataRow)
            let dataObj = {}
            dataObj[i] = pageContent;
            incidentPage.push(dataObj)

        }) //end each loop 
        //console.log(incidentPage['37']['37'])
        //console.log(incidentPage)
        console.log("---^Scrape per page^---");
        let incidentObj = {
            "type": incidentPage['0']['0']['1'].trim(),
            "ICR": incidentPage['0']['0']['3'].trim(),
            "date": incidentPage['0']['0']['5'].trim(),
            "district": incidentPage['2']['2']['1'].trim(),
            "description": incidentPage['4']['4']['1'].trim(),
            "location": incidentPage['6']['6']['1'].trim(),
            "roadConditions"  : incidentPage['9']['9']['1'].trim(),
            "infoComplete"  : incidentPage['12']['12']['0'].trim(),
            "vehicle"  : incidentPage['14']['14']['0'].trim(),
            "airbagDeployed"  : incidentPage['15']['15']['2'].trim(),
            "driverInjury"  : incidentPage['16']['16']['18'].trim(),
            "seatBelt"  : incidentPage['16']['16']['24'].trim(),
            "helmet"  : incidentPage['16']['16']['27'].trim(),
            "alcoholInvolved"  : incidentPage['16']['16']['30'].trim()
        }
        console.log('-------vvDatabase datavvv')
        console.log(incidentObj)

        return incidentObj;



        //incident.page = cheerio
    }).catch((err) => {
        console.log("---Error---\n", err)
    })

} //end pageResult fct def 


pageResults('/MSPMedia2/IncidentDisplay/12386')

async function run (start , end){

    for (let i = start ; i < end +1; i++){

        await pageResults('/MSPMedia2/IncidentDisplay/'+i)

    }


}//end run fct def

//run(12000,12386)
run(startAt,endAt)