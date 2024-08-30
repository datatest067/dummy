import * as aws from '@cdktf/provider-aws';

import * as cdktf from 'cdktf';

import { DceAwsStack, DcePostgresServerlessV2 } from '@dce/cdk';

import { Construct } from 'constructs';


export default class AuroraDBInstancesStack extends DceAwsStack {

 constructor(scope: Construct) {

  super(scope);
  

  const { accountId } = this.callerIdentity();

  const account = this.accountDetails();

  new aws.provider.AwsProvider(this, 'aws');
  
  new cdktf.HttpBackend(this, {

   address: `${process.env.CI_API_V4_URL}/projects/${process.env.CI_PROJECT_ID}/terraform/state/${this.id}-${process.env.ACCOUNT_NAME}-${process.env.AWS_REGION}`,

   username: process.env.GITLAB_USERNAME,

   password: process.env.CI_JOB_TOKEN

  });
  
   // Security Group
   
  new DcePostgresServerlessV2(this, 'RDSSecurityGroup', {

   name: `${account.organization}-${account.appId}-authorizations-${account.environment}-aurora-cluster-security-group`,

   description: `Allows ingress traffic for rds`,

   vpcId: this.vpcId()

  });
  
  new DcePostgresServerlessV2(this, 'AuroraKMSCMK', {
      
    enabled: true,
    enableKeyRotation: true,
    description: `Used for encrypting cloudwatch logs`,
    policy: JSON.stringify({

    Version: '2012-10-17',

    Statement: [

     {

      Sid: 'Enable IAM User Permissions',

      Effect: 'Allow',

      Principal: {

       AWS: `arn:aws:iam::${accountId}:root`

      },

      Action: 'kms:*',

      Resource: '*'

     },

     {

      Effect: 'Allow',

      Principal: {

       Service: `rds.amazonaws.com`

      },

      Action: ['kms:Encrypt*', 'kms:Decrypt*', 'kms:ReEncrypt*', 'kms:GenerateDataKey*', 'kms:Describe*'],

      Resource: '*'

     },

     {

      Effect: 'Allow',

      Principal: {

       Service: `logs.${this.region()}.amazonaws.com`

      },

      Action: ['kms:Encrypt*', 'kms:Decrypt*', 'kms:ReEncrypt*', 'kms:GenerateDataKey*', 'kms:Describe*'],

      Resource: '*'

     }

    ]

   })

  });
  
  new DcePostgresServerlessV2(this, 'AuroraKMSCMKAlias', {
    
   targetKeyId: this.AuroraKMSCMK,

   name: `alias/${this.props.name}-kms-key`

  });
  
  new DcePostgresServerlessV2(this, 'DBSubnetGroup', {
  
   subnetIds: this.allPrivateSubnets().ids,

   name: `postgresql-subnet-group`
  
  });
  
   // Database Cluster Parameter Group
  
  new DcePostgresServerlessV2(this, 'DBClusterParameterGroup', {
  
   name: DcePostgresServerlessV2.name,

   family: DcePostgresServerlessV2.parameterGroupFamily,

   description: `RDS ${DcePostgresServerlessV2.name} cluster parameter group`,
   
   parameter: [

    {

     name: 'log_statement',

     value: 'all'

    },

    {

     name: 'log_min_duration_statement',

     value: '1'

    }

   ]

  });
     
    

  
  
  


