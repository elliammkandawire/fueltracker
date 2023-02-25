var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');

// display user page
router.get('/', function(req, res, next) {
    dbConn.query('SELECT * FROM stations ORDER BY id desc', function(err, rows) {
        if (err) {
            req.flash('error', err);
            // render to views/stations/index.ejs
            res.render('stations', { data: '' });
        } else {
            // render to views/users/index.ejs
            res.render('stations', { data: rows });
        }
    });
});

// display add station page
router.get('/add', function(req, res, next) {
    // render to add.ejs
    res.render('stations/add', {
        name: '',
        latitude: '',
        longitude: '',
        petrol: '',
        diesel: '',
        nextDelivery: ''
    })
})

// add a new station
router.post('/add', function(req, res, next) {

    let name = req.body.name;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    // let petrol = req.body.petrol;
    // let diesel = req.body.diesel;
    // let nextDelivery = req.body.nextDelivery;
    let errors = false;

    if (name.length === 0 || latitude.length === 0 || longitude.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter all fields");
        // render to add.ejs with flash message
        res.render('stations/add', {
            name: name,
            latitude: latitude,
            // petrol: petrol,
            // diesel: diesel,
            // nextDelivery: nextDelivery,
            longitude: longitude
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
            name: name,
            latitude: latitude,
            // petrol: petrol,
            // diesel: diesel,
            // nextDelivery: nextDelivery,
            longitude: longitude
        }

        // insert query
        dbConn.query('INSERT INTO stations SET ?', form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('stations/add', {
                    name: form_data.name,
                    latitude: form_data.latitude,
                    // petrol: form_data.petrol,
                    // diesel: form_data.diesel,
                    // nextDelivery: form_data.nextDelivery,
                    longitude: form_data.longitude
                })
            } else {
                req.flash('success', 'Station successfully added');
                res.redirect('/stations');
            }
        })
    }
})

// display edit station page
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('SELECT * FROM stations WHERE id = ' + id, function(err, rows, fields) {
        if (err) throw err

        // if station not found
        if (rows.length <= 0) {
            req.flash('error', 'Station not found with id = ' + id)
            res.redirect('/stations')
        }
        // if station found
        else {
            // render to edit.ejs
            res.render('stations/edit', {
                title: 'Edit Station',
                id: rows[0].id,
                name: rows[0].name,
                latitude: rows[0].latitude,
                longitude: rows[0].longitude
                    // petrol: rows[0].petrol,
                    // diesel: rows[0].diesel,
                    // nextDelivery: rows[0].nextDelivery
            })
        }
    })
})

// update station data
router.post('/update/:id', function(req, res, next) {

    let id = req.params.id;
    let name = req.body.name;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    // let petrol = req.body.petrol;
    // let diesel = req.body.diesel;
    // let nextDelivery = req.body.nextDelivery;
    let errors = false;

    if (name.length === 0 || latitude.length === 0 || longitude.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter all fields");
        // render to add.ejs with flash message
        res.render('stations/edit', {
            id: req.params.id,
            name: name,
            latitude: latitude,
            longitude: longitude
                // petrol: petrol,
                // diesel: diesel,
                // nextDelivery: nextDelivery
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
                name: name,
                latitude: latitude,
                longitude: longitude
                    // petrol: petrol,
                    // diesel: diesel,
                    // nextDelivery: nextDelivery
            }
            // update query
        dbConn.query('UPDATE stations SET ? WHERE id = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                    // render to edit.ejs
                res.render('stations/edit', {
                    id: req.params.id,
                    name: form_data.name,
                    longitude: form_data.longitude,
                    // petrol: form_data.petrol,
                    // diesel: form_data.diesel,
                    latitude: form_data.latitude
                        // nextDelivery: form_data.nextDelivery
                })
            } else {
                req.flash('success', 'Stations successfully updated');
                res.redirect('/stations');
            }
        })
    }
})

// delete station
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('DELETE FROM stations WHERE id = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
                // redirect to stations page
            res.redirect('/stations')
        } else {
            // set flash message
            req.flash('success', 'Stations successfully deleted! ID = ' + id)
                // redirect to stations page
            res.redirect('/stations')
        }
    })
})

module.exports = router;