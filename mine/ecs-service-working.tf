
locals {
  tags = {
    Name        = var.service_name
    Environment = var.env
  }
}

resource "aws_security_group" "ecs_service" {
  name = "platform-${var.env}-${var.service_name}-ecs"
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
      cidr_blocks = ["172.31.0.0/16"]

    }
  }


# IAM Role for executing tasks
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.env}-ecs-task-${var.task_role_name}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
  {
    "Action": "sts:AssumeRole",
    "Principal": {
      "Service": [
        "ecs-tasks.amazonaws.com",
        "ecs.amazonaws.com"
     ]
     },
     "Effect": "Allow",
     "Sid": ""
   }
 ]
}
EOF
}


resource "aws_iam_role_policy_attachment" "ecs-task-execution-role-policy-attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}


resource "aws_cloudwatch_log_group" "cloudwatch_log_group" {
  name = "/ecs/${var.service_name}"
}

# resource "aws_route53_zone" "dev" {
#   name = var.domain_name

#   tags = local.tags
# }

# resource "aws_route53_record" "platformsso" {
#   zone_id = aws_route53_zone.dev.zone_id
#   name    = var.domain_name
#   type    = "A"
#   ttl     = 300
#   records = [module.alb.lb_dns_name]
# }


# resource "aws_acm_certificate" "cert" {
#   domain_name               = var.domain_name
#   subject_alternative_names = var.certificate_sans
#   validation_method         = "DNS"

#   lifecycle {
#     create_before_destroy = true
#   }
# }

# resource "aws_route53_record" "route53_record" {

#   for_each = {
#     for sub_name in aws_acm_certificate.cert.domain_validation_options : sub_name.domain_name => {
#       name   = sub_name.resource_record_name
#       record = sub_name.resource_record_value
#       type   = sub_name.resource_record_type

#     }
#   }
#   allow_overwrite = true
#   name            = each.value.name
#   records         = [each.value.record]
#   ttl             = 60
#   type            = each.value.type
#   zone_id         = aws_route53_zone.dev.zone_id
# }


# resource "aws_acm_certificate_validation" "check_validation" {
#     certificate_arn = aws_acm_certificate.cert.arn
#     validation_record_fqdns = aws_acm_certificate.cert.domain_validation_options[*].resource_record_name
# }

module "vpc" {

  source = "terraform-aws-modules/vpc/aws"
  name = "postgressvpc"
  azs   = ["us-east-1a", "us-east-1b", "us-east-1c"]
  create_database_subnet_group  = true
  private_subnets = ["10.0.240.0/20", "10.0.208.0/20", "10.0.144.0/20"]
  public_subnets = ["10.0.0.0/20", "10.0.176.0/20", "10.0.128.0/20"]
  # database_subnet_names    = ["post subnet1 name"]
  # private_subnet_names = ["Private Subnet One", "Private Subnet Two", "Private Subnet Three"]
  
}

module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 8.0"

  name = "platform-${var.env}-${var.alb_name}"

  vpc_id             = module.vpc.vpc_id
  load_balancer_type = "application"
  internal           = false
  subnets            = module.vpc.public_subnets
  security_groups    = [aws_security_group.ecs_service.id]
  target_groups = [
    {
      name                              = "platform-${var.env}-${var.target_group_name}"
      backend_protocol                  = "HTTP"
      backend_port                      = var.container_port
      target_type                       = "ip"
      load_balancing_cross_zone_enabled = true
      health_check = {
        enabled             = true
        protocol            = "HTTP"
        path                = "/api/healthcheck"
        port                = "traffic-port"
        healthy_threshold   = 5
        unhealthy_threshold = 2
        timeout             = 5
        interval            = 60
        matcher             = "200"
      }
      
    }
  ]

  # http_tcp_listeners = [
  #   {
  #     port        = 80
  #     protocol    = "HTTP"
  #     action_type = var.ssl_redirect ? "redirect" : "forward"
  #     redirect = var.ssl_redirect ? {
  #       port        = "443"
  #       protocol    = "HTTPS"
  #       status_code = "HTTP_301"
  #     } : {}
  #   }
  # ]
  http_tcp_listeners = [
    {
      port        = 81
      protocol    = "HTTP"
      action_type = "forward"
      target_group_index = 0
    }
  ]

  # https_listeners = (var.ssl_redirect && var.domain_name != null) ? [
  #   {
  #     port               = 443
  #     protocol           = "HTTPS"
  #     action_type        = "forward"
  #     certificate_arn    = var.external ? module.acm_request_certificate[0].arn : aws_acm_certificate.cert[0].arn
  #     target_group_index = 0
  #     ssl_policy         = "ELBSecurityPolicy-TLS-1-2-Ext-2018-06"
  #   },
  # ] : []

}

