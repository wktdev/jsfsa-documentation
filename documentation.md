
## Database setup

You can use the Postgres app on the mac to start the database.
https://postgresapp.com/documentation/gui-tools.html

After the database has been started you can use PG Admin to administer the database.
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




## Stripe

To get started with Stripe, go to the website and create an account.
After you log in, in the upper left of the dashboard click "New Account" and give it a name.

Select the new account in the upper left by clicking on the name.

In the bottom left, click "API".

Make sure API keys setting is set to "test".
The "publishable key" and "secret key" are both needed for the app.


Checking expired subscriptions:
https://stackoverflow.com/a/22467344


Getting user stripe ID
https://stackoverflow.com/questions/35474723/stripe-connect-cancel-subscription-with-node-js


## todo
compensate for bad input if user uses a different email for app and stripe submission.