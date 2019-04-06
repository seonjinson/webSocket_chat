# Real-time chat server using web socket
chat server using ws protocol

### Dependancy Install
```
$ npm install
$ npm install -g nodemon
```

### Environment Configuration
* Database: mongoDB
```
$ mongod --auth
```
> Use mongoDB authentication mode
* .env file configuration(dir=./)
  - MONGO_ID=root
  - MONGO_PASSWORD=nodejs

### Server Execution Script
```
$ npm start
```