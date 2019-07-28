var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

//*** Sample Response from Indicent page
//  **{
//     type: 'Injury',
//     ICR: '19201737',
//     date: '07/02/2019 08:25',
//     district: '2200 Mankato',
//     description: 'Eastbound Highway 14 at 110th street, Saint Mary Twp, WasecaCounty',
//     location: 'The Peterbilt Semi was traveling Eastbound on Highway 14.  The Toyota ' +
//       'Camry was also traveling Eastbound on Highway 14 when they collided.',
//     roadConditions: 'Dry',
//     infoComplete: 'Information believed complete',
//     vehicle: '2012 Peterbilt Semi truck/trailer',
//     airbagDeployed: 'No',
//     driverInjury: 'None',
//     seatBelt: 'Yes',
//     helmet: 'Not Applicable',
//     alcoholInvolved: 'No'
//   } 



// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var IncidentSchema = new Schema({

injury: {
    type: String,
    required: false

  },
  // `link` is required and of type String
  ICR: {
    type: String,
    required: false

  },
  date:{
    type: String,
    required: false
  },
  district:{
    type: String,
    required: false
  },
  description:{
    type: String,
    required: false
  },
  location:{
    type: String,
    required: false
  },
  roadConditions:{
    type: String,
    required: false
  },
  infoComplete:{
    type: String,
    required: false
  },
  vehicle:{
    type: String,
    required: false
  },
  airbagDeployed:{
    type: String,
    required: false
  },
  driverInjury:{
    type: String,
    required: false
  },
  seatBelt:{
    type: String,
    required: false
  },
  helmet:{
    type: String,
    required: false
  },
  alcoholInvolved:{
    type: String,
    required: false
  }
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Incident with an associated Note
//   note: {
//     type: Schema.Types.ObjectId,
//     ref: "Note"
//   }
});

// This creates our model from the above schema, using mongoose's model method
var Incident = mongoose.model("Incident", IncidentSchema);

// Export the Incident model
module.exports = Incident;
