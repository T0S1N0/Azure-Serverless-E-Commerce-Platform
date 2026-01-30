#!/usr/bin/env python3
"""
Seed Cosmos DB products container with sample data.
Requires: pip install azure-cosmos
Usage:
  export COSMOS_ENDPOINT=... COSMOS_KEY=... COSMOS_DATABASE=ecommerce COSMOS_CONTAINER=products
  python seed_cosmos.py
"""
import json
import os
import sys
from pathlib import Path

try:
    from azure.cosmos import CosmosClient
except ImportError:
    print("Install azure-cosmos: pip install azure-cosmos")
    sys.exit(1)

def main():
    endpoint = os.environ.get("COSMOS_ENDPOINT")
    key = os.environ.get("COSMOS_KEY")
    database_name = os.environ.get("COSMOS_DATABASE", "ecommerce")
    container_name = os.environ.get("COSMOS_CONTAINER", "products")

    if not endpoint or not key:
        print("Set COSMOS_ENDPOINT and COSMOS_KEY environment variables.")
        sys.exit(1)

    script_dir = Path(__file__).resolve().parent
    products_path = script_dir / "products.json"
    with open(products_path, "r") as f:
        products = json.load(f)

    client = CosmosClient(endpoint, credential=key)
    database = client.get_database_client(database_name)
    container = database.get_container_client(container_name)

    for product in products:
        container.upsert_item(product)
        print(f"Upserted product: {product['name']} (id={product['id']})")

    print(f"Seeded {len(products)} products into {database_name}/{container_name}.")

if __name__ == "__main__":
    main()
