const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname+"/date.js");
var _ = require('lodash');


const app = express();

const workItems = [];

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB');
//mongoose.connect("mongodb+srv://admin-karol:PASSWORD@cluster0.99nkp.mongodb.net/todolistDB")

const itemsSchema = {
    name:{
        type:String,
        required:[true,"cant be empty"]
    }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Take out trash"
})

const item2 = new Item({
    name: "Practice coding"
})

const item3 = new Item({
    name: "Make some pushups"
})

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);



app.get("/",(req,res)=>{

    Item.find({}, function(err,foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("successfully added default items to database");
                }
            });
            res.redirect("/");
        }

        if(err){
            console.log(err);
        } else {
            res.render('list',{listTitle: "Today", ListItems: foundItems, route: "/"})
        }
    })  
})

app.post("/",(req,res)=>{

    console.log(req.body);
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else {

        List.findOne({name: listName},(err,foundList)=>{
            if(err){
                console.log(err);
            } else {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+foundList.name);
            }
        })
    } 
})

app.post("/delete",(req,res)=>{
    
    const Id = req.body.checkBox;
    console.log(Id);
    const listName = req.body.list;

    if(listName === "Today"){
        Item.findByIdAndDelete(Id, function(err){
            if(err){
                console.log(err);
            } else {
                console.log("Successfully deleted an item with ID of " + Id);
                res.redirect("/");
            }
        })
    } else {
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: Id}}},function(err,foundList){
            if(err){
                console.log(err);
            } else {
                res.redirect("/"+listName);
            }
        })   
    }   
})

app.get('/:customListName', (req , res)=>{

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                console.log("saving list with name of:" + customListName);
                list.save();
                res.redirect("/"+customListName);

            } else {
                res.render("list",{listTitle: foundList.name, ListItems: foundList.items});
            }
        }
    }
)});

app.post("/:customListName", (req,res)=>{
    const customListName = req.params.customListName;
    List.findOne({name: customListName},function(err,foundList){
        if(err){
            console.log(err);
        } else {
            const itemName = req.body.newItem;
            const item = new Item({
                name: itemName
            })
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+customListName);

        }
    })
})

app.get("/about",(req,res)=>{
    res.render("about");
})  

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,()=>{
    console.log("Server started on port 3000");
})