const express = require('express')
const fs = require("fs");
const fastcsv = require("fast-csv");
const cors = require('cors');

const sqlite3 = require('sqlite3').verbose()

const app = express()
const port = 3000
app.use(cors())
const db = new sqlite3.Database('test.sqlite3')


db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS campaigns (id INTEGER, name TEXT, start_date TEXT, end_date TEXT, budget REAL, hashtags TEXT, team_id INTEGER, description TEXT, UNIQUE(id))");
    db.run("CREATE TABLE IF NOT EXISTS teams (id INTEGER, name TEXT, code TEXT, color_set TEXT, UNIQUE(id))");
});


// Function to load data into tables from csv
const loadCSV = (csvPath, query) => {
    let stream = fs.createReadStream(csvPath);
    let csvData = [];
    let csvStream = fastcsv
      .parse()
      .on("data", function(data) {
        csvData.push(data);
      })
      .on("end", function() {
        csvData.shift();
    
        db.serialize(() => {
            const stmt = db.prepare(query);
    
            csvData.forEach(row => {
                stmt.run(row);
            });
            stmt.finalize();
        });
    
      });
    
    stream.pipe(csvStream);
}

loadCSV("campaigns.csv", "INSERT OR IGNORE INTO campaigns VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
loadCSV("teams.csv", "INSERT OR IGNORE INTO teams VALUES (?, ?, ?, ?)")

/*
GET route to return searches from database using query parameters in URL
QUERY STRINGS:
    team - Code of team to search within exact match
    name - Name of campaign to search on partial match
    description - Partial description search
    hashtags - Hashtag search
    before_date - Search for campaigns with a start date before given date
    after_date - Search for campaigns with a start date after given date
    gtebudget - Search for campaigns with a budget greater than or equal to given value
    ltebudget - Search for campaigns with a budget less than or equal to given value
*/
app.get('/search', (req, res) => {

    db.serialize(() => {

        let stmt = `SELECT campaigns.name as campaign_name, start_date, end_date, budget, hashtags, code as team_code, description FROM campaigns INNER JOIN teams ON team_id=teams.id WHERE 1=1`;
        
        for (const [key, value] of Object.entries(req.query)) {
            if(key == "team"){
                stmt += ` AND team_code = '${value}'`
            }
            if (key === "name" || key === "hashtags" || key === "description"){
                stmt += ` AND ${key} LIKE '%${value}%'`
            }
            else if (key == "before_date"){
                stmt += ` AND strftime('%s', start_date) < strftime('%s', '${value}') `
            }
            else if (key == "after_date"){
                stmt += ` AND strftime('%s', start_date) > strftime('%s', '${value}') `
            }
            else if (key == "gtebudget"){
                stmt += ` AND budget >= '${value}'`
            }
            else if (key == "ltebudget"){
                stmt += ` AND budget <= '${value}'`
            }
        }

        db.all(stmt, (err, rows) => {
            if (err){
                res.status(404)
                res.send({"error": "Query error"})
                return res.end()
            }
            res.send({count:rows.length, data:rows})
        });
    })
})

app.listen(port, () => {
})