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

  const item1 = await new Item({name: 'Steal Andrea\s chocolate.'});
  const item2 = await new Item({name: 'Eat Andrea\s chocolate.'});

  const defaultItems = [item1, item2];

  app.get('/home', (req, res) => {
    res.redirect('/');
  })

  app.route('/')
    .get(async(req, res) => {
      // Item.find({}, (err, items) => {
        //   if (items.length === 0) {
          //     Item.insertMany(defaultItems, (err) => {})
          //     res.redirect('/');
          //   } else {
            //     res.render('list', {title: 'Home', day: date, listItems: items})
            //   }
            // })
      const foundItems = await Item.find();
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, (err) => {})
        res.redirect('/');
      } else {
        res.render('list', {title: 'Home', day: date, listItems: foundItems})
      }
    })
    .post(async(req, res) => {
      const listTitle = _.capitalize(req.body.list);
      const item = new Item({name: req.body.newItem});
      if (req.body.newItem && listTitle === 'Home' || listTitle === '/') {
        await item.save();
        res.redirect('/');
      } else if (req.body.newItem) {
        await List.updateOne(
          { name: listTitle },
          { $addToSet: {listItems: [item]}}
        );
        res.redirect(`/${listTitle}`);
      }
    })

  app.get('/:category', async(req, res) => {
    const urlInput = _.capitalize(req.params.category);
    // List.findOne({name: urlInput}, (err, results) => {
    //   if (results) {
    //     res.render('list', {title: results.name, day: date, listItems: results.listItems})
    //   } else {
    //     const newList = new List({name: urlInput, listItems: defaultItems})
    //     newList.save();
    //     res.render('list', {title: newList.name, day: date, listItems: newList.listItems})
    //   }
    // })
    const foundItem = await List.findOne({name: urlInput});
    if (foundItem) {
      res.render('list', {title: foundItem.name, day: date, listItems: foundItem.listItems});
    } else {
      const newList = new List({name: urlInput, listItems: defaultItems})
      await newList.save();
      res.render('list', {title: newList.name, day: date, listItems: newList.listItems})
    }
  })

  app.post('/update', async (req, res) => {
    const listTitle = _.capitalize(req.body.list);
    const isChecked = req.body.checked || req.body.unchecked;
    const checkedValue = 'checked' in req.body;

    // if (listTitle === 'Home' || listTitle === '/') {
    //   Item.findByIdAndUpdate(isChecked, {$set:{ checked: checkedValue }}, (err) => {});
    //   res.redirect('/');
    // } else {
    //   List.findOneAndUpdate(
    //     { name: listTitle, 'listItems._id': isChecked },
    //     { $set: { 'listItems.$.checked': checkedValue }},
    //     (err) => {});
    //   res.redirect(`/${listTitle}`);
    // }
    if (listTitle === 'Home' || listTitle === '/') {
      await Item.findByIdAndUpdate(isChecked, {$set:{ checked: checkedValue }});
      res.redirect('/');
    } else {
      await List.findOneAndUpdate(
        { name: listTitle, 'listItems._id': isChecked },
        { $set: { 'listItems.$.checked': checkedValue }}
      );
      res.redirect(`/${listTitle}`);
    }
  })

  app.post('/delete', async (req, res) => {
    const listTitle = _.capitalize(req.body.list);
    // if (req.body.deleted && listTitle === 'Home') {
    //   Item.findByIdAndRemove(req.body.deleted, (err) => {});
    //   res.redirect('/');
    // } else {
    //   List.findOneAndUpdate(
    //     {name: listTitle},
    //     {$pull: {listItems: {'_id': req.body.deleted}}},
    //     (err, results) => {})
    //   res.redirect(`${listTitle}`);
    // }
    if (req.body.deleted && listTitle === 'Home' || listTitle === '/') {
      await Item.findByIdAndRemove(req.body.deleted);
      res.redirect('/');
    } else {
      await List.findOneAndUpdate(
        {name: listTitle},
        {$pull: {listItems: {'_id': req.body.deleted}}}
      );
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
