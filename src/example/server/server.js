var application_root = __dirname,
    express = require("express"),
    path = require("path"),
    bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

var loggedIn = false;
var userName = "admin";
var passWord = "admin";
var adminUser = {
    userName: userName,
    name: "Admin User"
};
var currentUser = {};

/**
 * get all the names registered
 */
app.get('/api/userInfo', function(req, res) {
    var headerValue = req.get('X-Auth-Token');
    if (headerValue === "fakeToken") {
        currentUser = adminUser;
        res.set({
            'X-Auth-Token': 'fakeToken'
        });
    }
    console.log("get userInfo, returning: ", currentUser);
    res.send(JSON.stringify(currentUser));
});

/**
 * login
 */
app.post('/api/login', function(req, res) {
    var body = req.body;
    console.log('SERVER logging in : ' + JSON.stringify(body));

    if (userName === body.username && passWord === body.password) {
        console.log('SERVER - login success');
        loggedIn = true;
        currentUser = adminUser;
        res.set({
            'X-Auth-Token': 'fakeToken'
        });
        currentUser.token = 'fakeToken';
        res.send(JSON.stringify(currentUser));
    } else {
        console.log('SERVER - login error');
        res.status(304).send("error!");
    }
});

app.get('/api/protectedCall', function(req, res) {
    console.log('SERVER - protected call, called');
    var headerValue = req.get('X-Auth-Token');
    if (headerValue !== "fakeToken") {
        console.log('SERVER - protected call error!', headerValue);
        res.status(403).send({
            'error': 'no token found!'
        });
    } else {
        console.log('SERVER - protected call success!', headerValue);
        res.set({
            'X-Auth-Token': 'fakeToken'
        });
        res.send({
            'value1': 'good'
        });
    }
});

/**
 * logout
 */
app.post('/api/logout', function(req, res) {
    console.log('SERVER logging out ');
    loggedIn = false;
    currentUser = {};
    res.send(JSON.stringify("{messsage: successfully logged out}"));

});

/**
 * startup express listening to the standard port
 * @type {http.Server}
 */
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
