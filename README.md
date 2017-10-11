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
	      | 500    | {"error": "Something went wrong: `error`"} |
2. Get all columns of the movies in a location
	* Request
		* GET /columns/:location
	* Response
		| Status | Response                                   |
		|--------|--------------------------------------------|
		| 200    | ["column1", "column2"...]                  |
	    | 500    | {"error": "Something went wrong: `error`"} |

3. Get all movies of a location that fit the description in columns and values
	* Request
		* POST /movies/:location
		* 
			| Key     | Value                     |
			|---------|---------------------------|
			| columns | ["column1", "column2"...] |
			| values  | ["value1", "value2"...]   |

		* Note length of both should be the same.
	* Response
		| Status | Response                                   |
		|--------|--------------------------------------------|
		| 200    | [{Geocode: {"lat": `int`, "lng": `int`}, `other properties of movies`}, ...]  |
	    | 500    | {"error": "Something went wrong: `error`"} |

## For the reviewer

### Problem
Create a service that shows on a map where movies have been filmed in San Francisco. The user should be able to filter the view using autocompletion search.

### Solution
I have used React to create a front-end with a google map of San Francisco which has markers for different movie locations. These locations will be retrieved from the back-end which is written in Node JS (as asked from me in the mail). The database used is MongoDB.

### Focus
The solution focuses on back-end. I do not have any experience with React, Node JS, MongoDB and Docker, but I do have around 5 months of back-end experience from my part time job and around 3 years of experience from my bachelor.

### Application architecture

#### MongoDB
I have chosen MongoDB instead of MySQL as MySQL doesn't scale that great horizontally. As I have data per city, it is logical to create a collection per city in MongoDB.

#### React
As I do not have much experience in front-end I have choosen for React as the team is a fan of it and having a front-end in javascript together with a back-end in javascript seemed a natural choice.

#### Node JS
Not much choice here.

#### Docker
It makes it easy to deploy everywhere.

### Choices
It is possible to add more json datasets instead of only San Francsco, but there are requirements of the dataset:
* The filename should be the city name;
* It needs to define its columns in 'meta' -> 'view' -> 'columns'].
* It needs to have one column called 'Locations' or 'Location' defining the location where the movie has been shot.

### LinkedIn

### Link to hosted application