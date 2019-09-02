//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);

const itemsSchema = {
    name: String,
};
const Item = mongoose.model("Item", itemsSchema);



app.get("/", function(req, res) {



    Item.find({}, function(err, foundItems) {

        if (foundItems.length === 0) {
            const item1 = new Item({
                name: "Do something first"
            });
            const item2 = new Item({
                name: "Than do something else..."
            });
            const item3 = new Item({
                name: "...PROFIT!!!"
            });

            const defaultItems = [item1, item2, item3];

            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Default items added succesfully!");
                }
            })
            res.redirect("/");
        } else {

            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
            // console.log(foundItems);
        }
    });




});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;

    const item = new Item({
        name : itemName
    })

    item.save();

    res.redirect("/");

});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;

    Item.findByIdAndRemove(checkedItemId, function(err){
        if (err) {
            console.log(err);
        }   else {
            console.log("Succesfully remove checked item ");
            res.redirect("/");
        }
    })
})

app.get("/work", function(req, res) {
    res.render("list", {
        listTitle: "Work List",
        newListItems: workItems
    });
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});
