//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin-whisping:pejwiq-bafveJ-0kogde@cluster0-qs7de.mongodb.net/todolistDB", {
    useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);

const itemsSchema = {
    name: String,
};
const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

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


app.get("/", function(req, res) {
    Item.find({}, function(err, foundItems) {

        if (foundItems.length === 0) {

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
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    }   else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Succesfully remove checked item ");
                res.redirect("/");
            }
        })
    }   else {
        List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
})



app.get("/:route", function(req, res) {
    const customPage = _.capitalize(req.params.route);

    List.findOne({
        name: customPage
    }, function(err, foundedList) {
        if (err) {
            console.log(err);

        } else {

            if (!foundedList) {
                //create new list
                const list = new List({
                    name: customPage,
                    items: defaultItems
                });
                console.log("New page added " + customPage);
                list.save();
                res.redirect("/" + customPage);
            } else {
                //show existing list
                console.log(foundedList.name + " page is already renders");
                res.render("list", {
                    listTitle: foundedList.name,
                    newListItems: foundedList.items
                });
            }
        }
    })



});

// app.get("/work", function(req, res) {
//     res.render("list", {
//         listTitle: "Work List",
//         newListItems: workItems
//     });
// });

app.get("/about", function(req, res) {
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
    console.log("Server started successfully");
});
