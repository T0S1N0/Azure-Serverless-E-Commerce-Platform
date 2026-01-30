terraform {
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # Backend config: in CI use -backend-config=... from GitHub secrets.
  # For local, run: terraform init -backend=false (local state) or pass -backend-config=...
  backend "azurerm" {}
}

provider "azurerm" {
  features {}
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  name_prefix = "ecommerce-${var.environment}-${random_string.suffix.result}"
}

resource "azurerm_resource_group" "main" {
  name     = "${local.name_prefix}-rg"
  location = var.location
}

module "database" {
  source = "./modules/database"

  name_prefix         = local.name_prefix
  location            = var.location
  environment         = var.environment
  resource_group_name = azurerm_resource_group.main.name
}

module "backend" {
  source = "./modules/backend"

  name_prefix         = local.name_prefix
  location            = var.location
  environment         = var.environment
  resource_group_name = azurerm_resource_group.main.name
  cosmos_endpoint     = module.database.cosmos_endpoint
  cosmos_key          = module.database.cosmos_primary_key
  cosmos_database     = module.database.cosmos_database_name
  cosmos_container    = module.database.cosmos_container_name
}

module "frontend" {
  source = "./modules/frontend"

  name_prefix         = local.name_prefix
  location            = var.location
  environment         = var.environment
  resource_group_name = azurerm_resource_group.main.name
}
