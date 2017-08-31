
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

The npm modules ***sequelize*** and ***pg*** must be install **globally** via NPM. The database used is Postgres SQL.


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

### Setting up a test environment in Stripe

To get started with Stripe, go to the website and create an account.
After you log in, in the upper left of the dashboard click "New Account" and give it a name. Click on the name to select it.

In the bottom left, click "API".

Make sure API keys setting is set to "test".

<img src="documentation_resources/api_test.png" alt="test">


The "publishable key" and "secret key" are both needed for the app.

```
// Node

var stripe = require("stripe")("sk_test_IDu1Fb30xMpKpKLlUBldnM5G");

```

In the main side bar, set the "test" option to "test".

<img src="documentation_resources/test.png" alt="test">



Checking expired subscriptions:
https://stackoverflow.com/a/22467344



## Query Stripe users
To query a user in the stripe database you use the "create" method. 
This method does not modify the data in Stripe, it simply queries it.


```

stripe.customers.create({
  description: 'Customer for whatever@gmail.com'
}, function(err, customer) {
  console.log(customer);
  console.log(customer.id);
   // get object ID and store it app database in user collection
   // also store the stripe email in a seperate user field in app database
});


```

When a user submits payment, the object that comes back will have their email. Immediately query it and get their ID! Store the id in a field in your apps
database. Moving forward, use the ID to reference data in their Stripe account.