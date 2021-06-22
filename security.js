const fs = require("fs");
const settings = JSON.parse(fs.readFileSync("settings.json"));

module.exports = {
  test: function () {
    let settingsComply = true;
    let errors = "";
    //EcoleDirecte settings
    if (
      settings.ecoleDirecte.user === "" ||
      settings.ecoleDirecte.user == undefined ||
      typeof settings.ecoleDirecte.user != "string"
    ) {
      settingsComply = false;
      errors += "\n No EcoleDirecte user, must also be string";
    }
    if (
      settings.ecoleDirecte.pass === "" ||
      settings.ecoleDirecte.pass == undefined ||
      typeof settings.ecoleDirecte.pass != "string"
    ) {
      settingsComply = false;
      errors += "\n No EcoleDirecte password, must also be string";
    }
    //"DaMail" settings
    if (
      settings.daMail.from === "" ||
      settings.daMail.from == undefined ||
      typeof settings.daMail.from != "string"
    ) {
      settingsComply = false;
      errors += "\n No email adress as sender, muake sure it is a string";
    }
    if (
      settings.daMail.to === "" ||
      settings.daMail.to == undefined ||
      typeof settings.daMail.to != "string"
    ) {
      settingsComplyecoleDirecte = false;
      errors += "\n No email adress as receiver, might not be a string";
    }
    if (
      settings.daMail.subject == undefined ||
      typeof settings.daMail.subject != "string"
    ) {
      settingsComply = false;
      errors +=
        "\n No subject for the email, could be undefined or not a string";
    }
    //transporter settings
    if (
      settings.transporterInformation.host === "" ||
      settings.transporterInformation.host == undefined ||
      typeof settings.transporterInformation.host !== "string"
    ) {
      settingsComply = false;
      errors +=
        "\n No host to send email through, maybe wasn't in settings.json, maybe wasn't a string";
    }
    if (
      settings.transporterInformation.port === 0 ||
      settings.transporterInformation.port == undefined ||
      typeof settings.transporterInformation.port !== "number"
    ) {
      settingsComply = false;
      errors += "\n No valid port, must be an int";
    }
    if (
      settings.transporterInformation.secure == undefined ||
      typeof settings.transporterInformation.secure !== "boolean"
    ) {
      settingsComply = false;
      errors +=
        "\n Lacks security information, must be boolean (true or false)";
    }
    //transporter auth settings
    if (
      settings.transporterInformation.auth.user === "" ||
      settings.transporterInformation.auth.user == undefined ||
      typeof settings.transporterInformation.auth.user != "string"
    ) {
      settingsComply = false;
      errors +=
        "\n You probably forgot to put in a user for your email transporter information";
    }
    if (
      settings.transporterInformation.auth.pass === "" ||
      settings.transporterInformation.auth.pass == undefined ||
      typeof settings.transporterInformation.auth.pass != "string"
    ) {
      settingsComply = false;
      errors +=
        "\n It seems there is no password to connect to the transporter";
    }
    //scheduling settings
    if (
      settings.scheduling.hour == undefined ||
      typeof settings.scheduling.hour !== "number"
    ) {
      settingsComply = false;
      errors +=
        "\n The hour you have set doesn't comply with format, must be an int";
    }
    if (
      settings.scheduling.minute == undefined ||
      typeof settings.scheduling.minute !== "number"
    ) {
      settingsComply = false;
      errors += "\n The minute you have set must be an int";
    }

    return settingsComply;
  }
};
