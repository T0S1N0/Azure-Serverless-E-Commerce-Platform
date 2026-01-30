resource "azurerm_storage_account" "functions" {
  name                     = replace("${var.name_prefix}func", "-", "")
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_service_plan" "main" {
  name                = "${var.name_prefix}-plan"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "Y1" # Consumption (serverless)
}

resource "azurerm_linux_function_app" "main" {
  name                = "${var.name_prefix}-api"
  resource_group_name = var.resource_group_name
  location            = var.location
  storage_account_name       = azurerm_storage_account.functions.name
  storage_account_access_key = azurerm_storage_account.functions.primary_access_key
  service_plan_id            = azurerm_service_plan.main.id

  site_config {
    application_stack {
      python_version = "3.11"
    }
    cors {
      allowed_origins     = ["*"]
      support_credentials = false
    }
  }

  app_settings = {
    "COSMOS_ENDPOINT"   = var.cosmos_endpoint
    "COSMOS_KEY"        = var.cosmos_key
    "COSMOS_DATABASE"   = var.cosmos_database
    "COSMOS_CONTAINER"  = var.cosmos_container
    "FUNCTIONS_WORKER_RUNTIME" = "python"
    "WEBSITE_RUN_FROM_PACKAGE" = ""
  }
}
