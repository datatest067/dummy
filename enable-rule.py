import uuid
import json
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
import os

s3 = boto3.client('s3')
s3control = boto3.client('s3control')

def add_tags_to_object(bucket_name, object_list, tag_key, tag_value):
    for obj in object_list:
        s3.put_object_tagging(
        Bucket=bucket_name,
        Key=obj,
        Tagging={'TagSet': [{'Key': tag_key,'Value': tag_value}]
        }
    )

def list_objects_in_last_days(bucket_name, days):
    current_date = datetime.now()
    end_date = datetime(current_date.year, current_date.month, current_date.day)
    start_date = end_date - timedelta(days=days)
    response = s3.list_objects_v2(Bucket=bucket_name)
    objects_in_last_days = []
    for obj in response.get('Contents', []):
        last_modified_date = obj['LastModified'].replace(tzinfo=None)
        if start_date <= last_modified_date:
            objects_in_last_days.append(obj['Key'])
    return objects_in_last_days

def create_bactch_job(account_id, source_bucket, destination_bucket, client_request_token, iam_role_arn):
    response = s3control.create_job(
        AccountId=account_id,
        ConfirmationRequired=False,
        Operation={"S3ReplicateObject": {}},
        Priority=10,
        Report={
            "Bucket": f"arn:aws:s3:::{destination_bucket}",
            "Enabled": True,
            "Format": "Report_CSV_20180820",
            "ReportScope": "AllTasks"
        },
        RoleArn=iam_role_arn,
        ClientRequestToken=client_request_token,
        ManifestGenerator={
            "S3JobManifestGenerator": {
                "SourceBucket": f"arn:aws:s3:::{source_bucket}",
                "Filter": {
                    "EligibleForReplication": True
                },
                "EnableManifestOutput": False
            }
        }
    )
    return response

def lambda_handler(event, context):
    source_bucket = os.environ['Source_Bucket'] #'testttt' #event['SourceBucket']
    tag_key = os.environ['Tag_Key'] #'Backup' #event['TagKey'] #os.environ('TAG_KEY')
    tag_value = os.environ['Tag_Value'] #'Monthly' #'montlevent['TagValue']
    days = int(os.environ['Days']) #20
    destination_bucket = os.environ['Destination_Bucket'] #event['DestinationBucket']
    iam_role_arn = os.environ['Role_Arn'] #"arn:aws:iam::xxxx:role/xxxx"

    account_id = boto3.client('sts').get_caller_identity().get('Account')

    client_request_token = str(uuid.uuid4())
    print(client_request_token)

    object_list = list_objects_in_last_days(source_bucket, days)
    print(object_list)
    add_tags_to_object(source_bucket, object_list, tag_key, tag_value)
    # create_replication_rule(source_bucket, destination_bucket, tag_key, tag_value, iam_role_arn)
    response = create_bactch_job(account_id, source_bucket, destination_bucket, client_request_token, iam_role_arn)
    print(response)
    job_id = response['JobId']
    print(job_id)
    print(response)
    
    return {
        'statusCode': 200,
        'body': 'Success'
    }
