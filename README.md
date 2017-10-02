# San Francisco movies

## Production information

### Description
This service provides the user with a map of San Francisco with markers of movies that have been filmed there. The user is able to filter the view using autocompletion search.

### Software requirement
1. Docker

### Dependencies
1. express
2. mongodb
3. react
4. react-dom

### Getting started instructions
1. Go to the root folder
2. Run `docker-compose build`
3. Run `docker-compose up`

For consequent runs `docker-compose up` will suffice.

### Required configuration
Put the needed json datasets in the datasets folder. They need to be in the same format as the [San Francisco one](https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am)

Each json dataset has to be of extension .json and as filename the city like: San Francisco.json

### Application Architecture
* Back-end: Node JS
* Front-end: React
* Database: MongoDB

### Routes/API End Points

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

### LinkedIn

### Link to hosted application