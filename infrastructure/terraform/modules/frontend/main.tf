resource "azurerm_storage_account" "frontend" {
  name                     = replace("${var.name_prefix}web", "-", "")
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
}

resource "azurerm_storage_static_website" "frontend" {
  storage_account_id      = azurerm_storage_account.frontend.id
  index_document          = "index.html"
  error_404_document      = "index.html"
}
