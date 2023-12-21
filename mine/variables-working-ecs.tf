variable "env" {
  type = string
}

# variable "vpc_id" {
#   type = string
# }


variable "sg_name" {
  type = string
}
variable "alb_name" {
  type = string
}

variable "cluster_name" {
  type = string
}
variable "https_cidr_blocks" {
  type = list(string)
}

variable "task_role_name" {
  type = string
}

variable "service_name" {
  type        = string
  description = "ECS service name to run container on"

}

variable "external" {
  type    = bool
  default = false
}

# variable "vpc_subnet_ids" {
#   type = list(string)
# }

variable "target_group_name" {
  description = "Target Group name"
}

variable "container_port" {
  type = number
}

variable "ssl_redirect" {
  type    = bool
  default = false
}

variable "image" {
  description = "container image"
}

variable "container_cpu" {
  type    = number
  default = 512
}

variable "container_memory" {
  type    = number
  default = 2048
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "region" {
  type = string
}

variable "log_stream_name" {
  type = string
}



variable "domain_name" {
  type    = string
  default = null
}
# variable "certificate_sans" {
#     type = list(string)
#     description = "List of subject alternative names"
# }

#variable "vpc_subnet_ids_public" {
#  type = list(string)
#}

#variable "vpc_security_group_ids" {
#  type = list(string)
#}

variable "elasticache_instance_type" {
  type    = string
  default = null
}

variable "elasticache_enabled" {
  type    = bool
  default = false
}

variable "elasticache_address" {
  type    = bool
  default = null
}

# variable "elasticache_family" {
#   type = string
# }

variable "redis_name" {
  type = string
}

variable "engine_version" {
  type    = string

}

variable "elasticache_family" {
  type    = string
  
}

variable "elasticache_availability_zones" {
  type    = list(string)
  default = null
}

variable "elasticache_at_rest_encryption_enabled" {
  type    = bool
  default = false
}

variable "elasticache_transit_encryption_enabled" {
  type    = bool
  default = false
}

# variable "environment" {
#   description = "The environment variables to pass to the container"
#   type = list(object({
#     name  = string
#     value = string
#   }))
#   default = [file("${path.module}/hello.txt")

# ]
# }
# variable "elasticache_parameters" {
#   type    = map(any)
#   default = {}
# }

variable "container_name" {}
#variable "database_name" {
#  type = string
#  default = null
#}

#variable "smtp_secret_name" {
#  type = string
#  default = null
#}

#variable "rds_host" {
#  type = string
#  default = null
#}

#variable "rds_secret_arn" {
#  type = string
#  default = null
#}

variable "elb_name" {
  type    = string
  default = null
}
variable "sentry_flask_dsn" {
  type    = string
  default = null
}


