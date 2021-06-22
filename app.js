// --------------- imports ----------------

const nodeSchedule = require('node-schedule');
const ec = require('ecoledirecte.js');
const nodemailer = require('nodemailer');
const fs = require('fs');

//-------------- Taking settings into account -------------------
const settings = JSON.parse(fs.readFileSync('settings.json'));

//check that settings are as needed
let settingsComply = true;
//EcoleDirecte settings
if(settings.ecoleDirecte.user === "" || settings.ecoleDirecte.user == undefined || typeof(settings.ecoleDirecte.user) != "string"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a EcoleDirecte user");}
if(settings.ecoleDirecte.pass === "" || settings.ecoleDirecte.pass == undefined || typeof(settings.ecoleDirecte.pass) != "string"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a EcoleDirecte password");}
//"DaMail" settings
if(settings.daMail.from === "" || settings.daMail.from == undefined || typeof(settings.daMail.from) != "string"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a sending Email adress");}
if(settings.daMail.to === "" || settings.daMail.to == undefined || typeof(settings.daMail.to) != "string"){
    settingsComplyecoleDirecte = false; throw new Error("Please make sure to use the correct settings.json format and have a receiving Email adress");}
if(settings.daMail.subject == undefined || typeof(settings.daMail.subject) != "string"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a Email subject");}
//transporter settings
if(settings.transporterInformation.host === "" || settings.transporterInformation.host == undefined || typeof(settings.transporterInformation.host) !== "string"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a host to send your email through");}
if(settings.transporterInformation.port === 0 || settings.transporterInformation.port == undefined || typeof(settings.transporterInformation.port) !== "number"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a port (int) to send your email through");}
if(settings.transporterInformation.secure == undefined || typeof(settings.transporterInformation.secure) !== "boolean"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a security setting (true or false)");}
//transporter auth settings
if(settings.transporterInformation.auth.user === "" || settings.transporterInformation.auth.user == undefined || typeof(settings.transporterInformation.auth.user) != "string"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a transporter user to connect to your chosen transporter service");}
if(settings.transporterInformation.auth.pass === "" || settings.transporterInformation.auth.pass == undefined || typeof(settings.transporterInformation.auth.pass) != "string"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a transporter password to connect to your chosen transporter service");}
//scheduling settings
if(settings.scheduling.hour == undefined || typeof(settings.scheduling.hour) !== "number"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a security setting (true or false)");}
if(settings.scheduling.minute == undefined || typeof(settings.scheduling.minute) !== "number"){
    settingsComply = false; throw new Error("Please make sure to use the correct settings.json format and have a security setting (true or false)");}
    
if(settingsComply){

function doTheWork(){ //putting the code in a function for scheduling
// --------------- Ecole directe side setup ----------------


//set up "today" var
let toDay = new Date();

let date = ("0" + toDay.getDate()).slice(-2);
let month = ("0" + (toDay.getMonth() + 1)).slice(-2);
let year = toDay.getFullYear();

let hour = toDay.getHours();
let minute = toDay.getMinutes();

let today = year + "-" + month + "-" + date;

// Create a new Session.
const session = new ec.Session(settings.ecoleDirecte.user, settings.ecoleDirecte.pass);


// Bring your session to life!
const account = (async () => {await session.login().catch(err => {
	console.error("This login did not go well.");
    console.log(err);
})});


console.log("EcoleDirecte session open and up!");

// Get the homework due for a specific date as a simplified array + at t
const homework = (async () => {await account.getHomework({ dates: today })});

// No homework.length, defining it
let homeworkLength = 0
while(homework[homeworkLength] != undefined){
    homeworkLength += 1;
}

//setting up both vars of content
let toBeDoneHtml = ""; var toBeDoneText = "";
let doneDuringTheLessonHtml = ""; var doneDuringTheLessonText = "";

//getting the content and putting it in the previously created vars
for(let i = 0; i < homeworkLength; i++){
    toBeDoneText += (homework[i].subject.name + ":");
    toBeDoneHtml += ("<h3>" + homework[i].subject.name + "</h3>");
    doneDuringTheLessonHtml += ("<h3>" + homework[i].subject.name + "</h3>");
    doneDuringTheLessonText += (homework[i].subject.name + ":");

    if(homework[i].job !== undefined){ //some have no "job" object
        toBeDoneHtml += homework[i].job.content.html;
        toBeDoneText += homework[i].job.content.text;
    }
    if(homework[i].contenuDeSeance !== undefined){ //some have no "contenue de séance"
        doneDuringTheLessonHtml += homework[i].contenuDeSeance.content.html;
        doneDuringTheLessonText += homework[i].contenuDeSeance.content.text;
    }
}

console.log("EcoleDirecte side finished!");


// ---- full message to be mailed setup ----


const daMail = {
    from : settings.daMail.from,
    to : settings.daMail.to,
    subject : settings.daMail.subject,
    text : "Voici l\'update cours du"
        + date + "/" + month + "/" + year + " de " + hour + ":" + minute
        +  "Les contenus de seance:"
        +  doneDuringTheLessonText
        +  "Et pour les devoirs:"
        +  toBeDoneText
        +  "N\'oublie pas d\'aller verifier parfois quand meme! Bisous",

    html : '<h1 style="text-align: center; color: #4169E1">Voici l\'update cours du '
        + date + '/' + month + '/' + year + ' de ' + hour + ':' + minute + '</h1>'
        +  '<h2 style="padding-left: 30px; color: green;">Les contenus de seance:</h2>'
        +  doneDuringTheLessonHtml
        +	'<h2 style="padding-left: 30px; color: green;">Et pour les devoirs:</h2>'
        +	toBeDoneHtml
        +	'<h1 style="color: red">N\'oublie pas d\'aller verifier parfois quand meme! Bisous</h1>'
}

console.log("Mail var up!");


// -------------- node mail and protonmail side --------------------
 

//setup transporter -> service to send the mail
const mailTransporter = nodemailer.createTransport({
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
        console.error("It appears we can't send the email.")
        console.log(err);
    }
    else{
        console.log("Mail send! Here is the info!");
        console.log(info);
    }
});
}

const scheduleHour = settings.scheduling.hour.toString();

let scheduleMinutes = settings.scheduling.minute.toString();
if(scheduleMinutes.length === 1){
    scheduleMinutes = "0" + scheduleMinutes;
}

const cronFormat = (scheduleMinutes + " " + scheduleHour + " * * *");
 
console.log("code ready, scheduling");
const scheduleTheExecution = nodeSchedule.scheduleJob(cronFormat, doTheWork);
console.log("You should receive your homework everyday at" + scheduleHour + ":" + scheduleMinutes 
    + " now, check your spam folder if you think you didn't receive it.")
}