#   https_listeners = (var.ssl_redirect && var.domain_name != null) ? [
#     {
#       port               = 443
#       protocol           = "HTTPS"
#       action_type        = "forward"
#       certificate_arn    = aws_acm_certificate.cert[0].arn
#       target_group_index = 0
#       ssl_policy         = "ELBSecurityPolicy-TLS-1-2-Ext-2018-06"
#     },
#   ] : []

# }


# module "redis" {
#   source                           = "cloudposse/elasticache-redis/aws"
#   version                          = "0.52.0"
#   name                             = "platform-${var.env}-${var.redis_name}"
#   environment                      = var.env
#   availability_zones               = var.elasticache_availability_zones
#   vpc_id                           = module.vpc.vpc_id
#   security_group_name              = ["platform-${var.env}-${var.sg_name}-https"]
#   allowed_security_group_ids       = [aws_security_group.ecs_service.id]
#   subnets                          = module.vpc.private_subnets
#   cluster_size                     = 1
#   instance_type                    = var.elasticache_instance_type
#   engine_version                   = var.engine_version
#   family                           = var.elasticache_family
#   at_rest_encryption_enabled       = var.elasticache_at_rest_encryption_enabled
#   transit_encryption_enabled       = var.elasticache_transit_encryption_enabled
#   cloudwatch_metric_alarms_enabled = true
#   automatic_failover_enabled       = false
#   apply_immediately                = true
#   parameter = [
#     {
#       name  = "notify-keyspace-events"
#       value = "lK"
#     }
#   ]
# }
# data "aws_secretsmanager_secret" "client_id" {
#   name = "platform-${var.env}-client-id"
# }

# data "aws_secretsmanager_secret_version" "client_id" {
#   secret_id = data.aws_secretsmanager_secret.client_id.id
# }

# data "aws_secretsmanager_secret" "client_secret" {
#   name = "platform-${var.env}-client-secret"
# }

# data "aws_secretsmanager_secret_version" "client_secret" {
#   secret_id = data.aws_secretsmanager_secret.client_secret.id
# }

# data "aws_cognito_user_pool" "cognito_user_greenfield_pool" {
#   name = "${var.env}-${var.greenfield_cognito_user_pool_name}-pool"
# }

# data "aws_secretsmanager_secret" "mail_password" {
#   name = "platform-${var.env}-mail-password"
# }

# data "aws_secretsmanager_secret_version" "mail_password" {
#   secret_id = data.aws_secretsmanager_secret.mail_password.id
# }

# data "aws_secretsmanager_secret" "secret_key" {
#   name = "platform-${var.env}-secret-key"
# }

# data "aws_secretsmanager_secret_version" "secret_key" {
#   secret_id = data.aws_secretsmanager_secret.secret_key.id
# }

# data "aws_secretsmanager_secret" "mail_username" {
#   name = "platform-${var.env}-mail-username"
# }

# data "aws_secretsmanager_secret_version" "mail_username" {
#   secret_id = data.aws_secretsmanager_secret.mail_username.id
# }
data "aws_secretsmanager_secret" "database_uri" {
  name = "kumarappan"
}

data "aws_secretsmanager_secret_version" "database_uri" {
  secret_id = data.aws_secretsmanager_secret.database_uri.id
}


