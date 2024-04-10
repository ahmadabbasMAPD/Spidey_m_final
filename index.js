// Define server name, port, and host
let SERVER_NAME = 'patient-api';
let PORT = 5000;
let HOST = '127.0.0.1';

// Require necessary modules
const mongoose = require("mongoose");
const errors = require('restify-errors');
const restify = require('restify');

// Set up MongoDB connection string
const patientname = "abbasapollort";
const password = "Pass1234";
const dbname = "mapd713db";
let uristring = "mongodb+srv://abbasapollort:"+password+"@spideydb.c26rjkr.mongodb.net/?retryWrites=true&w=majority"

// Establish the database connection
mongoose.connect(uristring, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', ()=>{
 // Log the successful connection
 console.log("!!!! Connected to db: " + uristring)
});

// Define the patient schema
// Define the patient schema
const patientSchema = new mongoose.Schema({
  name: String,
  age: String,
  address: String,
  gender: String,
  phno: String,
  tests: [
     {
       date: Date, // Add this line to include the date of the test
       bloodPressure: String,
       heartRate: String,
       respiratoryRate: String,
       oxygenSaturation: String,
       bodyTemperature: String,
     },
  ],
 });
 

// Create the patient model
let PatientsModel = mongoose.model('Patients', patientSchema);

// Create the Restify server
let server = restify.createServer({ name: SERVER_NAME });

// Start the server and log available resources
server.listen(PORT, HOST, function () {
 console.log(`Server ${server.name} listening at ${server.url}`);
 console.log('**** Resources: ****');
 console.log('********************');
 console.log(' /Patients');
 console.log(' /Patients/:id');
});

// Configure server plugins
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());


// Create a new patient
server.post('/Patients', function (req, res, next) {
  // Log request details
  console.log('POST /Patients params=>' + JSON.stringify(req.params));
  console.log('POST /Patients body=>' + JSON.stringify(req.body));
 
  // Validate mandatory fields
  if (req.body.name === undefined) {
     return next(new errors.BadRequestError('Name Must Be Provided'));
  }
  if (req.body.age === undefined) {
     return next(new errors.BadRequestError('Age Must Be Provided'));
  }
  if (req.body.address === undefined) {
     return next(new errors.BadRequestError('Address Must Be Provided'));
  }
  if (req.body.gender === undefined) {
     return next(new errors.BadRequestError('Gender Must Be Provided'));
  }
  if (req.body.phno === undefined) {
     return next(new errors.BadRequestError('Phone Number Must Be Provided'));
  }
  if (req.body.tests === undefined) {
      return next(new errors.BadRequestError('Tests Must Be Provided'));
    }
  if (req.body.date.length === 0) {
      return next(new errors.BadRequestError('Date Must Be Provided'));
    }

 
  // Create a new patient instance
  let newPatient = new PatientsModel({
     date: req.body.date, // Include the date of the test from the request body
     name: req.body.name, // Include the name from the request body
     address: req.body.address,
     age: req.body.age,
     gender: req.body.gender,
     phno: req.body.phno,
     tests: req.body.tests, // Include the tests array from the request body
  });
 
  // Save the new patient to the database
  newPatient
     .save()
     .then((patient) => {
       console.log('saved patient: ' + patient);
       res.send(201, patient);
       return next();
     })
     .catch((error) => {
       console.log('error: ' + error);
       return next(new Error(JSON.stringify(error.errors)));
     });
 });
 

// Retrieve all patients
server.get('/Patients', function (req, res, next) {
 console.log('GET /Patients params=>' + JSON.stringify(req.params));

 // Retrieve all patients from the database
 PatientsModel.find({})
    .then((patients) => {
      // Include test data for each patient
      let patientsWithTests = patients.map((patient) => {
        let patientObj = patient.toObject();
        patientObj.tests = patient.tests.length > 0 ? patient.tests : 'No tests available for this patient';
        return patientObj;
      });

      res.send(patientsWithTests);
      return next();
    })
    .catch((error) => {
      return next(new Error(JSON.stringify(error.errors)));
    });
});

