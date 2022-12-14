# Classroom Manager

This is a tool for teachers to manage classrooms and for students to have an interactive way ask for help. It runs a Node/Express server for the backend and a frontend built in Vue. It also uses websockets for communication.

## Project Setup

1.  Install npm dependencies

        npm install --omit=dev

2.  Create a .env file in the root directory

        /node_modules
        /src
        /views
        main.js
        package.json
        README.md
        .env

3.  Edit the .env file and set the environment variables

```
PORT="80";
JWT_SECRET="your-secret";
```

PORT is the port that the server will listen on

JWT_SECRET will be your hidden JWT Secret key which should be a generated random string of characters with about 64 characters of length.

4.  Start the server

        npm run start

You should get a Message showing the url that the server will use.
