output "function_app_id" {
  value = azurerm_linux_function_app.main.id
}

output "function_app_name" {
  value = azurerm_linux_function_app.main.name
}

output "function_app_default_hostname" {
  value = "https://${azurerm_linux_function_app.main.default_hostname}"
}
