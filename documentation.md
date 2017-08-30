
## Database setup


You can use PG Admin to administer the database.
Download and install is here:  https://www.pgadmin.org/


### PG Admin Setup

1. Right click "Servers" and click "create server".
2. Give it a name
2. Under the connection tab set Host/name/address to: localhost
3. Set the user name and password. 
4. This information will be referenced when setting up the node code - click save
5. Right click the server you created and click "create database"
6. Give it a name and save






### NPM module to communicate with database

The npm modules ***sequelize*** and ***pg*** must be install **globally** via NPM.
The database used is Postgres SQL.


The following code should create a schema when launched.


```

const Sequelize = require("sequelize");
const connection = new Sequelize("jsfsa", "postgres", "password", {
    host: 'localhost',
    port: '5432',
    dialect: 'postgres'
});


const User = connection.define("user", {
    title: Sequelize.STRING
        

});

connection.sync({
    logging: console.log()
});

```




