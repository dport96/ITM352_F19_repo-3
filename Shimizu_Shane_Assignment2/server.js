/*
Author: Shane Shimizu
File Description: server processing
*/
//Source from Lab 13 and Professor Daniel Port's office hours
var express = require('express'); //gets express package
var app = express(); //starts express
var myParser = require("body-parser"); //requires body parser to form data 
var products = require("./public/products.js"); //assigns the product data from the json array into the variable products
const querystring = require('querystring'); //requires the querystring of the form.  gives utilities to parse and formate the querystring
//
app.use(myParser.urlencoded({ extended: true }));
fs = require('fs');
var filename = 'user_data.json';

//
//check to see if the file exists. if it does, read it and parse it. if not output a message
if (fs.statSync(filename)) {

    //returns contents of the path
    data = fs.readFileSync(filename, 'utf-8');

    stats = fs.statSync(filename);
    console.log(filename + ' has ' + stats.size + ' characters'); //console logs the filename with the amount of characters it has


    users_reg_data = JSON.parse(data);//parses the data into JSON format
    /*
    username = 'newuser';
    users_reg_data[username] = {}; //new user becomes new property of users_reg_data object
    users_reg_data[username].password = 'newpass';
    users_reg_data[username].email = 'newuser@user.com';

    fs.writeFileSync(filename, JSON.stringify(users_reg_data));
    */

    console.log(users_reg_data); //console logs

} else {
    console.log(filename + ' does not exist');
}
//source from Lab 13
//logs the method and path into the console
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

//source from Lab 13
app.use(myParser.urlencoded({ extended: true }));

//source from Lab 13
//posts the process form data with the action as process_form

app.post("/process_form", function (request, response) {
    let POST = request.body;
    var hasValidQuantities = true; //assume that the quantities textbox is true
    var hasPurchases = false; //assume the quantity of purchases are false
    for (i = 0; i < products.length; i++) { //for loop for each product in the array that increases the count by 1
        q = POST['quantity' + i]; //quantity entered by the user for a product(s) is assigned into q
        if (isNonNegInt(q) == false) { //if the quantity enteredby the user is not a valid integer
            hasValidQuantities = false; //HasValidQuantities is false or nothing was purchased
        }
        if (q > 0) { //if the quantity entered is more than 0
            hasPurchases = true; //hasPurchases is true and the user has entered a valid integer(s) to purchase something
        }
    }
    //source from Professor Ports office hours
    //if data is valid give user an invoice, if not give them an error
    qString = querystring.stringify(POST); //string query together
    if (hasValidQuantities == true && hasPurchases == true) {//if hasValidQuantities and hasPurchases is true
        response.redirect('/login' + qString);
    }
    else {

        response.redirect("./store.html?" + qString); //if quantity is not valid, user is sent back to product page along with the query data entered previously from the user
    }

});

//copied from order_page Lab 13
//function that returns errors
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors at first
    if (q == '') { q = 0 }; //if quantity or 0
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
    return returnErrors ? errors : (errors.length == 0); //return errors if there are errors 
}

//gets called with data from the form
app.post("/logon", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    console.log(request.body);
    qString = querystring.stringify(request.query); //string query together
    the_username = request.body.username; //give me username from object and assigning it
    if (typeof users_reg_data[the_username] != 'undefined') { //ask object if it has property called username, if it does, it wont be udefined. check to see if it exists
        if (users_reg_data[the_username].password == request.body.password) {//check if the password they entered matches what was stored
            //passes the username + the string logged in on the page to greet them
            response.redirect("./invoice.html?" + qString);//if the quantity is valid, user is directed to invoice along with the query data from the form
        } else if (users_reg_data[the_username].password != request.body.password) {
            //response.send('password incorrect');//if they did not login successfully, does another get request and redirects user to login to page
            response.redirect("./login.html?" + qString); // bad password so send back login
        }
    } else {
        response.redirect('/register?' + qString);//if they did not login successfully, does another get request and redirects user to login to page
        //can regnerate form here and display errors
    }
});

app.get("/register", function (request, response) { //if server gets request to register
    // Give a simple register form
    //when submit, posts to register, then calls app.post
    str = `
        <body>
        <form action="" method="POST">
        <input type="text" name="username" size="40" placeholder="enter username" ><br />
        <input type="password" name="password" size="40" placeholder="enter password"><br />
        <input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
        <input type="email" name="email" size="40" placeholder="enter email"><br />
        <input type="submit" value="Submit" id="submit">
        </form>
        </body>
    `;
    response.send(str);
});

app.post("/register", function (request, response) {
    // process a simple register form

    //validate registration data

    //all good, so save new user to the file name(registration data)
    username = 'newuser';
    username = request.body.username;

    if (typeof users_reg_data[username] != 'undefined') {//check if the password they entered matches what was stored
        response.redirect('./login.html?' + qString);//if they did not login successfully, does another get request and redirects user to login to page
        //can regnerate form here and display errors
    } else if (request.body.repeat_password != request.body.password) {
        response.send(`password does not match`);
    } else {
        users_reg_data[username] = {}; //new user becomes new property of users_reg_data object
        users_reg_data[username].password = request.body.password;
        users_reg_data[username].email = request.body.email;
        fs.writeFileSync(filename, JSON.stringify(users_reg_data));
        //alert(`${username} registered!`)
        response.redirect("./invoice.html?" + qString);
        //response.redirect ("./invoice.html?" + qString );//if the quantity is valid, user is directed to invoice along with the query data from the form

        console.log(request.body);
    }

});

app.use(express.static('./public')); //retrieves get request and look for file in public directory
app.listen(8080, () => console.log(`listening on port 8080`)); //the server listens on port 8080 and prints the message into the console
