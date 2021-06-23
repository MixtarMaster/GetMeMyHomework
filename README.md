# GetMeMyHomework

This is an app that fetches your daily homework and what teachers added to "contenue de séances" from "EcoleDirecte".

## Context

EcoleDirecte is a website/app used by some french schools to ease communication between students and teachers, including features for the school administration and for parents too.

## Instalation

Just clone the repo, don't forget to install dependencies with :

```bash
npm install
```

You will need to use a service to send emails through, I personnaly use [mailjet](https://www.mailjet.com/) and a [protonmail](https://protonmail.com) adress as the sender but you can use any you like.

**Note**: Most free services will default to your spam folder on the receiver side.

## Usage

Fill in the [settings.json](./settings.json) file with the relivent information.
Then run

```bash
node app.js
```

### "EcoleDirecte"

Write in your email adress (user) and password (pass) used to connect to your EcoleDirecte account.

### "Da Mail"

Put in the sender email adress (from) and the receipient (to).

### Transporter information

Fill in the information given by your chosen service, they should provide with a "host" link, a "port", a user name (user) and password (pass). If they don't tell you whether it is "secure" try true at first then false if it doesn't work.

### Scheduling

Please use 24 hour format.

## Known bugs

None known, please tell if you find any!

## License

See [license.txt](./license.txt)

## Contributing

Pull requests are welcome, if you have anything you think could be added. Please use the prettier format settings.

### Contributors

Thanks to:

[a2br](https://github.com/a2br)

## Other

The email you receive is in french, I plan to add a "language" setting soon.
