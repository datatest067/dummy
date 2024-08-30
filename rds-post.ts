import { Construct } from 'constructs';

import * as aws from '@cdktf/provider-aws';

import * as cdktf from 'cdktf';

import { DceAwsConstruct } from '../core/DceAwsConstruct';



/**

 * DcePostgresServerlessV2Props interface.

 */

export interface DcePostgresServerlessV2Props {

 /** Number of instances. */

 readonly instanceCount: number;



 /** Name of the serverless instance. */

 readonly name: string;



 /** Backup plan rules for the instance. */

 readonly backupPlanRules: aws.backupPlan.BackupPlanRule[];



 /** Cluster parameter group parameters. */

 readonly parameterGroupParameters?: aws.rdsClusterParameterGroup.RdsClusterParameterGroupParameter[];



 /** Minimum capacity of the serverless instance. */

 readonly minCapacity?: number;



 /** Maximum capacity of the serverless instance. */

 readonly maxCapacity?: number;



 /** Array of additional security group IDs. */

 readonly additionalSecurityGroupIds?: Array<string>;



 /** Identifier for the final snapshot. */

 readonly finalSnapshotIdentifier?: string;



 /** Whether to apply changes immediately. */

 readonly applyImmediately?: boolean;



 /** Whether to allow major version upgrades. */

 readonly allowMajorVersionUpgrade?: boolean;



 /** Master username for the instance. */

 readonly masterUsername?: string;



 /** Master username for the instance. */

 readonly masterPassword?: string;



 /** Array of IAM role names to associate with the instance. */

 readonly iamRoles?: Array<string>;



 /** Preferred maintenance window for the instance. */

 readonly preferredMaintenanceWindow?: string;



 /** Preferred backup window for the instance. */

 readonly preferredBackupWindow?: string;



 /** Snapshot identifier for restoring the instance. */

 readonly snapshotIdentifier?: string;



 /** Allocated storage size for the instance in GB. */

 readonly allocatedStorage?: number;



 /** The arn of the role for the backup plan. */

 readonly backupPlanRoleArn: string;



 /** The arn of the role for the monitoring role. */

 readonly monitoringRoleArn: string;



 /** The arn parameter group family. */

 readonly parameterGroupFamily: string;

}



/**

 * `DcePostgresServerlessV2` is a higher-level (L2) construct that simplifies the creation of AWS Lambda functions

 * with associated resources such as log groups, KMS keys, and security groups.

 *

 * The construct extends `DceAwsConstruct` and implements `cdktf.ITerraformDependable`.

 *

 * ![alt text](media://DcePostgresServerlessV2.png).

 *

 * import Tabs from '@theme/Tabs';

 * import TabItem from '@theme/TabItem';

 * import CodeBlock from '@theme/CodeBlock';

 * import JSSource from '!!raw-loader!../../jsii-sample-apps/javascript/src/PostgresServerlessV2Stack.ts';

 *

 * <Tabs>

 * <TabItem value="Typescript">

 *  <CodeBlock language="ts" showLineNumbers>{JSSource}</CodeBlock>

 * </TabItem>

 * </Tabs>

 *

 */

export class DcePostgresServerlessV2 extends DceAwsConstruct implements cdktf.ITerraformDependable {

 /**

  * The AWS security group associated with the Lambda function, configured to allow egress traffic.

  */

 public readonly securityGroup: aws.securityGroup.SecurityGroup;



 /**

  * The AWS KMS key used for encrypting the CloudWatch log group data.

  */

 public readonly kmsKey: aws.kmsKey.KmsKey;



 /**

  * The AWS KMS key alias associated with the KMS key.

  */

 public readonly kmsAlias: aws.kmsAlias.KmsAlias;



 public readonly rdsCluster: aws.rdsCluster.RdsCluster;



 public readonly dbSubnetGroup: aws.dbSubnetGroup.DbSubnetGroup;



 public readonly rdsClusterParameterGroup: aws.rdsClusterParameterGroup.RdsClusterParameterGroup;

 public readonly backupPlan: aws.backupPlan.BackupPlan;

 public readonly bucketSelection: aws.backupSelection.BackupSelection;

 public readonly rdsClusterInstance: aws.rdsClusterInstance.RdsClusterInstance;

 /**

  * Represents a fully qualified name of the bucket resource.

  */

 public readonly fqn: string;



