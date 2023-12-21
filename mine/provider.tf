terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0.0"
    }
    postgresql = {
      source  = "cyrilgdn/postgresql"
    }
  }

  backend "s3" {
    bucket = "xxxx"
    key    = "xxx"
    region = "us-east-2"
    dynamodb_table = "xxxx"
    encrypt        = true
  }

  # Required version of Terraform. Allows only the rightmost version component to increment
  required_version = ">= 1.5.7"
}

provider "aws" {
  region = "us-east-2"
  default_tags {
    tags = {
      Terraform = "true"
      Repo      = "xxxx"
    }
  }
}