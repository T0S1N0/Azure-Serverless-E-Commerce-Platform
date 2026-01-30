"""Update product by id."""
import json
import logging
import os
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
    logging.info("Product update function triggered.")
    if req.method != "PUT" and req.method != "PATCH":
        return HttpResponse("Method not allowed", status_code=405)

    product_id = req.route_params.get("id")
    if not product_id:
        return HttpResponse("Missing product id", status_code=400)

    try:
        body = req.get_json()
    except ValueError:
        return HttpResponse("Invalid JSON", status_code=400)

    try:
        existing = container.read_item(item=product_id, partition_key=product_id)
    except Exception as e:
        if "NotFound" in str(type(e).__name__) or "404" in str(e):
            return HttpResponse("Not found", status_code=404)
        raise

    for key in ("name", "price", "description", "imageUrl"):
        if key in body:
            existing[key] = body[key]
    if "price" in body:
        existing["price"] = float(existing["price"])

    updated = container.replace_item(item=product_id, body=existing)
    if "_etag" in updated:
        del updated["_etag"]
    return HttpResponse(
        json.dumps(updated),
        mimetype="application/json",
        status_code=200,
        headers={"Access-Control-Allow-Origin": "*"},
    )