 constructor(scope: Construct, id: string, props: DcePostgresServerlessV2Props) {

  super(scope, id);



  const { accountId } = this.callerIdentity();



  // Update security group to only allow egress traffic

  this.securityGroup = new aws.securityGroup.SecurityGroup(this, 'rds-security-group', {

   name: `${props.name} rds cluster`,

   description: `Allows ingress traffic for rds ${props.name}`,

   vpcId: this.vpcId()

  });



  // Set up the kms key for the cloudwatch logs with a policy

  // that allows the logs princpal to encrypt and decrypt

  this.kmsKey = new aws.kmsKey.KmsKey(this, 'log-group-kms-key', {

   description: 'Used for encrypting cloudwatch logs',

   enableKeyRotation: true,

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



  // Gives the kms key a friendly alias name

  this.kmsAlias = new aws.kmsAlias.KmsAlias(this, 'log-group-kms-alias', {

   targetKeyId: this.kmsKey.keyId,

   name: `alias/${props.name}-kms-key`

  });



  this.dbSubnetGroup = new aws.dbSubnetGroup.DbSubnetGroup(this, 'AuroraPostgresSubnetGroup', {

   subnetIds: this.allPrivateSubnets().ids,

   name: `${props.name}-subnet-group`

  });



  this.rdsClusterParameterGroup = new aws.rdsClusterParameterGroup.RdsClusterParameterGroup(this, 'parameter-group', {

   name: props.name,

   family: props.parameterGroupFamily,

   description: `RDS ${props.name} cluster parameter group`,

   parameter: [

    ...(props.parameterGroupParameters ?? []),

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



  this.rdsCluster = new aws.rdsCluster.RdsCluster(this, 'AuroraPostgresServerlessCluster', {

   clusterIdentifier: props.name,

   engine: 'aurora-postgresql',

   engineMode: 'provisioned',

   databaseName: props.name,

   iamDatabaseAuthenticationEnabled: true,

   storageEncrypted: true,

   dbSubnetGroupName: this.dbSubnetGroup.name,

   kmsKeyId: this.kmsKey.arn,

   enabledCloudwatchLogsExports: ['postgresql'],

   copyTagsToSnapshot: true,

   deletionProtection: true,

   dbClusterParameterGroupName: this.rdsClusterParameterGroup.name,

   finalSnapshotIdentifier: props.finalSnapshotIdentifier,

   applyImmediately: props.applyImmediately,

   allowMajorVersionUpgrade: props.allowMajorVersionUpgrade,

   masterUsername: props.masterUsername,

   masterPassword: props.masterPassword,

   iamRoles: props.iamRoles,

   preferredMaintenanceWindow: props.preferredMaintenanceWindow,

   preferredBackupWindow: props.preferredBackupWindow,

   snapshotIdentifier: props.snapshotIdentifier,

   allocatedStorage: props.allocatedStorage,

   // https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.setting-capacity.html#aurora-serverless-v2.parameter-groups

   serverlessv2ScalingConfiguration: {

    minCapacity: props.minCapacity ?? 2,

    maxCapacity: props.maxCapacity ?? 8

   },

   vpcSecurityGroupIds: [this.securityGroup.id, ...(props.additionalSecurityGroupIds ?? [])]

  });



  const logGroup = new aws.cloudwatchLogGroup.CloudwatchLogGroup(this, 'rdsLogGroup', {

   name: `/aws/rds/cluster/${this.rdsCluster.id}/postgresql`,

   kmsKeyId: this.kmsKey.arn

  });



  this.backupPlan = new aws.backupPlan.BackupPlan(this, 'backup-plan', {

   name: `${props.name}-rds`,

   rule: props.backupPlanRules

  });



  this.bucketSelection = new aws.backupSelection.BackupSelection(this, 'backup-selection', {

   name: `${props.name}-rds`,

   planId: this.backupPlan.id,

   iamRoleArn: props.backupPlanRoleArn,

   resources: [this.rdsCluster.arn]

  });



  this.rdsClusterInstance = new aws.rdsClusterInstance.RdsClusterInstance(this, 'cluster', {

   count: props.instanceCount,

   identifier: props.name,

   clusterIdentifier: props.name,

   instanceClass: 'db.serverless',

   engine: this.rdsCluster.engine,

   engineVersion: this.rdsCluster.engineVersion,

   performanceInsightsEnabled: true,

   performanceInsightsKmsKeyId: this.kmsKey.arn,

   performanceInsightsRetentionPeriod: 7,

   monitoringInterval: 60,

   monitoringRoleArn: props.monitoringRoleArn,

   copyTagsToSnapshot: true,

   applyImmediately: props.applyImmediately,

   preferredBackupWindow: props.preferredBackupWindow,

   preferredMaintenanceWindow: props.preferredMaintenanceWindow

  });



  this.fqn = this.ensureResourcesDeployed(scope, id, [

   this.rdsClusterInstance,

   this.bucketSelection,

   this.backupPlan,

   this.rdsClusterParameterGroup,

   this.dbSubnetGroup,

   this.securityGroup,

   this.kmsAlias,

   this.kmsKey,

   this.rdsCluster,

   logGroup

  ]).fqn;

 }

}

