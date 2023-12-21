output "public_dns_name" {
  description = "Public load balancer address to connect to"
  value       = module.alb.lb_dns_name
}

output "redis_host" {
  description = "Public load balancer address to connect to"
  value       = try(module.redis[0].endpoint, null)
}
