// Import necessary Firebase Admin SDK modules
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wooper-f2100.firebaseio.com" // Replace with your actual database URL if you're using Realtime Database
});

// Initialize Firestore
const db = admin.firestore();

// NEWS RELATED //////////////////////////////////////
const addNewsData = async (newsData) => {
  try {
    // Ensure no undefined or invalid values in the data
    if (!newsData || !newsData.title || !newsData.area || typeof newsData.delayInHours !== 'number') {
      throw new Error("Invalid data structure");
    }
    const docRef = await db.collection('news').add(newsData);
    console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const fetchNewsState = async (title) => {
  try {
    // Query the Firestore collection to find the document by title
    const querySnapshot = await db.collection('news').where('title', '==', title).get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.accepted;
    } else {
      throw new Error(`No article found with the title "${title}".`);
    }
  } catch (error) {
    console.error("Error updating article:", error);
    throw new Error("Error updating article.");
  }
}

const updateNewsAccept = async (title, accepted) => {
  try {
    // Query the Firestore collection to find the document by title
    const querySnapshot = await db.collection('news').where('title', '==', title).get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      await doc.ref.update({ accepted });
      return { message: `Article titled "${title}" updated successfully.` };
    } else {
      throw new Error(`No article found with the title "${title}".`);
    }
  } catch (error) {
    console.error("Error updating article:", error);
    throw new Error("Error updating article.");
  }
}

const fetchAllNewsData = async () => {
  try {
    const querySnapshot = await db.collection('news').get();
    const news = querySnapshot.docs.map(doc => doc.data());
    return news;
  } catch (error) {
    console.error('Error fetching documents: ', error);
    return [];
  }
};

const checkNewsExists = async (inputTitle) => {
  try {
    const yourCollectionRef = db.collection('news');
    const querySnapshot = await yourCollectionRef.where("title", "==", inputTitle).get();
    
    if (!querySnapshot.empty) {
      return true; // Document exists
    } else {
      return false; // No document found
    }
  } catch (error) {
    console.error("Error checking document:", error);
    return false;
  }
};

// VESSEL RELATED //////////////////////////////////////
const fetchSpecificVesselDataName = async (shipName) => {
  try {
    const snapshot = await db.collection("vesselData").where("info.ShipName", "==", shipName).get();

    if (snapshot.empty) {
      console.error('No matching documents found!');
    }

    // Get the first document
    const doc = snapshot.docs[0];
    const shipData = doc.data(); // Get the document data

    return shipData;
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

async function fetchSpecificVesselDataID(mmsi) {
    try {
        const docRef = db.collection("vesselData").doc(`vessel_${mmsi}`);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.error('No matching documents found!');
        } else {
            console.log('Document data:', doc.data());
            return doc.data(); // Return the vessel data
        }
    } catch (error) {
        console.error("Error fetching document: ", error);
    }
}

const fetchAllVesselData = async () => {
  try {
    const querySnapshot = await db.collection('vesselData').get();
    const vessel = querySnapshot.docs.map(doc => doc.data());
    //console.log("Fetched Vessel Data: ", vessel);
    return vessel;
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const updateSpecificVesselData = async (vessel) => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

// RECORD RELATED //////////////////////////////////////
const fetchSpecificRecordData = async (newsTitle) => {
  try {
    const recordsCollection = db.collection("record");
    const querySnapshot = await recordsCollection
      .where("newsTitle", "==", newsTitle)
      .get();

    if (querySnapshot.empty) {
      console.log("No matching records found.");
      return [];
    }

    // Extract the document data
    const specificRecordsData = [];
    querySnapshot.forEach((docSnapshot) => {
      //console.log("Document data:", docSnapshot.data()); // Debugging output
      specificRecordsData.push({
        recordId: docSnapshot.id,
        ...docSnapshot.data(),
      });
    });

    //console.log("Fetched specific records data:", specificRecordsData);

    return specificRecordsData;
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const fetchAllByNewsRecordData = async () => {
  try {
    const recordsCollection = db.collection("record");
    const querySnapshot = await recordsCollection.get();

    if (querySnapshot.empty) {
      console.log("No records found.");
      return [];
    }

    const recordsData = [];
    querySnapshot.forEach((docSnapshot) => {
      console.log("Document data:", docSnapshot.data()); // Debug the data for each document
      recordsData.push({
        recordId: docSnapshot.id,
        ...docSnapshot.data(),
      });
    });

    console.log("Fetched records data:", recordsData); // Debug the final array

    return recordsData;
  } catch (error) {
    console.error('Error fetching records:', error.message);
    return [];
  }
};



const addRecordData = async (record) => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

// APPOINTMENT RELATED //////////////////////////////////////
const fetchSpecificAppointmentData = async (shipName, portName) => {
  try {
    const snapshot = await db.collection("appointment")
      .where("shipName", "==", shipName)
      .where("portName", "==", portName)
      .get();

    if (snapshot.empty) {
      console.log('No matching documents found.');
      return [];
    }

    // Map through the documents to extract data
    const appointments = snapshot.docs.map(doc => doc.data());
    return appointments;
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const fetchAllByPortAppointmentData = async (portName) => {
    try {
      const snapshot = await db.collection("appointment")
        .where("portName", "==", portName) // Filter by portName
        .get();
  
      if (snapshot.empty) {
        console.log('No appointments found for the specified port.');
        return [];
      }
  
      // Map through the documents to extract data
      const appointments = snapshot.docs.map(doc => doc.data());
      return appointments;
  
    } catch (error) {
      console.error('Error fetching appointment data: ', error.message);
      throw error; // Optionally rethrow the error for further handling
    }
  };

const updateSpecificAppointmentData = async (appointment) => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

const addAppointmentData = async (appointment) => {
  try {
    
  } catch (error) {
    console.error('Error adding document: ', error.message);
  }
};

// Export the functions for use in other files
module.exports = {fetchSpecificVesselDataID, 
                  fetchSpecificVesselDataName,
                  fetchAllVesselData, 
                  updateSpecificVesselData, 
                  addRecordData, 
                  fetchSpecificRecordData, 
                  fetchAllByNewsRecordData, 
                  addNewsData, 
                  fetchNewsState,
                  updateNewsAccept,
                  fetchAllNewsData, 
                  fetchAllByPortAppointmentData, 
                  fetchSpecificAppointmentData, 
                  updateSpecificAppointmentData, 
                  addAppointmentData}
