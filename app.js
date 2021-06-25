// --------------- imports ----------------

const nodeSchedule = require('node-schedule');
const ec = require('ecoledirecte.js');
const nodemailer = require('nodemailer');
const fs = require('fs');

const sec = require('./security');

//-------------- Taking settings into account -------------------
const settings = JSON.parse(fs.readFileSync('settings.json'));
const laguageDir = './languagePack/' + settings.main.language + '.json';
const languagePack = JSON.parse(fs.readFileSync(laguageDir));

//check that settings are as needed with security.js
let settingsComply = sec.test;

if (settingsComply) {
  function doTheWork() {
    //putting the code in a function for scheduling
    // --------------- Ecole directe side setup ----------------

    //set up "today" var
    let toDay = new Date();

    let date = ('0' + toDay.getDate()).slice(-2);
    let month = ('0' + (toDay.getMonth() + 1)).slice(-2);
    let year = toDay.getFullYear();

    let hour = toDay.getHours();
    let minute = toDay.getMinutes();

    let today = year + '-' + month + '-' + date;

    // Create a new Session.
    const session = new ec.Session(
      settings.ecoleDirecte.user,
      settings.ecoleDirecte.pass
    );

    // Bring your session to life!
    const account = async () => {
      await session.login().catch((err) => {
        console.error('This login did not go well.');
        console.log(err);
      });
    };

    console.log('EcoleDirecte session open and up!');

    // Get the homework due for a specific date as a simplified array + at t
    const homework = async () => {
      await account.getHomework({dates: today});
    };

    // No homework.length, defining it
    let homeworkLength = 0;
    while (homework[homeworkLength] != undefined) {
      homeworkLength += 1;
    }

    //setting up both vars of content
    let toBeDoneHtml = '';
    let toBeDoneText = '';
    let doneDuringTheLessonHtml = '';
    let doneDuringTheLessonText = '';

    //getting the content and putting it in the previously created vars
    for (let i = 0; i < homeworkLength; i++) {
      toBeDoneText += homework[i].subject.name + ':';
      toBeDoneHtml += '<h3>' + homework[i].subject.name + '</h3>';
      doneDuringTheLessonHtml += '<h3>' + homework[i].subject.name + '</h3>';
      doneDuringTheLessonText += homework[i].subject.name + ':';

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

    console.log('EcoleDirecte side finished!');

    // ---- full message to be mailed setup ----

    const daMail = {
      from: settings.daMail.from,
      to: settings.daMail.to,
      subject: settings.daMail.subject,
      text:
        languagePack.daMail.part1 +
        date +
        '/' +
        month +
        '/' +
        year +
        languagePack.daMail.part2 +
        hour +
        ':' +
        minute +
        languagePack.daMail.part3 +
        doneDuringTheLessonText +
        languagePack.daMail.part4 +
        toBeDoneText +
        languagePack.daMail.warning,

      html:
        '<h1 style="text-align: center; color: #4169E1">' +
        languagePack.daMail.part1 +
        '</h1>' +
        date +
        '/' +
        month +
        '/' +
        year +
        languagePack.daMail.part2 +
        hour +
        ':' +
        minute +
        '</h1>' +
        '<h2 style="padding-left: 30px; color: green;">' +
        languagePack.daMail.part3 +
        '</h2>' +
        doneDuringTheLessonHtml +
        '<h2 style="padding-left: 30px; color: green;">' +
        languagePack.daMail.part4 +
        '</h2>' +
        toBeDoneHtml +
        '<h1 style="color: red">' +
        languagePack.daMail.warning +
        '</h1>',
    };

    console.log('Mail var up!');

    // -------------- node mail and protonmail side --------------------

    //setup transporter -> service to send the mail
    const mailTransporter = nodemailer.createTransport({
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
        console.error("It appears we can't send the email.");
        console.log(err);
      } else {
        console.log('Mail send! Here is the info!');
        console.log(info);
      }
    });
  }

  const scheduleHour = settings.scheduling.hour.toString();

  let scheduleMinutes = settings.scheduling.minute.toString();
  if (scheduleMinutes.length === 1) {
    scheduleMinutes = '0' + scheduleMinutes;
  }

  const cronFormat = scheduleMinutes + ' ' + scheduleHour + ' * * *';

  console.log('code ready, scheduling');
  const scheduleTheExecution = nodeSchedule.scheduleJob(cronFormat, doTheWork);
  console.log(
    'You should receive your homework everyday at ' +
      scheduleHour +
      ':' +
      scheduleMinutes +
      " now, check your spam folder if you think you didn't receive it."
  );
}
