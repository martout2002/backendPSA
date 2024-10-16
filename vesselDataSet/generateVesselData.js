const { faker } = require('@faker-js/faker');
const { psaPortsCoordinates } = require('./ports');
const { db } = require('../firebase/firebaseMethods');
const { getFirestore, doc, setDoc, collection } = require('firebase/firestore');
const { getWayPointsAndPortOrder } = require('../ports/service/seaDistanceService');


//Give 
function generateRoute(ports, avoidZones, startPoint) {
    const truncatedRoute = [];

    const details = getWayPointsAndPortOrder(ports, avoidZones, startPoint);
    const route = details.allWaypoints;

    //every 10 waypoints is 20km
    const steps = 10;
    
    for (i = 0 ; i < route.length; i+= steps) {
        truncatedRoute = route[i];
    }

    
    return truncatedRoute;
}

// Function to generate a random number of unique ports
function getRandomPorts(num) {
    const uniquePorts = new Set();
    while (uniquePorts.size < num) {
        const randomPort = psaPortsCoordinates[Math.floor(Math.random() * psaPortsCoordinates.length)];
        uniquePorts.add(randomPort);
    }
    return Array.from(uniquePorts);
}

// Helper function to generate random estimated times of arrival for each port
function generateETAs(portStops, averageSpeed = 30) { // averageSpeed in nautical miles per hour
    const etas = [];
    let currentTime = Date.now(); // Use current time as the starting point

    for (let i = 0; i < portStops.length; i++) {
        if (i > 0) {
            // Calculate the distance between the current and previous port
            const prevPort = portStops[i - 1];
            const currentPort = portStops[i];
            const distance = getDistanceFromLatLonInKm(
                prevPort.latitude,
                prevPort.longitude,
                currentPort.latitude,
                currentPort.longitude
            ) * 0.539957; // Convert km to nautical miles

            // Calculate time to travel this distance
            const travelTime = (distance / averageSpeed) * 3600 * 1000; // Time in milliseconds
            currentTime += travelTime;
        }

        // Push the ETA as a new attribute
        etas.push(new Date(currentTime).toISOString());
    }

    return etas;
}

// Haversine formula to calculate distance between two lat/lon points
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Generate 100 vessels data
const vesselData = Array.from({ length: 100 }, () => {
    const portStopsCount = Math.floor(Math.random() * 5) + 2; // Randomize the number of ports (2 to 6)
    const portStops = getRandomPorts(portStopsCount); // Get random ports
    const etas = generateETAs(portStops); // Generate ETAs for each port

    // Add the ETA attribute to each port
    const portStopsWithETA = portStops.map((port, index) => ({
        ...port,
        estimatedTimeOfArrival: etas[index],
    }));

    return {
        portStops: portStopsWithETA,
        routes: generateRoute(portStops),
        info: {
            MMSI: Math.floor(Math.random() * (999999999 - 200000000 + 1)) + 200000000,
            ShipName: faker.company.name(),
        },
    };
});

/*console.log(vesselData[1]);
console.log(vesselData[1].routes[1]);
console.log(vesselData[1].portStops[1]);*/

// Function to save vessel data to Firestore
async function saveVesselData(vessel) {
    try {
        const docRef = db.collection("vesselData").doc(`vessel_${vessel.info.MMSI}`); // Create document reference
        await docRef.set(vessel);
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

saveVesselData(vesselData[1]);

module.exports =  {vesselData}