/* eslint-disable no-unused-vars */



import * as aws from '@cdktf/provider-aws';

import * as cdktf from 'cdktf';

import { Construct } from 'constructs';

import { DceAwsConstruct } from '../core';



/**

 * Defines the properties for DceBucketv17.

 */

export interface DceBucketProps extends cdktf.TerraformMetaArguments {

 /**

  * Bucket name must be between 3 to 63 characters, contain only alphanumeric characters, No UPPER case, no underscores.

  */

 readonly bucketName: string;

 /**

  * Default Object Ownership

  * Sets the default object owner for cross-account access (e.g. AWS log delivery).

  * @default ObjectOwnership.BUCKET_OWNER_PREFERRED

  */

 readonly objectOwnership?: ObjectOwnership;

 /**

  * Input a pre-generated or otherwise known KMS key value (only) here. Example: 8237a026-7988-4d1a-ayd3-e7c2caf28e09 If you do not specify a key one will be genenrated for you automactically.

  * @default - `Kms` if `encryptionKey` is specified, or `Unencrypted` otherwise.

  */

 readonly encryptionKey?: string;

 /**

  * Whether this bucket should have versioning turned on or not.

  * @default true

  */

 readonly versioned?: boolean;

 /**

  * Server Access Log Bucket Name

  * Name of the S3 logging bucket where server access logs will be placed.

  * @default - If 'serverAccessLogsBucket' undefined - access logs will be disabled.

  */

 readonly serverAccessLogsBucket?: string;

 /**

  * Enable Bucket for Log Delivery

  * Allow AWS log delivery service write access to bucket. Only enable if this bucket will only be used for AWS log delivery services.

  * @default false

  */

 readonly enableLogDelivery?: boolean;

 /**

  * Optional log file prefix to use for the bucket's access logs.

  * @default - No log file prefix

  */

 readonly serverAccessLogsPrefix?: string;



 /**

  * Create example IAM policies for the S3 bucket

  * Create example IAM policies (RW and RO) granting bucket access.

  * @default false

  */

 readonly createExampleIamPolicies?: boolean;



 /**

  * S3 Inventory and Analytics Source S3 Bucket

  * Source S3 bucket name to allow inventory and analytics file delivery to this bucket.

  * @default - No inventory

  */

 readonly sourceS3Bucket?: string;



 /**

  * Set this to true if configuring a custom bucket policy via AWS Configuration.

  * If enabled, this will prevent using the bucket until the custom bucket policy is applied.

  */

 readonly autoCreatePolicy?: boolean;

 /**

  * Tags to apply to the S3 bucket.

  */

 readonly tags?: { [key: string]: string };

}



export enum ObjectOwnership {

 /**

  * Objects uploaded to the bucket change ownership to the bucket owner .

  */

 BUCKET_OWNER_PREFERRED = 'BucketOwnerPreferred',

 /**

  * The uploading account will own the object.

  */

 OBJECT_WRITER = 'ObjectWriter'

}



/**

 * Creates an S3 bucket using service catalog version 1.7

 *

 * ![alt text](media://DceBucketv17.png).

 * 

 * import Tabs from '@theme/Tabs';

 * import TabItem from '@theme/TabItem';

 * import CodeBlock from '@theme/CodeBlock';

 * import JSSource from '!!raw-loader!../../jsii-sample-apps/javascript/src/DceBucketv17Stack.ts';

 * import TerraformSource from '!!raw-loader!../../jsii-sample-apps/terraform/dceBucketv17/main.tf';

 * 

 * <Tabs>

 * <TabItem value="Terraform">

 *   <CodeBlock language="hcl" showLineNumbers>{TerraformSource}</CodeBlock>

 *  </TabItem>

 * <TabItem value="Typescript">

 *  <CodeBlock language="ts" showLineNumbers>{JSSource}</CodeBlock>

 * </TabItem>

 * </Tabs>

 */

export class DceBucketv17 extends DceAwsConstruct implements cdktf.ITerraformDependable {

 /**

  * Represents a fully qualified name of the bucket resource.

  */

 readonly fqn: string;

 /**

  * Bucket name must be between 3 to 63 characters, contain only alphanumeric characters, No UPPER case, no underscores.

  */

 /**

  * Bucket name must be between 3 to 63 characters, contain only alphanumeric characters, No UPPER case, no underscores.

  */

 readonly bucketName: string;

 /**

  * Default Object Ownership

  * Sets the default object owner for cross-account access (e.g. AWS log delivery).

  * @default ObjectOwnership.BUCKET_OWNER_PREFERRED

  */

 readonly objectOwnership?: ObjectOwnership;

