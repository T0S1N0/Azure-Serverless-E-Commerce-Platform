output "storage_account_name" {
  value = azurerm_storage_account.frontend.name
}

output "frontend_url" {
  value = "https://${azurerm_storage_account.frontend.name}.z.web.core.windows.net"
}

output "storage_primary_connection_string" {
  value     = azurerm_storage_account.frontend.primary_connection_string
  sensitive = true
}
