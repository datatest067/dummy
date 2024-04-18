import uuid
import json
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
import time
import os



s3 = boto3.client('s3')
s3control = boto3.client('s3control')

def create_batch_job(account_id, source_bucket, destination_bucket, client_request_token, iam_role_arn):
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

def get_replication_rule(bucket_name):
    response = s3.get_bucket_replication(
        Bucket=bucket_name,
    )
   
    return response["ReplicationConfiguration"]["Role"], response["ReplicationConfiguration"]["Rules"]

def toggle_status_for_replication_rules(bucket_name, iam_role, rules, rule_id_to_disable=list()):
    for rule in rules:
        if rule['ID'] in rule_id_to_disable:
            rule['Status']='Disabled'
        else:
            rule['Status']='Enabled'
           
    s3.put_bucket_replication(
        Bucket=bucket_name,
        ReplicationConfiguration={
            'Role': iam_role,
            'Rules': rules
            }
        )

def wait_for_job_to_activate(account_id, job_id):
    job_status = None
    while job_status != 'Active':
        response = s3control.describe_job(
        AccountId=account_id,
        JobId=job_id
        )
        job_status = response['Job']['Status']
        print(f'JobStatus is {job_status} for JobId {job_id}')
        time.sleep(10)


def lambda_handler(event, context):

    source_bucket = os.environ['Source_Bucket'] #'testttt' #event['SourceBucket']
    iam_role_arn = os.environ['Role_Arn'] #"arn:aws:iam::xxxx:role/xxxx"
    rule_id_to_disable = [os.environ['Rule_Id']]
    destination_bucket = os.environ['Destination_Bucket']
    account_id = boto3.client('sts').get_caller_identity().get('Account')

    iam_role_arn, rules = get_replication_rule(source_bucket)

    # If we send empty list, it will enable all the rules
    toggle_status_for_replication_rules(source_bucket, iam_role_arn, rules, rule_id_to_disable=rule_id_to_disable)
    client_request_token = str(uuid.uuid4())
    print(client_request_token)
    response = create_batch_job(account_id, source_bucket, destination_bucket, client_request_token, iam_role_arn)
    print(response)
    job_id = response['JobId']
    print("my job id:", job_id)

    return {
        'statusCode': 200,
        'body': 'Success'
    }
