# Random string to use as master password
resource "random_password" "master_password" {
  #count = var.create_random_password ? 1 : 0

  length           = var.random_password_length
  min_upper        = 1
  min_lower        = 1
  min_numeric      = 1
  special          = true
  override_special = "_%@"

}


resource "aws_secretsmanager_secret" "password" {
  name = "platform-test-sql-password"
}

resource "aws_secretsmanager_secret_version" "password" {
  secret_id     = aws_secretsmanager_secret.password.id
  secret_string = jsonencode({"password": "${random_password.master_password.result}"})
}

locals {
  db_creds = jsondecode(aws_secretsmanager_secret_version.password.secret_string)
}

module "vpc" {

  source = "terraform-aws-modules/vpc/aws"
  name = "postgressvpc"
  azs   = ["us-east-1a", "us-east-1b", "us-east-1c"]
  create_database_subnet_group  = true
  private_subnets = ["10.0.240.0/20", "10.0.208.0/20", "10.0.144.0/20"]
  database_subnets = ["10.0.0.0/20", "10.0.176.0/20", "10.0.128.0/20"]
  database_subnet_names    = ["post subnet1 name"]
  private_subnet_names = ["Private Subnet One", "Private Subnet Two", "Private Subnet Three"]
  
}

resource "aws_security_group" "postgress_sql" {
  name = "platform-mine-${var.engine}-postgress"
  vpc_id  = module.vpc.vpc_id
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0", module.vpc.vpc_cidr_block]
  }
}




module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier = var.identifier

  engine               = var.engine
  engine_version       = var.engine_version
  family               = var.family
  major_engine_version = var.major_engine_version
  instance_class       = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_encrypted     = var.storage_encrypted
  storage_type          = var.storage_iops != 0 ? "io1" : "gp2"
  iops                  = var.storage_iops

  username = var.username
  password = local.db_creds.password
  port     = var.port

  multi_az                            = var.multi_az
  db_subnet_group_name                = module.vpc.database_subnet_group
  vpc_security_group_ids              = [aws_security_group.postgress_sql.id]
  iam_database_authentication_enabled = var.enable_iam_authentication
  maintenance_window                  = var.maintenance_window
  backup_window                       = var.backup_window
  enabled_cloudwatch_logs_exports     = ["postgresql", "upgrade"]
  manage_master_user_password         = false
  master_user_secret_kms_key_id       = null

  backup_retention_period = var.backup_retention_period
  deletion_protection     = !var.deletion_protection

  performance_insights_enabled          = var.performance_insights_enabled
  performance_insights_retention_period = var.performance_insights_retention_period
  create_monitoring_role                = var.create_monitoring_role
  monitoring_role_name                  = var.monitoring_role_name
  monitoring_role_description           = "Description for monitoring role"
  monitoring_interval                   = 60
  apply_immediately = var.apply_immediately
}
