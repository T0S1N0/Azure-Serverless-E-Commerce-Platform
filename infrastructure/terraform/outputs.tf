output "api_base_url" {
  description = "Base URL of the products API"
  value       = module.backend.function_app_default_hostname
}

output "frontend_url" {
  description = "URL of the static web frontend"
  value       = module.frontend.frontend_url
}

output "function_app_name" {
  description = "Name of the Function App (for deployment)"
  value       = module.backend.function_app_name
}

output "frontend_storage_account_name" {
  description = "Storage account name for frontend static site (for deployment)"
  value       = module.frontend.storage_account_name
}

output "cosmos_db_endpoint" {
  description = "Cosmos DB account endpoint"
  value       = module.database.cosmos_endpoint
  sensitive   = true
}
