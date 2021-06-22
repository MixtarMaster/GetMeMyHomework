// --------------- imports ----------------

const nodeSchedule = require("node-schedule");
const ec = require("ecoledirecte.js");
const nodemailer = require("nodemailer");
const fs = require("fs");

//-------------- Taking settings into account -------------------
const settings = JSON.parse(fs.readFileSync("settings.json"));

async function doTheWork() {
  //putting the code in a function for scheduling
  // --------------- Ecole directe side setup ----------------

  //set up "today" var
  let now = new Date();

  let date = ("0" + now.getDate()).slice(-2);
  let month = ("0" + (now.getMonth() + 1)).slice(-2);
  let year = now.getFullYear();

  let hour = now.getHours();
  let minute = now.getMinutes();

  let today = year + "-" + month + "-" + date;

  // Create a new Session.
  const session = new ec.Session(
    settings.ecoleDirecte.user,
    settings.ecoleDirecte.pass
  );

  const account = await session.login();
  if (account.type !== "student") throw new Error("Not a student");
  console.log("EcoleDirecte session open and up!");

  // Get the homework due for a specific date as a simplified array + at t
  const homework = await account.getHomework({ dates: today });

  //setting up both vars of content
  let toBeDoneHtml = "";
  let toBeDoneText = "";
  let doneDuringTheLessonHtml = "";
  let doneDuringTheLessonText = "";

  //getting the content and putting it in the previously created vars
  for (let i = 0; i < homeworkLength; i++) {
    toBeDoneText += homework[i].subject.name + ":";
    toBeDoneHtml += "<h3>" + homework[i].subject.name + "</h3>";
    doneDuringTheLessonHtml += "<h3>" + homework[i].subject.name + "</h3>";
    doneDuringTheLessonText += homework[i].subject.name + ":";

    if (homework[i].job !== undefined) {
      //some have no "job" object
      toBeDoneHtml += homework[i].job.content.html;
      toBeDoneText += homework[i].job.content.text;
    }
    if (homework[i].contenuDeSeance !== undefined) {
      //some have no "contenue de séance"
      doneDuringTheLessonHtml += homework[i].contenuDeSeance.content.html;
      doneDuringTheLessonText += homework[i].contenuDeSeance.content.text;
    }
  }

  console.log("EcoleDirecte side finished!");

  // ---- full message to be mailed setup ----

  const daMail = {
    from: settings.daMail.from,
    to: settings.daMail.to,
    subject: settings.daMail.subject,
    text:
      "Voici l'update cours du" +
      date +
      "/" +
      month +
      "/" +
      year +
      " de " +
      hour +
      ":" +
      minute +
      "Les contenus de seance:" +
      doneDuringTheLessonText +
      "Et pour les devoirs:" +
      toBeDoneText +
      "N'oublie pas d'aller verifier parfois quand meme! Bisous",

    html:
      '<h1 style="text-align: center; color: #4169E1">Voici l\'update cours du ' +
      date +
      "/" +
      month +
      "/" +
      year +
      " de " +
      hour +
      ":" +
      minute +
      "</h1>" +
      '<h2 style="padding-left: 30px; color: green;">Les contenus de seance:</h2>' +
      doneDuringTheLessonHtml +
      '<h2 style="padding-left: 30px; color: green;">Et pour les devoirs:</h2>' +
      toBeDoneHtml +
      "<h1 style=\"color: red\">N'oublie pas d'aller verifier parfois quand meme! Bisous</h1>",
  };

  console.log("Mail var up!");

  // -------------- node mail and protonmail side --------------------

  //setup transporter -> service to send the mail
  let mailTransporter = nodemailer.createTransport({
    host: settings.transporterInformation.host,
    port: settings.transporterInformation.port,
    secure: settings.transporterInformation.secure,
    auth: {
      user: settings.transporterInformation.auth.user,
      pass: settings.transporterInformation.auth.pass,
    },
  });

  mailTransporter.sendMail(daMail, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("Mail send! Here is the info!");
      console.log(info);
    }
  });
}

let scheduleHour = settings.scheduling.hour;
let scheduleMinutes = settings.scheduling.minute;
if (scheduleMinutes.length === 1) {
  scheduleMinutes = "0" + scheduleMinutes;
}

let cronFormat = scheduleMinutes + " " + scheduleHour + " * * *";

console.log("code ready, scheduling");
const makeItWork = nodeSchedule.scheduleJob(cronFormat, doTheWork);
console.log("code should execute at " + scheduleHour + ":" + scheduleMinutes);
