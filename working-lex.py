import boto3
import subprocess
import json
import os
import time

role_arn = os.environ['Role_Arn']
bot_name = os.environ['Bot_Name']
aws_lex_bot_id   = os.environ['Bot_Id']

def lambda_handler(event, context):
    # Get S3 bucket and object details from the event
    s3_bucket = event['Records'][0]['s3']['bucket']['name']
    s3_object_key = event['Records'][0]['s3']['object']['key']
    # Initialize LexModelsV2 client
    lex_client = boto3.client('lexv2-models')
    s3 = boto3.resource('s3')
    try:
        response1 = lex_client.create_upload_url()
        # print (event)
        # print(response1['importId'])
        # print(response1['uploadUrl'])
        s3.Bucket(s3_bucket).download_file(s3_object_key, '/tmp/test.zip')
        CurlUrl=f'curl -X PUT -T "/tmp/test.zip" \"{response1["uploadUrl"]}\"'
        # print(lex_client.describe_import(importId=response1['importId']))
        # print (CurlUrl)
        # print(subprocess.getstatusoutput(CurlUrl))
        status, output = subprocess.getstatusoutput(CurlUrl)
        # Start the import
        response = lex_client.start_import(
            importId=response1['importId'],
            resourceSpecification={
                'botImportSpecification': {
                    'botName': bot_name,
                    'roleArn': role_arn,
                    'dataPrivacy': {
                    'childDirected': False
                    }
                }
            },
            mergeStrategy='Overwrite'
        )
        #print(response)
        import_status = lex_client.describe_import(importId=response1['importId'])['importStatus']
        while import_status == 'InProgress':
            time.sleep(2)
            import_status = lex_client.describe_import(importId=response1['importId'])['importStatus']
            print("Import Status", import_status)

        if import_status in ['Failed', 'Deleting']:
            raise AssertionError(f'Import Status {import_status}')

        print("Bot Locale en_US created!")
        print("Beginning initial build of bot")
        response = lex_client.build_bot_locale(
            botId=aws_lex_bot_id,
            botVersion="DRAFT",
            localeId="en_US"
        )
        return {
            'statusCode' : 200,
            'body': 'Lex import started'
        }
    except Exception as e:
        print(f"Error starting import: {e}")
        return {
            'statusCode' : 500,
            'body': 'Error starting Lex import'
        }
