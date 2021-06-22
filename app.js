// --------------- imports ----------------

const nodeSchedule = require('node-schedule');
const ec = require('ecoledirecte.js');
const nodemailer = require('nodemailer');
const fs = require('fs');

//-------------- Taking settings into account -------------------
let rawSettingsData = fs.readFileSync("settings.json");
let settings = JSON.parse(rawSettingsData);

function doTheWork(){ //putting the code in a function for scheduling
// --------------- Ecole directe side setup ----------------


//set up "today" var
let date_ob = new Date();

let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();

let hour = date_ob.getHours();
let minute = date_ob.getMinutes();

var today = year + "-" + month + "-" + date;

// Create a new Session.
const session = new ec.Session(settings.ecoleDirecte.user, settings.ecoleDirecte.pass);

// Bring your session to life!
const account = (async () => {await session.login().catch(err => {
	console.error("This login did not go well.");
})});

console.log("EcoleDirecte session open and up!");

// Get the homework due for a specific date as a simplified array + at t
const homework = (async () => {await account.getHomework({ dates: today })});

// No homework.length, defining it
var homeworkLength = 0
while(homework[homeworkLength] != undefined){
    homeworkLength += 1;
}

//setting up both vars of content
var toBeDoneHtml = ""; var toBeDoneText = "";
var doneDuringTheLessonHtml = ""; var doneDuringTheLessonText = "";

//getting the content and putting it in the previously created vars
for(var i = 0; i < homeworkLength; i++){
    toBeDoneText += (homework[i].subject.name + ":");
    toBeDoneHtml += ("<h3>" + homework[i].subject.name + "</h3>");
    doneDuringTheLessonHtml += ("<h3>" + homework[i].subject.name + "</h3>");
    doneDuringTheLessonText += (homework[i].subject.name + ":");

    if(homework[i].job != undefined){ //some have no "job" object
        toBeDoneHtml += homework[i].job.content.html;
        toBeDoneText += homework[i].job.content.text;
    }
    if(homework[i].contenuDeSeance != undefined){ //some have no "contenue de séance"
        doneDuringTheLessonHtml += homework[i].contenuDeSeance.content.html;
        doneDuringTheLessonText += homework[i].contenuDeSeance.content.text;
    }
}

console.log("EcoleDirecte side finished!");


// ---- full message to be mailed setup ----


var daMail = {
    from : settings.daMail.from,
    to : settings.daMail.to,
    subject : settings.daMail.subject,
    text : 'Voici l\'update cours du' + date + '/' + month + '/' + year + ' de ' + hour + ":" + minute
        +  'Les contenus de seance:'
        +  doneDuringTheLessonText
        +  'Et pour les devoirs:'
        +  toBeDoneText
        +  'N\'oublie pas d\'aller verifier parfois quand meme! Bisous',

    html : '<h1 style="text-align: center; color: #4169E1">Voici l\'update cours du ' + date + '/' + month + '/' + year + ' de ' + hour + ":" + minute + '</h1>'
        +  '<h2 style="padding-left: 30px; color: green;">Les contenus de seance:</h2>'
        +  doneDuringTheLessonHtml
        +	'<h2 style="padding-left: 30px; color: green;">Et pour les devoirs:</h2>'
        +	toBeDoneHtml
        +	'<h1 style="color: red">N\'oublie pas d\'aller verifier parfois quand meme! Bisous</h1>'
}

console.log("Mail var up!");

// -------------- node mail and protonmail side --------------------
 

//setup transporter -> service to send the mail
let mailTransporter = nodemailer.createTransport({
    host : settings.transporterInformation.host,
    port : settings.transporterInformation.port,
    secure : settings.transporterInformation.secure,
    auth : {
        user : settings.transporterInformation.auth.user,
        pass : settings.transporterInformation.auth.pass
    }
});


mailTransporter.sendMail(daMail, function(err, info){
    if(err){
        console.log(err);
    }
    else{
        console.log("Mail send! Here is the info!");
        console.log(info);
    }
});
}

let scheduleHour = settings.scheduling.hour;
let scheduleMinutes = settings.scheduling.minute;
if(scheduleMinutes.length == 1){
    scheduleMinutes = "0" + scheduleMinutes;
}

let cronFormat = scheduleMinutes + " " + scheduleHour + " * * *";

console.log("code ready, scheduling");
const makeItWork = nodeSchedule.scheduleJob(cronFormat, doTheWork);
console.log("code should execute at " + scheduleHour + ":" + scheduleMinutes)

