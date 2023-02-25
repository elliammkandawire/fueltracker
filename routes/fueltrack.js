var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');

// display user page
router.get('/', function(req, res, next) {
    accessRights(req, res)
    dbConn.query('SELECT * FROM stations ORDER BY id desc', function(err, rows) {
        if (err) {
            req.flash('error', err);
            // render to views/stations/index.ejs
            res.render('fueltrack', { data: '' });
        } else {
            // render to views/users/index.ejs
            res.render('fueltrack', { data: rows });
        }
    });
});

function accessRights(req, res) {
    if (!req.session.loggeddIn) {
        req.flash('error', 'Please login to proceed')
        res.redirect('/login')
        return false;
    }
    return true;
}


// display edit station page
router.get('/edit/(:id)', function(req, res, next) {
    accessRights(req, res)
    let id = req.params.id;

    dbConn.query('SELECT * FROM stations WHERE id = ' + id, function(err, rows, fields) {
        if (err) throw err

        // if station not found
        if (rows.length <= 0) {
            req.flash('error', 'Station not found with id = ' + id)
            res.redirect('/fuelstatus')
        }
        // if station found
        else {
            // render to edit.ejs
            res.render('fueltrack/edit', {
                title: 'Fuel Status',
                id: rows[0].id,
                petrol: rows[0].petrol,
                diesel: rows[0].diesel,
                name: rows[0].name,
                latitude: rows[0].latitude,
                longitude: rows[0].longitude,
                nextDelivery: rows[0].nextDelivery
            })
        }
    })
})

// update station data
router.post('/update/:id', function(req, res, next) {
    accessRights(req, res)
    let id = req.params.id;
    let name = req.body.name;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let petrol = req.body.petrol;
    let diesel = req.body.diesel;
    let nextDelivery = req.body.nextDelivery;
    let errors = false;

    if (name.length === 0 || latitude.length === 0 || longitude.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter all fields");
        // render to add.ejs with flash message
        res.render('fueltrack/edit', {
            id: req.params.id,
            petrol: petrol,
            diesel: diesel,
            name: name,
            latitude: latitude,
            longitude: longitude,
            nextDelivery: nextDelivery
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
                name: name,
                latitude: latitude,
                longitude: longitude,
                petrol: petrol,
                diesel: diesel,
                nextDelivery: nextDelivery
            }
            // update query
        dbConn.query('UPDATE stations SET ? WHERE id = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                    // render to edit.ejs
                res.render('fueltrack/edit', {
                    id: req.params.id,
                    name: form_data.name,
                    longitude: form_data.longitude,
                    petrol: form_data.petrol,
                    diesel: form_data.diesel,
                    latitude: form_data.latitude,
                    nextDelivery: form_data.nextDelivery
                })
            } else {
                req.flash('success', 'Stations successfully updated');
                res.redirect('/fuelstatus');
            }
        })
    }
})


module.exports = router;