# image-words
show the image with some words, and you'll find new meaning.


For example

normal image   
<img src="https://image.ibb.co/g9OSez/image.jpg" width="300" height="180" >   


with words: '考砸了' (bombed the test)   
<img src="https://image.ibb.co/gpBSUz/image.jpg" width="300" height="240" >   




## tools and dev packages
### tools
- [Chocolatey](https://chocolatey.org/)
- [postman](https://www.getpostman.com/)
- [Advanced REST Client](https://advancedrestclient.com/)
- [mongodb](https://www.mongodb.com/)
- [robomongo(Robo 3T)](https://robomongo.org/)
- [nodemon](https://nodemon.io/)
- [ConEmu(ConEmu-Maximus5)](https://conemu.github.io/)
- [Cygwin](https://www.cygwin.com/)


### packages
```
yarn global add webpack
yarn global add express-generator
yarn global add nodemon
```


## add packages project need
```
yarn add express
yarn add redux
yarn add redux-logger
yarn add react
yarn add react-dom
yarn add react-redux
yarn add react-router
yarn add react-bootstrap
yarn add react-router
yarn add mongoose
yarn add axios
yarn add redux-thunk
yarn add http-proxy
yarn add connect-mongo
yarn add express-session
yarn add nodemon --dev
yarn install
  (avoid packages not found error)
```


### redux-logger
- redux-logger@3.0 changed
```
[redux-logger v3] BREAKING CHANGE
[redux-logger v3] Since 3.0.0 redux-logger exports by default logger with default settings.
[redux-logger v3] Change
[redux-logger v3] import createLogger from 'redux-logger'
[redux-logger v3] to
[redux-logger v3] import { createLogger } from 'redux-logger'
```

## Express cli
```
express (this command will init current dir and generate bootstrap files)
```

## DB
- mongodb
```
mongod --dbpath D:\prj\mongodb-data
```

## API server
script start doesn't work correctly under windows since '&' character is for linux shell.
<br>use '|' for windows.
```
"scripts": {
  "start": "node ./bin/www | node apiServer.js"
},
```

## react-router v4
```
yarn remove react-router
yarn add react-router-dom@4.1.1
```

## set env before start server/api server
```
setEnv.cmd
```

## start nodemon
```
nodemon ./bin/www
```


