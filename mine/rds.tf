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
  name = "platform-${var.env}-sql-password"
}

resource "aws_secretsmanager_secret_version" "password" {
  secret_id     = aws_secretsmanager_secret.password.id
  secret_string = random_password.master_password.result
}
provider "postgresql" {
  host            = module.db.db_instance_address
  port            = 5432
  database        = "postgres"
  username        = "postgres"
  password        = aws_secretsmanager_secret_version.password.secret_string
  sslmode         = "require"
  connect_timeout = 15
  max_connections = 1 # avoids a race condition, see https://github.com/cyrilgdn/terraform-provider-postgresql/pull/169
  superuser = false
}

resource "postgresql_role" "users" {
  for_each = var.db_users
  name     = each.key
  login    = true
}

resource "postgresql_grant_role" "iam" {
  count      = var.enable_iam_authentication ? length(var.db_users) : 0
  role       = keys(var.db_users)[count.index]
  grant_role = "rds_iam"
  depends_on = [
    postgresql_role.users,
    postgresql_database.databases,
    postgresql_grant.database-grants
  ]
}

resource "postgresql_database" "databases" {
  for_each = toset(var.databases)
  name     = each.key
  owner    = each.value

  depends_on = [postgresql_role.users]
}

resource "postgresql_grant" "database-grants" {
    for_each = { for item in flatten([
    for user, privelege_map in var.db_users : [
      for db, privileges in privelege_map : {
        "${user}-${db}" = {
          user = user
          db = db
          privileges = privileges
        }
      }
    ]
    ]) :
    keys(item)[0] => values(item)[0]
  }

  database    = each.value.db
  role        = each.value.user
  object_type = "database"
  privileges  = each.value.privileges

  depends_on    = [postgresql_role.users, postgresql_database.databases]
}

resource "aws_security_group" "postgress_sql" {
  name = "platform-${var.env}-${var.engine}-postgress"
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
    cidr_blocks = ["10.100.0.0/16"]
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
  password = aws_secretsmanager_secret_version.password.secret_string
  port     = var.port

  multi_az                            = var.multi_az
  subnet_ids                          = module.vpc.private_subnets
  vpc_security_group_ids              = [aws_security_group.postgress_sql.id]
  iam_database_authentication_enabled = var.enable_iam_authentication
  maintenance_window                  = var.maintenance_window
  backup_window                       = var.backup_window
  enabled_cloudwatch_logs_exports     = ["postgresql", "upgrade"]

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