module "ecs_service" {
  source                         = "terraform-aws-modules/ecs/aws//modules/service"
  name                           = "platform-${var.env}-${var.service_name}"
  container_definitions          = {
    (var.container_name) = {
      image  = "public.ecr.aws/aws-containers/ecsdemo-frontend:776fd50"
      cpu    = var.container_cpu
      memory = var.container_memory
      port_mappings = [
        {
          hostPort = var.container_port
          protocol = "tcp",
          containerPort = var.container_port
          name     = "service"
        }
      ]
      log_configuration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" : aws_cloudwatch_log_group.cloudwatch_log_group.name,
          "awslogs-region" : var.region, # FIXME
          "awslogs-stream-prefix" : "platform-${var.env}-${var.log_stream_name}"
        }
      }
      environment = [
        # {
        #   name  = "DOMAIN_NAME",
        #   value = var.domain_name
        # },
        {
          name  = "CACHE_TYPE",
          value = "RedisCache"
        },
        # {
        #   name  = "CACHE_REDIS_HOST",
        #   value = var.elasticache_address == null ? module.redis.endpoint : var.elasticache_address
        # },
        # {
        #   name  = "COGNITO_DOMAIN",
        #   value = data.aws_cognito_user_pool.cognito_user_greenfield_pool.id
        # },
        # {
        #   name  = "COGNITO_USER_POOL_ID",
        #   value = data.aws_cognito_user_pool.cognito_user_greenfield_pool.domain
        # },
        {
          name  = "REGION",
          value = var.region
        },
        # {
        #   name  = "MAIL_PASSWORD",
        #   value = data.aws_secretsmanager_secret_version.mail_password.secret_string
        # },
        {
          name  = "MAIL_PORT",
          value = "587"
        },
        {
          name  = "MAIL_SERVER",
          value = "email-smtp.us-east-1.amazonaws.com"
        },
        {
          name  = "MAIL_USE_TLS",
          value = "True"
        },
        # {
        #   name  = "MAIL_USERNAME",
        #   value = data.aws_secretsmanager_secret_version.mail_username.secret_string
        # },
        {
          name  = "MAPS_ENABLED",
          value = "1"
        },
        {
          name  = "MAX_DATA_SIZE",
          value = "10000000"
        },
        #     {
        #   name  = "SECRET_KEY",
        #   value = data.aws_secretsmanager_secret_version.secret_key.secret_string
        # },
        {
          name  = "SEGMENT_ATTRIBUTES_VIEW_ENABLED",
          value = "1"
        },
        {
          name  = "SENTRY_FLASK_DSN",
          value = var.sentry_flask_dsn
        },
            {
          name  = "SUBSCRIPTION_SEND_HOUR",
          value = "0"
        },
            {
          name  = "SUBSCRIPTIONS_ENABLED",
          value = "1"
        },
      {
          name  = "AUDIENCE_ATTRIBUTES_VIEW_ENABLED",
          value = "1"
        }

        
        
      
      ]
      secrets = [
      {
        name = "TEST",
        valueFrom = "sa-pgres-glue-2.ckrsilkzqpmn.us-east-1.rds.amazonaws.com"
      }
        # {
        #   name = "COGNITO_CLIENT_ID"
        #   value = data.aws_secretsmanager_secret_version.client_id.secret_string
        #  },
        # {
        #   name = "COGNITO_CLIENT_SECRET"
        #   value = data.aws_secretsmanager_secret_version.client_secret.secret_string
        # },
        
      ]
   }
  }
  cluster_arn                = var.cluster_name
  cpu                       = var.container_cpu
  memory                    = var.container_memory
  subnet_ids = module.vpc.private_subnets
  security_group_ids             = [aws_security_group.ecs_service.id]
  load_balancer = {
    service = {
      target_group_arn = "${module.alb.target_group_arns[0]}"
      container_name   = var.container_name
      container_port   = var.container_port
    }
  }
  depends_on = [ module.alb ]
}

