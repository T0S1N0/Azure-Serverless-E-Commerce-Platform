"""Products API: list all and get by id."""
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
    logging.info("Products function triggered.")

    if req.method == "GET" and not req.route_params.get("id"):
        return get_all(req)
    if req.method == "GET" and req.route_params.get("id"):
        return get_one(req)
    return HttpResponse("Method not allowed", status_code=405)


def get_all(req: HttpRequest) -> HttpResponse:
    items = list(container.read_all_items())
    for item in items:
        if "_etag" in item:
            del item["_etag"]
    return HttpResponse(
        json.dumps(items),
        mimetype="application/json",
        status_code=200,
        headers={"Access-Control-Allow-Origin": "*"},
    )


def get_one(req: HttpRequest) -> HttpResponse:
    product_id = req.route_params.get("id")
    try:
        item = container.read_item(item=product_id, partition_key=product_id)
        if "_etag" in item:
            del item["_etag"]
        return HttpResponse(
            json.dumps(item),
            mimetype="application/json",
            status_code=200,
            headers={"Access-Control-Allow-Origin": "*"},
        )
    except Exception as e:
        if "NotFound" in str(type(e).__name__) or "404" in str(e):
            return HttpResponse("Not found", status_code=404)
        raise
