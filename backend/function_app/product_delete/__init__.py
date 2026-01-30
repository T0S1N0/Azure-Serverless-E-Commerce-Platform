"""Delete product by id."""
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
    logging.info("Product delete function triggered.")
    if req.method != "DELETE":
        return HttpResponse("Method not allowed", status_code=405)

    product_id = req.route_params.get("id")
    if not product_id:
        return HttpResponse("Missing product id", status_code=400)

    try:
        container.delete_item(item=product_id, partition_key=product_id)
    except Exception as e:
        if "NotFound" in str(type(e).__name__) or "404" in str(e):
            return HttpResponse("Not found", status_code=404)
        raise

    return HttpResponse(status_code=204, headers={"Access-Control-Allow-Origin": "*"})