// Retrieve a single patient by ID
server.get('/Patients/:id', function (req, res, next) {
 console.log('GET /Patients/:id params=>' + JSON.stringify(req.params));

 // Find a single patient by their id in the database
 PatientsModel.findOne({ _id: req.params.id })
    .then((patient) => {
      console.log('found patient: ' + patient);
      if (patient) {
        res.send(patient);
      } else {
        res.send(404);
      }
      return next();
    })
    .catch((error) => {
      console.log('error: ' + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
});

// Delete a patient by ID
server.del('/Patients/:id', function (req, res, next) {
 console.log('DELETE /Patients/:id params=>' + JSON.stringify(req.params));
 // Delete the patient from the database
 PatientsModel.findOneAndDelete({ _id: req.params.id })
    .then((deletedPatient) => {
      console.log('deleted patient: ' + deletedPatient);
      if (deletedPatient) {
        res.send(200, `Deleted patient with details: ${JSON.stringify(deletedPatient)}`);
      } else {
        res.send(404, 'Patient not found');
      }
      return next();
    })
    .catch((error) => {
      console.log('error: ' + error);
      return next(new errors.InternalServerError(JSON.stringify(error.errors)));
    });
});

// Delete all patients
server.del('/Patients', function (req, res, next) {
 console.log('DELETE /Patients params=>' + JSON.stringify(req.params));
 // Delete all patients from the database
 PatientsModel.deleteMany({})
    .then((deletedPatients) => {
      console.log('Deleted patients: ' + deletedPatients);
      if (deletedPatients.deletedCount > 0) {
        res.send(200, {
          message: 'All patients have been deleted from the database',
          deletedPatients: deletedPatients
        }); // Send a detailed message to both the client and the server
      } else {
        res.send(404, 'No patients found to delete');
      }
      return next();
    })
    .catch((error) => {
      console.log('Error: ' + error);
      return next(new errors.InternalServerError(JSON.stringify(error.errors)));
    });
});

// Add tests for a patient
server.post('/Patients/:id/tests', function (req, res, next) {
 // Log request details
 console.log('POST /Patients/:id/tests params=>' + JSON.stringify(req.params));
 console.log('POST /Patients/:id/tests body=>' + JSON.stringify(req.body));

 // Validate the presence of all test data fields
 if (!req.body.bloodPressure || !req.body.heartRate || !req.body.respiratoryRate || !req.body.oxygenSaturation || !req.body.bodyTemperature) {
    return next(new errors.BadRequestError('All test data fields are required'));
 }

 // Find the patient by ID
 PatientsModel.findById(req.params.id)
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError('Patient not found'));
      }

      // Create a new test object
      const newTest = {
        date: new Date(req.body.date), 
        bloodPressure: req.body.bloodPressure,
        heartRate: req.body.heartRate,
        respiratoryRate: req.body.respiratoryRate,
        oxygenSaturation: req.body.oxygenSaturation,
        bodyTemperature: req.body.bodyTemperature,
      };

      // Define critical condition thresholds
      const criticalConditions = {
        bloodPressure: { min: 70, max: 120 },
        heartRate: { min: 40, max: 100 },
        respiratoryRate: { min: 12, max: 20 },
        oxygenSaturation: { min: 95, max: 100 },
        bodyTemperature: { min: 97, max: 99 },
      };

      let isCritical = false;

      // Check if the test results indicate critical conditions
      if (
        newTest.bloodPressure < criticalConditions.bloodPressure.min ||
        newTest.bloodPressure > criticalConditions.bloodPressure.max ||
        newTest.heartRate < criticalConditions.heartRate.min ||
        newTest.heartRate > criticalConditions.heartRate.max ||
        newTest.respiratoryRate < criticalConditions.respiratoryRate.min ||
        newTest.respiratoryRate > criticalConditions.respiratoryRate.max ||
        newTest.oxygenSaturation < criticalConditions.oxygenSaturation.min ||
        newTest.oxygenSaturation < criticalConditions.oxygenSaturation.min ||
        newTest.oxygenSaturation > criticalConditions.oxygenSaturation.max ||
        newTest.bodyTemperature < criticalConditions.bodyTemperature.min ||
        newTest.bodyTemperature > criticalConditions.bodyTemperature.max
      ) {
        isCritical = true;
      }

      // Add the new test to the patient's test array
      patient.tests.push(newTest);

      // Save the updated patient information
      return patient.save();
    })
    .then((updatedPatient) => {
      // Send appropriate response based on critical condition
      if (isCritical) {
        console.log('Patient is in critical condition:', updatedPatient);
        res.send(200, { criticalConditionData: newTest, patient: updatedPatient });
      } else {
        console.log('Added tests for patient: ' + updatedPatient);
        res.send(200, updatedPatient);
      }
      return next();
    })
    .catch((error) => {
      console.error('Error adding tests:', error);
      // Ensure a response is sent back to the client in case of an error
      res.send(500, { error: 'Failed to add tests', message: error.message });
      return next();
    });
});

