[![CircleCI](https://circleci.com/gh/ssmlee04/meanio-uploads/tree/master.svg?style=shield)](https://circleci.com/gh/ssmlee04/meanio-uploads/tree/master)

Upload something to the server. Also when the following environment variables are set, you can choose to upload stuff to S3 directly. 

```
AWS_ACCESS_KEY 
AWS_ACCESS_SECRET 
AWS_REGION
AWS_S3_BUCKET
```

Subpath is a filepath relative to the project upload folder. Generally the absolute path for the uploaded file is

```
appRootPath + appUploadPath + Subpath
```
