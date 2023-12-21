service_name                   = "greenfield-main"
env                            = "dev"
vpc_id                         = "vpc-0112db0a42976430a"
task_role_name                 = "greenfield-main"
domain_name                    = "platform-sso.dev.blastpoint.com"
external                       = false
vpc_subnet_ids                 = ["subnet-05387ad016b59b1ce", "subnet-0c62a13f520711400"]
target_group_name              = "greenfield-main"
container_port                 = "80"
ssl_redirect                   = true
redis_name                     = "greenfield-main"
elasticache_instance_type      = "cache.t3.medium"
elasticache_availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
engine_version     = "4.0.10"
container_name                 = "greenfield-main"
image                          = "public.ecr.aws/aws-containers/ecsdemo-frontend:776fd50"
region                         = "us-east-1"
log_stream_name                = "greenfield-main"
elb_name                       = "ccreplcluster"
certificate_sans               = ["123"]
sentry_flask_dsn               = "https://1c52f107816c49848a487501e53a2cc1@o1080417.ingest.sentry.io/6249444"
cluster_name = "arn:aws:ecs:us-east-1:110594377390:cluster/ccreplcluster"
alb_name  = "ccreplcluster"
container_cpu = "512"
container_memory = "2048"
elasticache_address = null
desired_count = 1
https_cidr_blocks = ["0.0.0.0/0"]
sg_name = "myetst"
elasticache_family = "redis4.0"
# environment = [ 
#       {
#       name  = "MAIL_PORT",
#       value = 587
#     },
#  ]




