const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const handler = (event, context, callback) => {

  // リクエストボディに設定された画像データはBase64エンコードされているので、デコードする
  var bucket= event.bucketName;
  var key= event.fileName;
  
  console.log("bucket" + bucket);
  console.log("key" + key);


  let requestBody = Buffer.from(event.image, 'base64');


  s3.putObject({
    Body: requestBody,
    Bucket: bucket, // 先ほど作成したS3バケット名に合わせる
    ContentType: 'image/jpeg',
    Key: key
  }).promise()
    // S3へのアップロードが完了したら完了レスポンス
    .then((result) => {
      callback(null, {
        body: JSON.stringify(result),
        statusCode: 200
      });
    })
    // S3へのアップロードに失敗したら、エラーレスポンス
    .catch((err) => {
      callback(err, {
        body: JSON.stringify(err),
        statusCode: 500
      });
    });
}

module.exports = { handler }
