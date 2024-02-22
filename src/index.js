// configurable cacheTime and maxNoOfTimes, where cacheTime is amount of time the function should serve from cache 
// and maxNoOfTimes is maximum number of times it should return from cache
const cacheTime = 2000;
const maxNoOfTimes = 4;

function configureAPI(cacheTime, maxNoOfTimes) {
  const cache = {};
  return async (url) => {
    const now = Date.now();
    if (cache[url]) {
      if (cache[url]?.timeStamp < now) {
        console.log("deleting from cache")
        delete cache[url];
      }
      if (cache[url]?.counter > maxNoOfTimes) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (cache[url]) {
        console.log("returning from cache")
        cache[url].counter = cache[url].counter + 1;
        return cache[url]?.response;
      }
    }
    // API call
    console.log("Calling API", url)
    const response = await fetch(url);
    const data = await response.json();

    // Add item to cache
    cache[url] = {
      data,
      timeStamp: now + cacheTime,
      counter: 2,
    };
    return data;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const apiCall = configureAPI(cacheTime, maxNoOfTimes);

// Test case 1: When an API is called 5 times
(async () => {
  try {
    // Call the first 4 APIs from JSONPlaceholder
    await apiCall('https://www.medibuddy.in/WAPI/availableCities.json');
    await apiCall('https://www.medibuddy.in/WAPI/availableCities.json');
    await apiCall('https://www.medibuddy.in/WAPI/availableCities.json');
    await apiCall('https://www.medibuddy.in/WAPI/availableCities.json');

    // This will throw an error since rate limit exceeded
    await apiCall('https://www.medibuddy.in/WAPI/availableCities.json');
  } catch (error) {
    console.error(error);
  }
})();

// Test case 2: When an API is called after cacheTIme
(async () => {
  try {
    // calling API after cacheTime
    await sleep(4000);
    await apiCall('https://www.medibuddy.in/WAPI/availableCities.json');
  } catch (error) {
    console.error(error);
  }
})();
