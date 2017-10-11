# San Francisco movies

# Production information

## Description
This service provides the user with a map of San Francisco with markers of movies that have been filmed there. The user is able to filter the view using autocompletion search.

## Software requirement
1. docker-compose

## Required configuration
Put the needed json datasets in the backend/datasets folder. They need to be in the same format as the [San Francisco one](https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am)

Each json dataset has to be of extension .json and as filename the city like: San Francisco.json

The standard dataset of San Francisco is already there.

## Getting started instructions
1. Go to the root folder
2. Run `sudo docker-compose build`
3. Run `sudo docker-compose up`

For consequent runs `sudo docker-compose up` will suffice.

## Application Architecture
* Back-end: Node JS
* Front-end: React
* Database: MongoDB

## Routes/API End Points
1. Get all locations in the database
	* Request
		* GET /locations
	* Response 
		* | Status | Response                                   |
		  |--------|--------------------------------------------|
		  | 200    | ["location1", "location2"...]              |
	      | 500    | {"error": "Something went wrong: \<error\>"} |
2. Get all columns of the movies in a location
	* Request
		* GET /columns/:location
	* Response
		* | Status | Response                                   |
		  |--------|--------------------------------------------|
		  | 200    | ["column1", "column2"...]                  |
	      | 500    | {"error": "Something went wrong: \<error\>"} |

3. Get all movies of a location that fit the description in columns and values
	* Request
		* POST /movies/:location
		* | Key     | Value                     |
		  |---------|---------------------------|
		  | columns | ["column1", "column2"...] |
		  | values  | ["value1", "value2"...]   |

		* Note: length of both should be the same.
	* Response
		* | Status | Response                                   |
		  |--------|--------------------------------------------|
		  | 200    | [{Geocode: {"lat": \<int\>, "lng": \<int\>}, \<other properties of movies\>}, ...]  |
	      | 500    | {"error": "Something went wrong: \<error\>"} |

4. Get suggestions for a column for a location
	* Request
		* POST /suggestions/:location
		* | Key     | Value                                                 |
		  |---------|-------------------------------------------------------|
		  | columns | ["column1", "column2"...]                             |
		  | values  | ["value1", "value2"...]                               |
		  | index   | \<int, the index of the column in the columns array\> |
		* Note: length of columns and values should be the same.
	* Response
		* | Status | Response                                   |
		  |--------|--------------------------------------------|
		  | 200    | {suggestions: ["suggestion1", "suggestion2"...]}  |
	      | 500    | {"error": "Something went wrong: \<error\>"} |

## Known issues
1. Some movie markers are not correct.
	This is caused by the geocoding API of Here. Sometimes it gives the wrong latitude and longitude back for an address.
2. The suggestions inside the filter sometimes doesn't update although I type another character.
	This is caused by your browser as \<datalist\> is not that well supported on certain browsers. Try Chrome or Chromium.

## Notes
* On first run, it will take some time before the server has imported all data into the database, as every movie location will be geocoded. This means that the user can not ask anything of the database.
* The unit tests for the API can be run by doing the following: start the server, `sudo docker exec -it app bash` to get into the app container and run `npm test`.

# For the reviewer

## Problem
Create a service that shows on a map where movies have been filmed in San Francisco. The user should be able to filter the view using autocompletion search.

## Solution
I have used React to create a front-end with a google map of whatever location the back-end gives me. There is an options sidebar where the user can type and where the user gets suggestions. These suggestions are retrieved from the back-end in realtime. After the user clicks on the filter button, markers will appear on the map with information of the movie in an infowindow. The back-end is written in Node JS (as asked from me in the mail). The database used is MongoDB.

## Focus
The solution focuses on back-end. I do not have any experience with React, Node JS, MongoDB and Docker, but I do have around 5 months of back-end experience from my part time job and around 3 years of experience from my bachelor.

## Application architecture

### MongoDB
I have chosen MongoDB instead of MySQL as MySQL doesn't scale that great horizontally. As I have data per city, it is logical to create a collection per city in MongoDB. This way it is possible to insert many more locations in the database without degrading the performance of the app.

### React
As I do not have much experience in front-end I have choosen for React as the team is a fan of it and having a front-end in javascript together with a back-end in javascript seemed a natural choice to me. I have used create-my-app to create boilerplate code and worked from there. Everything in frontend/src and frontend/Dockerfile is made by me.

### Node JS
Not much choice here.

### Docker
It makes it easy to deploy everywhere. The only things I knew of Docker was how to docker-compose up. This challenge provided me an opportunity to learn more about Docker in which I succeeded.

## Choices
* A big choice was where to implement the functionality of filtering the view using autocompletion search. At first I had all movies taken from the back-end to the front-end. The logical choice would be to filter it client-side, but that would be bad performance-wise as the San Francisco dataset has more than 1000 rows. Thus I have reworked the logic and now the flow is as follow: the user clicks on the options button, and everytime the user searches something, the values of all columns would be sent to the back-end, where the server queries the database based on the values and gives back a unique list of suggestions for the column the user is searching in. This is better than sending all movies back data-wise. Finally, when the user clicks the filter button, the server will send all movies that fit the filter query and the map will be populated with markers.
* Another choice was to import the movie dataset into the database from a folder instead of a dedicated endpoint for the user. This would be better for the security as no users will ever be able to post something in the database. All current endpoints are made with only one thing in mind: to retrieve information from the database. By doing it this way, only the person who puts the datasets in the folder on the server can mean harm. The datasets will be counted twice for storage space, but this can easily be fixed by deleting the datasets if it has been imported into the database.
* I have made the app as dynamic as possible in terms of datasets. This way the app can easily be extended by adding more locations with movies. There are some constraint however:
	* The filename should be the city name;
	* It needs to define its columns in 'meta' -> 'view' -> 'columns'].
	* It needs to have one column called 'Locations' or 'Location' defining the location where the movie has been shot.
* I have not made any integration tests as the challenge said to only provide unit tests for the API as I only do the back-end track.
* I also made quite some effort with React(7 days of work, I am not a front-ender!), because it is so much more satisfying to see what you have made in the back-end by creating a front-end.
* I have put React and Node JS in different Docker containers as that is the spirit of Docker: every container should do one thing.
* The Google Maps Geocode did not work for me, so I have used the Here API. Conversely the Here API for the map did not show a map for me in React, so I have used Google Maps there.
* I have put all the css inside the js files as it is a small application.

## Todos, what should I have done if I had more time
* Put the docker containers on a server. I had no time anymore, but it shouldn't be too hard I think.
* Fix the hardcoded app id and app code in React. Although I give the .env file inside the docker-compose.yml file, React can't seem to reach it with process.env. A solution could be to eject the create-my-app and edit the webpack configuration.
* Look more into middleware for the React routes.
* Find out what I should do with all the console.logs if the app should really have been in production.

## LinkedIn
[My LinkedIn](https://www.linkedin.com/in/max-wong-23789a114/?locale=en_US)

## Final thoughts and observations
* I never program in Javascript and I am really amazed by the performance. Coming from Python, it is refreshing to see how fast code can go.
* After I converted my functions with callbacks into Promises as the code became really ugly with all the indentations, I still couldn't help but think that Promises are also ugly. Thus I have converted them to async/await functions which is way better!
* I have spend a lot of time learning React, but I really liked it!
* I have not repeated any information of the 'Production information' section in the 'For the reviewer' section.
* There are not many comments in the react js files as most of them are self explainatory.
* Although I should have focussed more on the back-end, I couldn't think of more functionality in the back-end, so I hope the front-end also gives you a better view of my way of working and thinking.