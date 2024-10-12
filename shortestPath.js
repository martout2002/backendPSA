// dijkstra.js

// Dijkstra's Algorithm to find the shortest path from the start city
// with consideration of both travel times (edges) and wait times (node weights)
const dijkstraWithWaitTimes = (startCity, adjList, waitTimes) => {
    const n = adjList.length; // Number of cities
    const distances = Array(n).fill(Infinity); // Initialize distances to Infinity
    distances[startCity] = 0; // Distance to start city is 0
    const previousCity = Array(n).fill(null); // To store the previous city in the shortest path

    // Priority queue implemented using a min-heap
    const priorityQueue = [[0, startCity]]; // [current_time, city]

    while (priorityQueue.length > 0) {
        // Sort to act like a priority queue (heap), pick the smallest time
        priorityQueue.sort((a, b) => a[0] - b[0]);
        const [currentTime, city] = priorityQueue.shift(); // Extract the city with the smallest time

        // If the current city's time is larger than the recorded shortest time, skip
        if (currentTime > distances[city]) continue;

        // Explore neighbors (adjacent cities)
        for (let [neighbor, travelTime] of adjList[city]) {
            const newTime = currentTime + travelTime + waitTimes[neighbor]; // Add travel time + wait time at neighbor

            // If the new computed time is less than the recorded time, update it
            if (newTime < distances[neighbor]) {
                distances[neighbor] = newTime;
                previousCity[neighbor] = city; // Update the path
                priorityQueue.push([newTime, neighbor]); // Push the neighbor to the queue
            }
        }
    }

    return { distances, previousCity };
};

// Function to reconstruct the path from the start city to a target city
const reconstructPath = (previousCity, targetCity) => {
    const path = [];
    let currentCity = targetCity;
    while (currentCity !== null) {
        path.push(currentCity);
        currentCity = previousCity[currentCity];
    }
    return path.reverse(); // Reverse to get the path from start to target
};

// Export the functions using CommonJS
module.exports = {
    dijkstraWithWaitTimes,
    reconstructPath,
};

const cities = ["CityA", "CityB", "CityC", "CityD"]; // Example cities
const waitTimes = [10, 5, 15, 7]; // Wait times for each city (CityA, CityB, CityC, CityD)

// Adjacency list representing the graph (city -> [[neighbor, travel_time], ...])
const adjList = [
    [[1, 20], [2, 30]], // CityA connects to CityB (distance 20) and CityC (distance 30)
    [[0, 20], [3, 10]], // CityB connects to CityA (distance 20) and CityD (distance 10)
    [[0, 30], [3, 25]], // CityC connects to CityA (distance 30) and CityD (distance 25)
    [[1, 10], [2, 25]], // CityD connects to CityB (distance 10) and CityC (distance 25)
];

// Start city (e.g., index of CityA is 0)
const startCity = 0;

// Run Dijkstra's algorithm to get shortest times and paths
const { distances, previousCity } = dijkstraWithWaitTimes(startCity, adjList, waitTimes);

// Output the shortest times from the start city to all other cities
for (let i = 0; i < cities.length; i++) {
    console.log(`Shortest time from ${cities[startCity]} to ${cities[i]}: ${distances[i]} units`);
}

// Example: Reconstruct the path from start city to a specific target city (e.g., CityD)
const targetCity = 3; // CityD
const path = reconstructPath(previousCity, targetCity);
console.log(`Path from ${cities[startCity]} to ${cities[targetCity]}: ${path.map(cityIndex => cities[cityIndex])}`);