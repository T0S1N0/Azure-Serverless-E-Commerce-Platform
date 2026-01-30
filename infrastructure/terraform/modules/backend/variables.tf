variable "name_prefix" {
  type = string
}

variable "location" {
  type = string
}

variable "environment" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "cosmos_endpoint" {
  type      = string
  sensitive = true
}

variable "cosmos_key" {
  type      = string
  sensitive = true
}

variable "cosmos_database" {
  type = string
}

variable "cosmos_container" {
  type = string
}
