var axios = require("axios");
var cheerio = require("cheerio");
let jsonframe = require('jsonframe-cheerio');

let baseURL = "https://app.dps.mn.gov";

function pageResults (link) {
    console.log('inside pageResuls fct')

  axios.get(baseURL+link).then( (incidentRes) => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    let incidentPg = incidentRes.data;

    //console.log(incidentPg);

    //let pgContent = incidentPg.match(/<\s*a[^>]*>(.*?)<\s*/\s*a>/g);
    //let pgContent = incidentPg.getElementById()

    var $ = cheerio.load(incidentRes.data);
    jsonframe($); // initializes the plugin

    let frame = {
        "data":{
        _s:"label[for=IncidentTypeDesc]",
        _d:[{
                "type": "div"
        }]
        //"title": "h1", // this is an inline selector
        //"email": "span[itemprop=email] < email" // output an extracted email
    }}

    //console.log( $('#incident-body').scrape(frame, { string: true } ))
    var incidentData = [];
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
        incidentData.push(dataObj)

    })//end each loop 
    console.log(incidentData['37']['37'])
    console.log("---^Scrape per page^---");
    

    //incident.page = cheerio
    }).catch((err)=>{console.log("---Error---\n",err)})

}//end pageResult fct def 

pageResults('/MSPMedia2/IncidentDisplay/12386')