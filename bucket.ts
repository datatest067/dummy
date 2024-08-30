import * as aws from '@cdktf/provider-aws';

import * as cdktf from 'cdktf';

import { DceAwsStack, DceBucketv17 } from '@dce/cdk';

import { Construct } from 'constructs';



export default class S3BucketsStack extends DceAwsStack {

 constructor(scope: Construct) {

  super(scope);



  const { accountId } = this.callerIdentity();

  const account = this.accountDetails();

  new aws.provider.AwsProvider(this, 'aws');



  const authKmsKey = new aws.dataAwsKmsKey.DataAwsKmsKey(this, 'clmdAuth', {

   keyId: `arn:aws:kms:${this.region()}:${accountId}:alias/${account.organization}-${account.appId}-authorizations-kms-s3`

  });

  const pricingKmsKey = new aws.dataAwsKmsKey.DataAwsKmsKey(this, 'clmdPricing', {

   keyId: `arn:aws:kms:${this.region()}:${accountId}:alias/${account.organization}-${account.appId}-pricing-s3-cmk`

  });

  const coreArtiLogKmsKey = new aws.dataAwsKmsKey.DataAwsKmsKey(this, 'clmdCoreArtifactAndLog', {

   keyId: `arn:aws:kms:${this.region()}:${accountId}:alias/${account.organization}-${account.appId}-core-${account.environment}-cmk-s3`

  });

  const splunkKmsKey = new aws.dataAwsKmsKey.DataAwsKmsKey(this, 'clmdSplunk', {

   keyId: `arn:aws:kms:${this.region()}:${accountId}:alias/${account.organization}-${account.appId}-core-${account.environment}-splunk-cmk-s3`

  });

  const claimsKmsKey = new aws.dataAwsKmsKey.DataAwsKmsKey(this, 'clmdClaims', {

   keyId: `arn:aws:kms:${this.region()}:${accountId}:alias/${account.organization}-${account.appId}-claims-edits-${account.environment}-kms-s3`

  });

  const paymentsKmsKey = new aws.dataAwsKmsKey.DataAwsKmsKey(this, 'clmdPayments', {

   keyId: `arn:aws:kms:${this.region()}:${accountId}:alias/${account.organization}-${account.appId}-payments-${account.environment}-kms-s3`

  });



  new cdktf.HttpBackend(this, {

   address: `${process.env.CI_API_V4_URL}/projects/${process.env.CI_PROJECT_ID}/terraform/state/${this.id}-${process.env.ACCOUNT_NAME}-${process.env.AWS_REGION}`,

   username: process.env.GITLAB_USERNAME,

   password: process.env.CI_JOB_TOKEN

  });



  new DceBucketv17(this, 's3-clmd-0', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-authorizations-${account.environment}-rules-code-ue1`,

   encryptionKey: authKmsKey.id,

   versioned: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-authorizations-logs/`,

   createExampleIamPolicies: true

  });



  new DceBucketv17(this, 's3-clmd-1', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-code-artifact`,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.appId}`,

   encryptionKey: coreArtiLogKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-2', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   enableLogDelivery: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.appId}`,

   encryptionKey: coreArtiLogKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-3', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-pricing-trp-${account.environment}-source-data`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-pricing-prov/`,

   encryptionKey: pricingKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-4', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-pricing-trp-${account.environment}-scripts`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-pricing-prov/`,

   encryptionKey: pricingKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-5', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-pricing-trp-${account.environment}-landing-page`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-pricing-prov/`,

   encryptionKey: pricingKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-6', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-pricing-trp-${account.environment}-disputes-intake`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-pricing-prov/`,

   encryptionKey: pricingKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-7', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-splunk-bucket`,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.appId}`,

   encryptionKey: splunkKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-8', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-claims-edits-referrals-${account.environment}-config`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-claims-edits-referrals-config/`,

   encryptionKey: claimsKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-9', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-claims-edits-${account.environment}-rules-intake-ue1`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-claims-edits-logs/`,

   encryptionKey: claimsKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-10', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-pricing-${account.environment}-ca-providers-ue1`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-pricing-prov/`,

   encryptionKey: pricingKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-11', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-pricing-qpa-${account.environment}-scripts`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-pricing-prov/`,

   encryptionKey: pricingKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-12', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-pricing-gpa-${account.environment}-landing-zone`,

   createExampleIamPolicies: true,

   encryptionKey: pricingKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-13', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-pricing-qpa-${account.environment}-landing-zone`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-pricing-prov/`,

   encryptionKey: pricingKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-14', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-payments-${account.environment}-sftp-service-bucket`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-payments-sftp/`,

   encryptionKey: paymentsKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-15', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-claims-edits-${account.environment}-rules-code-ue1`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-claims-edits-logs/`,

   encryptionKey: claimsKmsKey.id,

   versioned: true

  });



  new DceBucketv17(this, 's3-clmd-16', {

   lifecycle: {

    ignoreChanges: ['name']

   },

   bucketName: `${account.organization}-${account.appId}-pricing-gpa-${account.environment}-scripts`,

   createExampleIamPolicies: true,

   serverAccessLogsBucket: `${account.organization}-${account.appId}-core-${account.appId}-${account.environment}-access-log`,

   serverAccessLogsPrefix: `${account.organization}-${account.appId}-pricing-prov/`,

   encryptionKey: pricingKmsKey.id,

   versioned: true

  });

 }

}

