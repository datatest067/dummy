greenfield_callback_urls                        = ["https://platform-sso.dev.blastpoint.com/api/sso/callback/"]
greenfield_cognito_supported_identity_providers = ["COGNITO", "BlastpointPlatformSSO"]
env = "dev"
cognito_generate_appclient_secret = "true"
greenfield_cognito_user_pool_name = "greenfield"

### ECR variable ###
repo_name = "greenfield_flask"

## rds variable values ##

identifier           = "platform-dev-postgres-main"
engine               = "postgres"
engine_version       = "15"
family               = "postgres15"
major_engine_version = "15"
instance_class       = "db.m5.large"

allocated_storage     = 100
max_allocated_storage = 500
storage_encrypted     = true
storage_iops          = 0

#db_name  = "blastpoint"
username = "postgres"
port     = 5432

multi_az       = true
#vpc_subnet_ids = []
#vpc_security_group_ids = [module.security_group.security_group_id]

maintenance_window              = "Mon:00:00-Mon:03:00"
backup_window                   = "03:00-06:00"
enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

backup_retention_period = 30
deletion_protection     = true

performance_insights_enabled          = true
performance_insights_retention_period = 7
create_monitoring_role                = true
monitoring_interval                   = 60
monitoring_role_description           = "Description for monitoring role"

apply_immediately      = true
snapshot_identifier    = null
create_random_password = true
random_password_length = 16
publicly_accessible    = false

db_users = {
  "blastpoint" = "blastpoint"
}

databases = ["blastpoint-main"]