server.get('/Patients/critical', function (req, res, next) {
  console.log('GET /Patients/critical');
 
  // Retrieve all patients from the database
  PatientsModel.find({})
     .then((patients) => {
       const criticalPatients = patients.filter((patient) => {
         if (patient.tests.length > 0) {
           const latestTest = patient.tests[patient.tests.length - 1];
           const criticalConditions = {
             bloodPressure: { min: 70, max: 120 },
             heartRate: { min: 40, max: 100 },
             respiratoryRate: { min: 12, max: 20 },
             oxygenSaturation: { min: 95, max: 100 },
             bodyTemperature: { min: 97, max: 99 },
           };
 
           return (
             latestTest.bloodPressure < criticalConditions.bloodPressure.min ||
             latestTest.bloodPressure > criticalConditions.bloodPressure.max ||
             latestTest.heartRate < criticalConditions.heartRate.min ||
             latestTest.heartRate > criticalConditions.heartRate.max ||
             latestTest.respiratoryRate < criticalConditions.respiratoryRate.min ||
             latestTest.respiratoryRate > criticalConditions.respiratoryRate.max ||
             latestTest.oxygenSaturation < criticalConditions.oxygenSaturation.min ||
             latestTest.oxygenSaturation > criticalConditions.oxygenSaturation.max ||
             latestTest.bodyTemperature < criticalConditions.bodyTemperature.min ||
             latestTest.bodyTemperature > criticalConditions.bodyTemperature.max
           );
         }
         return false;
       });
 
       if (criticalPatients.length > 0) {
         res.send(criticalPatients);
       } else {
         res.send(404, 'No patients in critical condition');
       }
       return next();
     })
     .catch((error) => {
       console.error('Error retrieving critical patients:', error);
       return next(new errors.InternalServerError('Error retrieving critical patients'));
     });
 });
 

// Update patient information
server.put('/Patients/:id', function (req, res, next) {
 console.log('PUT /Patients/:id params=>' + JSON.stringify(req.params));
 console.log('PUT /Patients/:id body=>' + JSON.stringify(req.body));

 // Find the patient by ID and update the information
 PatientsModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((updatedPatient) => {
      if (!updatedPatient) {
        return next(new errors.NotFoundError('Patient not found'));
      }
      console.log('Updated patient information: ' + updatedPatient);
      res.send(200, updatedPatient);
      return next();
    })
    .catch((error) => {
      console.log('Error: ' + error);
      return next(new errors.InternalServerError(error.message));
    });
});

// Update the tests of a specific patient
server.put('/Patients/:id/tests', function (req, res, next) {
 console.log('PUT /Patients/:id/tests params=>' + JSON.stringify(req.params));
 console.log('PUT /Patients/:id/tests body=>' + JSON.stringify(req.body));

 // Find the patient by ID and update the tests
 PatientsModel.findById(req.params.id)
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError('Patient not found'));
      }

      // Update the tests for the patient
      patient.tests = req.body.tests;

      // Save the updated patient information
      return patient.save();
    })
    .then((updatedPatient) => {
      console.log('Updated patient tests: ' + updatedPatient);
      res.send(200, { 
        updatedPatient: updatedPatient, 
        clientData: req.body 
      }); // Send the updated patient information and client data to the client
      return next();
    })
    .catch((error) => {
      console.log('Error: ' + error);
      return next(new errors.InternalServerError(error.message));
    });
});

// Delete a specific test for a patient
server.del('/Patients/:id/tests/:testId', function (req, res, next) {
 console.log('DELETE /Patients/:id/tests/:testId params=>' + JSON.stringify(req.params));

 const { id, testId } = req.params;

 // Find the patient by ID
 PatientsModel.findById(id)
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError('Patient not found'));
      }

      // Find the index of the test to delete
      const index = patient.tests.findIndex((test) => test._id == testId);

      if (index === -1) {
        return next(new errors.NotFoundError('Test not found for the patient'));
      }

      // Remove the test from the tests array
      const deletedTest = patient.tests.splice(index, 1);

      // Save the updated patient information
      return patient.save().then((updatedPatient) => {
        console.log('Deleted test for patient: ' + updatedPatient);
        res.send(200, { 
          message: 'Test deleted for the patient', 
          deletedTest: deletedTest, 
          updatedPatient: updatedPatient 
        }); // Send the deleted message and necessary details to the client
        return next();
      });
    })
    .catch((error) => {
      console.log('Error: ' + error);
      return next(new errors.InternalServerError(error.message));
    });
});
