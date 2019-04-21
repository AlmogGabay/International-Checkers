let express = require("express"),
    app     = express();

app.use(express.static(__dirname + '/public'));
    
app.get("*", function(req, res) {
    res.sendfile("checkers.html");
});

app.listen(process.env.PORT || 3000, process.env.IP);