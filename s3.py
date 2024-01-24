import json
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta

s3 = boto3.client('s3')

def add_tags_to_object(bucket_name, object_list, tag_key, tag_value):
    for obj in object_list:
        s3.put_object_tagging(
        Bucket=bucket_name,
        Key=obj,
        Tagging={'TagSet': [{'Key': tag_key,'Value': tag_value}]
        }
    )

def list_objects_in_last_15_days(bucket_name):
    current_date = datetime.now()
    end_date = datetime(current_date.year, current_date.month, current_date.day)
    start_date = end_date - timedelta(days=15)
    response = s3.list_objects_v2(Bucket=bucket_name)
    objects_in_last_15_days = []
    for obj in response.get('Contents', []):
        last_modified_date = obj['LastModified'].replace(tzinfo=None)
        if start_date <= last_modified_date <= end_date:
            objects_in_last_15_days.append(obj['Key'])
    return objects_in_last_15_days

def lambda_handler(event, context):
    bucket_name = event['BucketName']
    tag_key = event['TagKey']
    tag_value = event['TagValue']
    object_list = list_objects_in_last_15_days(bucket_name)
    add_tags_to_object(bucket_name, object_list, tag_key, tag_value)
    return {
        'statusCode': 200,
        'body': 'Success'
    }
