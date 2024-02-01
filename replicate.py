import uuid
import json
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta

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

def create_replication_rule(source_bucket, destination_bucket, tag_key, tag_value, iam_role_arn):
    s3.put_bucket_replication(
        Bucket=source_bucket,
        ReplicationConfiguration={
            "Role": iam_role_arn,
            "Rules": [
                {
                    "ID": "test-batch-replication1",
                    "Priority": 0,
                    "Filter": {
                        "Tag": {
                            "Key": tag_key,
                            "Value": tag_value
                        }
                    },
                    "Status": "Enabled",
                    "Destination": {
                        "Bucket": f"arn:aws:s3:::{destination_bucket}"
                    },
                    "DeleteMarkerReplication": {
                        "Status": "Disabled"
                    }
                }
            ]
        }
    )

def create_bactch_job(account_id, source_bucket, destination_bucket, client_request_token, iam_role_arn):
    response = s3control.create_job(
        AccountId=account_id,
        ConfirmationRequired=True,
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
    source_bucket = 'sourcebucket' #event['SourceBucket']
    tag_key = 'replicate' #event['TagKey']
    tag_value = 'true' #event['TagValue']
    destination_bucket = 'destbuck' #event['DestinationBucket']
    iam_role_arn = "arn:aws:iam::xxxxx:role/batch_service_role"

    account_id = boto3.client('sts').get_caller_identity().get('Account')

    client_request_token = str(uuid.uuid4())
    print(client_request_token)

    object_list = list_objects_in_last_15_days(source_bucket)
    print(object_list)
    add_tags_to_object(source_bucket, object_list, tag_key, tag_value)
    create_replication_rule(source_bucket, destination_bucket, tag_key, tag_value, iam_role_arn)
    response = create_bactch_job(account_id, source_bucket, destination_bucket, client_request_token, iam_role_arn)
    print(response)
    job_id = response['JobId']
    print(job_id)
    # response = s3control.update_job_status(
    #     AccountId=account_id,
    #     JobId=job_id,
    #     RequestedJobStatus='Ready'
    # )
    print(response)
    
    return {
        'statusCode': 200,
        'body': 'Success'
    }
