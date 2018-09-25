<!-- start api -->


## start api server manual

- mongodb   
  start your mongodb service(google it)

- apollo graphql engie key(optional)   
  [get apollo key](https://engine.apollographql.com/login)   
  the apollo key is optional(or you can skip it)

- register aliyun OSS account   
  Aliyun OSS is similar to Amazon S3   
  [CN: 阿里云对象存储](https://www.alibabacloud.com/zh/product/oss)   
  [EN: Ali Object Storage Service](https://www.alibabacloud.com/product/oss)   
  After registered, create two OSS RAMs:    
  a full access and a read only access.   

- register aliyun SMS account(optional)   
  the aliyun SMS is optional(or you can skip it,but the SMS service will fail)   
  [CN: 阿里云短信](https://cn.aliyun.com/product/sms)   

- env file
  - rename or copy dot.env file to .env   
    [dotenv](https://www.npmjs.com/package/dotenv) need .env file   
    and change .env with your service info

  - mongodb info   
    - REMOTE_DB_URI
    - REMOTE_DB_USER
    - REMOTE_DB_PASS

  - OSS info   
    full access ram   
    - OSS_KEY_ID
    - OSS_KEY_SECRET
  
    STS access ram   
    - STS_KEY_ID
    - STS_KEY_SECRET
  
    OSS region info
    - OSS_REGEIN(spell wrong: REGEIN should be REGION)    
    - OSS_ENDPOINT    
    - OSS_ENDPOINT_INERNAL    
    - OSS_BUCKET_IMAGE    
    - ROLE_ARN    

  - SMS info   
    - SMS_KEY_ID
    - SMS_KEY_SECRET
    - SMS_SIGN_NAME
    - SMS_TEMPLATE_CODE
  
  - apollo graphql key
    - APOLLO_ENGIE_KEY
  
  - crypto keys   
  the crypto keys(server&client):   
  server key is used at server,client key will be sent to cient(mobile or web)   
    - SECRET_SERVER_SIDE_KEY
    - SECRET_CLIENT_SIDE_KEY

- yarn start   
if everything is OK, api server will start as logs:   
```
$ nodemon ./bin/www
[nodemon] 1.14.3
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `node ./bin/www`
YYYY-MM-DD HH:mm:ss.SSS info: API server started@ 3001
Mongoose: user.ensureIndex({ username: 1 }, { unique: true, background: true })
YYYY-MM-DD HH:mm:ss.SSS info: Connected to db OK : ip.ip.ip.ip
Mongoose: user.ensureIndex({ phone: 1 }, { unique: true, background: true })
```
If not,check your .env file, or db/oss/graphql configs.



