# Signs

A demo that shows how to remote control digital signage on multiple screens from a central server.

### Install Node.js

Install the [Node.js](https://nodejs.org/download) runtime environment. Node.js is a tool that is used to run the Signs server, which is implemented as a JavaScript script. 

### Change to Signs directory

```all
cd ~/Downloads/signs
```
Open a terminal and change to the Signs API directory, wherever you have downloaded it.

### Install node modules

```all
npm install
```
Then use the node package manager to install the required packages and their dependencies. The npm tool will look in the package.json file to find out which packages need to be installed.

### Start the server

```all
node signs.js
```
In a separate terminal window or tab, start the Signs server. This will tell Node.js to run the signs.js script and wait for incoming HTTP requests and Socket.IO messages.

### Start page

You can open the start page by going to [http://localhost:8080/](http://localhost:8080/) in your browser. Substitute the name of your computer to connect from other devices. 

