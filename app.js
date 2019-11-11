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

mongoose.connect("mongodb+srv://admin-karl:test123@cluster0-adiom.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const itemsSchema = mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);



const item1 = new Item({
  name: "Welcome to your todolist.!",

});

const item2 = new Item({
  name: "Hit the + button to add a new item.!",

});

const item3 = new Item({
  name: "<-- Hit this to delete an item.!",

});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = new mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find(function(err, items) {

    if (items.length === 0) {


      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfuly Added.!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });

    }

  });

});
app.get("/:postId", function(req, res) {
  const pId = _.capitalize(req.params.postId);
  List.findOne({
    name: pId
  }, function(err, foundItem) {
    if (!err) {
      if (!foundItem) {
        // console.log("Doesnt Exist");
        var list = new List({
          name: pId,
          items: defaultItems

        });
        list.save();
        res.redirect("/" + pId);
      } else {
        // console.log("Exist");
        res.render("list", {
          listTitle: foundItem.name,
          newListItems: foundItem.items
        });
      }
    } else {
      console.log(err);
    }
  });

  //   var list = new List({
  //     name:pId,
  //     items:defaultItems
  //   });
  // list.save();
});
app.post("/", function(req, res) {

  const item = req.body.newItem;
  const listName = req.body.list;


  const newitem = new Item({
    name: item
  });
  if (listName === "Today") {
    newitem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundItem) {
      foundItem.items.push(newitem);
      foundItem.save();
      res.redirect("/" + listName);
    });
  }



});
app.post("/delete", function(req, res) {


  const itemFromcheckbox = req.body.checkbox;
  const listNames = req.body.listNames;
  // console.log(listNames);
  // console.log(itemFromcheckbox);

  if (listNames === "Today") {
    Item.findByIdAndRemove(itemFromcheckbox, function(err) {
      if (!err) {
        console.log("Successfully deleted checked item.!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listNames
    }, {
      $pull: {
        items: {
          _id: itemFromcheckbox
        }
      }
    }, function(err) {
      if (!err) {
        res.redirect("/" + listNames);
      }
    });

  }

});


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
