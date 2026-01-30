output "cosmos_endpoint" {
  value = azurerm_cosmosdb_account.main.endpoint
}

output "cosmos_primary_key" {
  value     = azurerm_cosmosdb_account.main.primary_key
  sensitive = true
}

output "cosmos_database_name" {
  value = azurerm_cosmosdb_sql_database.main.name
}

output "cosmos_container_name" {
  value = azurerm_cosmosdb_sql_container.products.name
}

output "resource_group_name" {
  value = local.rg_name
}
