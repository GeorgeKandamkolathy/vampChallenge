# Vamp Challenge - George Kandamkolathy

## Technologies 
- NodeJS
    - ExpressJS
- SQLite3

## Setup
1. Run `npm install` in the root directory to install necessary packages
2. Run `node index.js` in the root directory to run the server


## Functionality
Search function for campaign database with filtering on the columns of the data.
Query using url format:
    `127.0.0.1:3000/search?{queryParameters}`
        
        QUERY PARAMETERS:
        
            team - Code of team to search within exact match
            
            name - Name of campaign to search on partial match
        
            description - Partial description search
        
            hashtags - Hashtag search
        
            before_date - Search for campaigns with a start date before given date
        
            after_date - Search for campaigns with a start date after given date
        
            gtebudget - Search for campaigns with a budget greater than or equal to given value
        
            ltebudget - Search for campaigns with a budget less than or equal to given value