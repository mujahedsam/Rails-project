var express = require('express');
var api = express.Router();
var bcrypt = require('bcrypt');
var randtoken = require('rand-token');
var nodemailer = require('nodemailer');
var promise = require('promise');
var smtptransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testlyncmail@gmail.com',
        pass: 'sameer12345'
    }
});
//var a = require('')

api.post('/registration', (req, res) => {
    console.log("Register's post method");
    var username = req.body.username;
    var email = req.body.email;
    var type = req.body.type;
    var mobileno = req.body.mobileno;
    // var address=req.body.address;
    var usercont = req.body.contacttype;

    var data = {
        email: req.body.email,
        mobileno: req.body.mobileno,
        address: req.body.address
    }
    return new promise((resolve, reject) => {
        connection.query('select * from user', (err, result) => {
            if (err) console.log("error in regpostmthd");
            console.log(result.length);
            length = result.length + 1
            let uid = 'u' + length;
            resolve(uid);
        })

    }).then((uid) => {
        var userreg = {
            typeid: type,
            username: username,
            uid: uid
        }
        return new promise((resolve, reject) => {

            connection.query('insert into user set ?', userreg, (error, result2) => {
                if (error) {
                    throw error;
                    res.render('registration', {
                        msg: msg2
                    });
                    var msg2 = "error in registration"
                } else {
                    console.log("inserted in user table");
                    resolve(result2)
                }
            })
        }).then((result2) => {
            return new promise((resolve, reject) => {
                connection.query('select * from contacttype', (err, result3) => {
                    var ret = JSON.parse(JSON.stringify(result3));
                    console.log(ret);
                    var count = 0;
                    for (var key in data) {
                        console.log(key + "is value");
                        for (var i = 0; i < ret.length; i++) {
                            if (key == ret[i].contacttypeinfo) {
                                var contactone = {
                                    ctypeid: ret[i].ctypeid,
                                    uid: uid,
                                    contactinfo: data[key]
                                }
                                connection.query('insert into usercontact set ?', contactone, (err, result4) => {
                                    if (result4) {
                                        console.log("insrtd in usercontact tbl");
                                    }
                                    count++;
                                    if (count == Object.keys(contactone).length) {
                                        resolve(data);
                                    };
                                })
                            }
                        }
                    }


                })
            }).then((data) => {
                console.log("inthe emailsender mthd");
                var token = randtoken.generate(10);
                var logindata = {
                    isactive: false,
                    uid: uid,
                    actoken: token,
                }
                connection.query('insert into login set ?', logindata, (err, done) => {
                    if (err) console.log(err + "not insrtd in logintable");
                    else {
                        console.log("data inserted in login table");
                    }
                })

                return new promise((resolve, reject) => {
                    if (usercont == "ct1") {
                        var textdata = "click on the below link for further registration http://localhost:8900/activation?token=" + token;
                        var subdata = "rails job registration verification";
                        var mailoptions = {
                            to: email,
                            subject: subdata,
                            text: textdata,
                        }

                        smtptransport.sendMail(mailoptions, (err, response) => {
                            if (err) {
                                console.log(err + "err in sending mail");
                            } else {
                                console.log("reg mail sent");
                            }
                        })
                        res.render('login');

                    } else {
                        res.render('verifyotp');

                    }

                    resolve(uid);
                }).then((uid) => {
                    console.log("user registered");
                    // res.render('login');
                })
            })
        })
    })
})


api.post('/activator', (req, res) => {
    var password = req.body.password;
    var actoken = req.body.token;
    console.log(actoken + "frm post mthd");
    password = bcrypt.hashSync(password, 8);
    connection.query('select * from login where actoken = ?', actoken, (err, results) => {
        if (err) {
            console.log(err + "error at reg2 page");
        } else {
            console.log(results[0].uid);
            var newuid = results[0].uid;
            var regdet = {
                isactive: true,
                password: password
            }
            connection.query('update login set ? where uid=?', [regdet, newuid], (err, done) => {
                if (err) console.log(err + "biscyt");
                else console.log("link activated");
                res.render('login');
            })
        }
    })

})

api.post('/sample', (req, res) => {
    console.log(req.body);
    res.send("Activated")
})

api.post('/login', (req, res) => {
    console.log("login's post method");
    var username = req.body.username;
    var password = req.body.password;
    var logdetails = {
        username: username,
        password: password
    }
    username = bcrypt.hashSync(username, 8);
    var token2 = username;
    return new promise((resolve, reject) => {
        connection.query('select * from user where username = ?', [logdetails.username], (err, results) => {
            if (results.length > 0) {
                console.log(results[0].uid);
                connection.query('select * from login where uid=?', results[0].uid, (err, tabd) => {
                    console.log(tabd[0]);
                    bcrypt.compare(password, tabd[0].password, (err, doesmatch) => {
                        if (doesmatch) {
                            req.session.user = results[0].uid;
                            newuserid = req.session.user;
                            console.log(newuserid + "im session user");
                            resolve(newuserid)
                            // res.render('dashboard')
                        } else {
                            res.send("you not a valid user")
                        }
                        if (err) {
                            console.log(err);
                            return;
                        }
                    })
                })

            } else {
                return new promise((resolve, reject) => {
                    connection.query('select * from usercontact where contactinfo = ?', [logdetails.username], (err, resultdata) => {
                        if (resultdata.length > 0) {
                            console.log(resultdata[0].uid);
                            connection.query('select * from login where uid=?', resultdata[0].uid, (err, result2) => {
                                bcrypt.compare(password, result2[0].password, (err, doesmatch) => {
                                    if (doesmatch) {
                                        req.session.user = resultdata[0].uid;
                                        newuserid = req.session.user;
                                        console.log(newuserid + "im session user");
                                        resolve(newuserid);
                                        // res.render('dashboard')
                                    } else {
                                        res.send("you are not a valid user")
                                    }
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                })
                            })

                        } else {

                            res.send("enter the valid details")
                        }
                    })
                }).then((res2) => {
                    console.log(newuserid + " is logging in railsproject");
                    console.log(res2);
                    resolve(res2);
                })
            }
        })

    }).then((userid) => {
        return new promise((resolve, reject) => {
            connection.query('select * from userauth where uid=?', userid, (err, result7) => {
                //console.log(result7);
                if (result7.length == 0) {
                    console.log("no auth tokn");
                    console.log(token2 + "Shld b insrtd");
                    var authdata = {
                        uid: userid,
                        activationtoken: token2
                    }

                    connection.query('insert into userauth set ?', authdata, (err, result5) => {
                        console.log("auth token insrtd");
                        resolve(result5[0])
                    })
                } else {
                    console.log("token  exists");
                    connection.query('update userauth set activationtoken=? where uid=?', [token2, userid], (err, res6) => {
                        console.log("updated userauth with token2");
                        connection.query('select * from userauth where uid=?', userid, (err, res9) => {
                            resolve(res9[0])
                        })
                    })
                }
            })

        }).then((result8) => {
            console.log("in the inner then mthd");
            console.log(result8);
            res.send("Login Successful" + result8);
        })

    })
})


//import sql pckg
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sameer12345',
    database: 'railsdb'
});
//strt connction
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('mysql connected as id ' + connection.threadId);
});

module.exports = api;