 /**

  * Input a pre-generated or otherwise known KMS key value (only) here. Example: 8237a026-7988-4d1a-ayd3-e7c2caf28e09 If you do not specify a key one will be genenrated for you automactically.

  * @default - `Kms` if `encryptionKey` is specified, or `Unencrypted` otherwise.

  */

 readonly encryptionKey?: string;

 /**

  * Whether this bucket should have versioning turned on or not.

  * @default true

  */

 readonly versioned?: boolean;

 /**

  * Server Access Log Bucket Name

  * Name of the S3 logging bucket where server access logs will be placed.

  * @default - If 'serverAccessLogsBucket' undefined - access logs will be disabled.

  */

 readonly serverAccessLogsBucket?: string;

 /**

  * Enable Bucket for Log Delivery

  * Allow AWS log delivery service write access to bucket. Only enable if this bucket will only be used for AWS log delivery services.

  * @default false

  */

 readonly enableLogDelivery?: boolean;

 /**

  * Optional log file prefix to use for the bucket's access logs.

  * @default - No log file prefix

  */

 readonly serverAccessLogsPrefix?: string;



 /**

  * Create example IAM policies for the S3 bucket

  * Create example IAM policies (RW and RO) granting bucket access.

  * @default false

  */

 readonly createExampleIamPolicies?: boolean;



 /**

  * S3 Inventory and Analytics Source S3 Bucket

  * Source S3 bucket name to allow inventory and analytics file delivery to this bucket.

  * @default - No inventory

  */

 readonly sourceS3Bucket?: string;



 /**

  * Set this to true if configuring a custom bucket policy via AWS Configuration.

  * If enabled, this will prevent using the bucket until the custom bucket policy is applied.

  */

 readonly autoCreatePolicy?: boolean;

 /**

  * Tags to apply to the S3 bucket.

  */

 readonly tags?: { [key: string]: string };

 /**

  * The provisioned product used to create the s3 bucket.

  */

 readonly provisionedProduct: aws.servicecatalogProvisionedProduct.ServicecatalogProvisionedProduct;



 constructor(scope: Construct, id: string, props: DceBucketProps) {

  super(scope, id);



  const metaArguments: cdktf.TerraformMetaArguments = props;



  this.provisionedProduct = new aws.servicecatalogProvisionedProduct.ServicecatalogProvisionedProduct(this, 'bucket', {

   lifecycle: {

    ignoreChanges: ['name', 'tags']

   },

   ...metaArguments,

   name: props.bucketName,

   productName: 'Amazon S3 Private Bucket with Restricted Access',

   provisioningArtifactName: 'v1.7',

   provisioningParameters: [

    { key: 'BucketName', value: props.bucketName },

    { key: 'DefaultObjectOwnership', value: props.objectOwnership ?? ObjectOwnership.BUCKET_OWNER_PREFERRED },

    { key: 'UserCMKKey', value: props.encryptionKey },

    { key: 'VersionConfig', value: 'versioned' in props ? this.convertBoolToEnabledSuspended(props.versioned) : 'Enabled' },

    { key: 'LogDelivery', value: props.enableLogDelivery?.toString() ?? 'false' },

    { key: 'LogBucketName', value: props.serverAccessLogsBucket ?? '' },

    { key: 'LoggingPrefix', value: props.serverAccessLogsPrefix ?? '' },

    { key: 'CreateIAMPolicies', value: props.createExampleIamPolicies?.toString() ?? 'false' },

    { key: 'SourceS3Bucket', value: props.sourceS3Bucket ?? 's3-inventory-and-analytics-not-enabled' },

    { key: 'CustomBucketPolicy', value: props.autoCreatePolicy?.toString() ?? false.toString() }

   ]

  });

  this.fqn = this.provisionedProduct.fqn;

  this.bucketName = props.bucketName;

  this.objectOwnership = props.objectOwnership;

  this.encryptionKey = props.encryptionKey;

  this.versioned = props.versioned;

  this.enableLogDelivery = props.enableLogDelivery;

  this.serverAccessLogsBucket = props.serverAccessLogsBucket;

  this.serverAccessLogsPrefix = props.serverAccessLogsPrefix;

  this.createExampleIamPolicies = props.createExampleIamPolicies;

  this.sourceS3Bucket = props.sourceS3Bucket;

  this.autoCreatePolicy = props.autoCreatePolicy;

 }



 bucketDomainName() {

  return `${this.bucketName}.s3.amazonaws.com`;

 }



 regionalBucketDomainName() {

  const awsProvider = this.provisionedProduct.provider as aws.provider.AwsProvider;

  const region = awsProvider?.region ?? this.region();



  return `${this.bucketName}.s3.${region}.amazonaws.com`;

 }



 private convertBoolToEnabledSuspended(versioned: boolean | undefined) {

  return versioned ? 'Enabled' : 'Suspended';

 }

}

