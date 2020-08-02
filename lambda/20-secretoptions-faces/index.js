from __future__ import print_function

import boto3
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal
import json
import urllib.parse

rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    
    #イベントからバケット名と画像ファイル名を抜き出し

    bucket = event['bucket']
    key = event['key']
    
    #rekognition呼び出し
    threshold = 70 
    maxFaces = 15
    response = rekognition.search_faces_by_image(CollectionId="CueLab2020SecretOptionsFaces2", 
                                                Image={"S3Object": {"Bucket": bucket, "Name": key}},
                                                FaceMatchThreshold=threshold,
                                                MaxFaces=maxFaces)
    
    #顔面検索結果の格納と、社員番号の格納
    faceMatches = response['FaceMatches']
    externalImageId = faceMatches[0]['Face']['ExternalImageId']
    
    #テスト用に仮値をexternalImageIdにいれる
    #externalImageId = "5029383"
    
    #社員番号から各値をDB検索する                                            
    table = dynamodb.Table('20-secretoptions-faces')
    tableresponse = table.get_item(
        Key={
            'emp_num':externalImageId
        }
    )
    
    #検索結果の展開
    power = tableresponse['Item']['power']
    
    finalResponse ={
        "statusCode": 200,
        "headers": {
            "x-custom-header" : "my custom header value"
        },
        "body": tableresponse['Item']
    }
    
    #返却
    return finalResponse
