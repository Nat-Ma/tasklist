const express = require('express');
const mongoose = require('mongoose');
const { date, day } = require('./date');
const _ = require('lodash');
const { truncate } = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb+srv://NatNatNatNat:Test-123@cluster0.ijtmapt.mongodb.net/todolistDB");

  const itemSchema = new mongoose.Schema({
    name: {
      type: String,
      required: false
    },
    checked: {
      type: Boolean,
      default: false
    }
  })

  const listSchema = new mongoose.Schema({
    name: String,
    listItems: [itemSchema]
  })

  const Item = mongoose.model('Item', itemSchema);
  const List = mongoose.model('List', listSchema);

  const item1 = new Item({name: 'Steal Andrea\s chocolate.'});
  const item2 = new Item({name: 'Eat Andrea\s chocolate.'});

  const defaultItems = [item1, item2];

  app.get('/', (req, res) => {
    Item.find({}, (err, items) => {
      if (items.length === 0) {
        Item.insertMany(defaultItems, (err) => {})
        res.redirect('/');
      } else {
        res.render('list', {title: 'Home', day: date, listItems: items})
      }
    })
  })

  app.get('/:category', (req, res) => {
    const urlInput = _.capitalize(req.params.category);
    List.findOne({name: urlInput}, (err, results) => {
      if (results) {
        res.render('list', {title: results.name, day: date, listItems: results.listItems})
      } else {
        const newList = new List({name: urlInput, listItems: defaultItems})
        newList.save();
        res.render('list', {title: newList.name, day: date, listItems: newList.listItems})
      }
    })
  })

  app.post('/', (req, res) => {
    const listTitle = _.capitalize(req.body.list);
    const item = new Item({name: req.body.newItem});
    if (req.body.newItem && listTitle === 'Home') {
      item.save();
      res.redirect('/');
    } else if (req.body.newItem) {
      List.updateOne(
        { name: listTitle },
        { $addToSet: { listItems: [item] }},
        (err, result) => {
      })
      res.redirect(`/${listTitle}`);
    }
  })

  app.post('/update', (req, res) => {
    const listTitle = _.capitalize(req.body.list);
    const isChecked = req.body.checked || req.body.unchecked;
    const checkedValue = 'checked' in req.body;

    if (listTitle === 'Home') {
      Item.findByIdAndUpdate(isChecked, {$set:{ checked: checkedValue }}, (err) => {});
      res.redirect('/');
    } else {
      List.findOneAndUpdate(
        { name: listTitle, 'listItems._id': isChecked },
        { $set: { 'listItems.$.checked': checkedValue }},
        (err) => {});
      res.redirect(`/${listTitle}`);
    }
  })

  app.post('/delete', (req, res) => {
    const listTitle = _.capitalize(req.body.list);
    if (req.body.deleted && listTitle === 'Home') {
      Item.findByIdAndRemove(req.body.deleted, (err) => {});
      res.redirect('/');
    } else {
      List.findOneAndUpdate(
        {name: listTitle},
        {$pull: {listItems: {'_id': req.body.deleted}}},
        (err, results) => {})
      res.redirect(`${listTitle}`);
    }
  })
}

app.get('/about', (req, res) => {
  res.render('about');
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
});
