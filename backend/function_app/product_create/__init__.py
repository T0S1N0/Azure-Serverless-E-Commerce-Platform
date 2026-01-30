"""Create product."""
import json
import logging
import os
import uuid
from azure.functions import HttpRequest, HttpResponse
from azure.cosmos import CosmosClient

COSMOS_ENDPOINT = os.environ["COSMOS_ENDPOINT"]
COSMOS_KEY = os.environ["COSMOS_KEY"]
COSMOS_DATABASE = os.environ["COSMOS_DATABASE"]
COSMOS_CONTAINER = os.environ["COSMOS_CONTAINER"]

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database = client.get_database_client(COSMOS_DATABASE)
container = database.get_container_client(COSMOS_CONTAINER)


def main(req: HttpRequest) -> HttpResponse:
    logging.info("Product create function triggered.")
    if req.method != "POST":
        return HttpResponse("Method not allowed", status_code=405)

    try:
        body = req.get_json()
    except ValueError:
        return HttpResponse("Invalid JSON", status_code=400)

    name = body.get("name")
    price = body.get("price")
    description = body.get("description", "")
    image_url = body.get("imageUrl", "")

    if name is None or price is None:
        return HttpResponse(
            json.dumps({"error": "name and price are required"}),
            mimetype="application/json",
            status_code=400,
        )

    product_id = str(uuid.uuid4())
    item = {
        "id": product_id,
        "name": name,
        "price": float(price),
        "description": description,
        "imageUrl": image_url,
    }
    container.create_item(item)
    if "_etag" in item:
        del item["_etag"]
    return HttpResponse(
        json.dumps(item),
        mimetype="application/json",
        status_code=201,
        headers={"Access-Control-Allow-Origin": "*"},
    )
