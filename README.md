# Azure Serverless E-Commerce Platform

A production-grade three-tier serverless architecture on **Azure**, inspired by the [AWS Serverless E-Commerce Platform](https://github.com/nfroze/Serverless-E-Commerce-Platform). It demonstrates how to build cost-efficient, scalable web applications without managing servers.

## Overview

The platform separates concerns across three tiers:

1. **Frontend** – React SPA served from **Azure Storage** static website (optionally behind **Azure Front Door** or **Azure CDN**).
2. **Backend** – REST API implemented with **Azure Functions** (Python), one function per CRUD operation.
3. **Database** – **Azure Cosmos DB** (NoSQL, serverless capacity) for product storage.

Each tier scales independently. Infrastructure is defined in **Terraform** with modules for database, backend, and frontend.

## Architecture

Request flow:

- Users hit the static website (Storage static website or CDN).
- The React app calls the Function App HTTP endpoints for product data.
- Azure Functions talk to Cosmos DB using connection settings from app settings.

Terraform modules:

- **database** – Cosmos DB account (serverless), SQL database, and `products` container.
- **backend** – Storage account for Functions, Consumption plan, Linux Function App (Python 3.11), with Cosmos connection via app settings.
- **frontend** – Storage account with static website enabled (`index.html` and `404` → `index.html` for SPA routing).

## Tech Stack

| Layer      | Azure service                          |
|-----------|-----------------------------------------|
| Frontend  | Azure Storage (static website)         |
| API       | Azure Functions (Python 3.11)         |
| Database  | Azure Cosmos DB (NoSQL, serverless)    |
| IaC       | Terraform, optional Azure Storage state |

**Frontend:** React 18, Vite, React Router, localforage (cart persistence).  
**Backend:** Python Azure Functions, `azure-cosmos` SDK.  
**Deployment:** Terraform for infra; script to upload frontend build to Storage. **CI/CD:** GitHub Actions (Terraform plan on PRs, full deploy on push to `main`).

## Project structure

```
├── .github/workflows/             # GitHub Actions
│   ├── deploy.yml                # Terraform apply + deploy backend + frontend
│   └── terraform-plan.yml        # Terraform plan on PRs
├── infrastructure/terraform/     # Terraform root + modules
│   ├── main.tf
│   ├── modules/
│   │   ├── database/             # Cosmos DB
│   │   ├── backend/              # Function App
│   │   └── frontend/             # Storage static website
│   └── backend.tf.example        # Remote state example
├── backend/function_app/         # Azure Functions (Python)
│   ├── products/                 # GET /api/products, GET /api/products/{id}
│   ├── product_create/           # POST /api/products
│   ├── product_update/           # PUT/PATCH /api/products/{id}
│   └── product_delete/           # DELETE /api/products/{id}
├── database/seeds/               # Sample products + Cosmos seed script
├── frontend/react-app/           # React + Vite app
└── scripts/
    └── deploy-frontend.sh        # Upload build to Storage
```

## GitHub Actions (CI/CD)

The repo includes two workflows:

| Workflow | Trigger | Actions |
|----------|---------|---------|
| **Deploy** | Push to `main`, or manual (`workflow_dispatch`) | Terraform apply → deploy Azure Functions → build & upload frontend to Storage |
| **Terraform Plan** | Pull request that touches `infrastructure/**` | Terraform init, fmt, validate, plan (plan posted as PR comment when possible) |

### Required GitHub secrets (Azure OIDC)

Use [OpenID Connect (OIDC)](https://docs.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect) so Actions can sign in to Azure without storing a client secret.

1. **Create an Azure AD App Registration** (or use an existing one):
   - In Azure Portal: **Azure Active Directory** → **App registrations** → **New registration** (e.g. name: `github-actions-ecommerce`).
   - Note: **Application (client) ID**, **Directory (tenant) ID**. Your **Subscription ID** is under Subscriptions.

2. **Create a federated credential** for the repo:
   - In the app: **Certificates & secrets** → **Federated credentials** → **Add**.
   - **Issuer:** `https://token.actions.githubusercontent.com`
   - **Subject:** `repo:<your-org>/<your-repo>:ref:refs/heads/main` (for Deploy on push to main). For Terraform Plan on PRs, add a second federated credential with **Subject:** `repo:<your-org>/<your-repo>:pull_request` so PRs from any branch can run the plan workflow.
   - **Audience:** `api://AzureADTokenExchange` (default).

3. **Grant the app access to the subscription** (or the resource group used for Terraform):
   - **Subscriptions** → your subscription → **Access control (IAM)** → **Add role assignment**.
   - Role: **Contributor** (or more restrictive: e.g. only the resource group).
   - Assign access to: **User, group, or service principal** → select the app by name.

4. **Add repository secrets** (Settings → Secrets and variables → Actions):
   - `AZURE_CLIENT_ID` = Application (client) ID  
   - `AZURE_TENANT_ID` = Directory (tenant) ID  
   - `AZURE_SUBSCRIPTION_ID` = Subscription ID  

### Remote state (required for Deploy workflow)

The **Deploy** workflow needs Terraform state in Azure Storage so that apply persists state and outputs are available for backend/frontend deploy.

1. Create a storage account and container for state (once per subscription/tenant):
   ```bash
   az group create -n tfstate-rg -l westeurope
   az storage account create -n <tfstateaccount> -g tfstate-rg -l westeurope --sku Standard_LRS
   az storage container create -n tfstate -a <tfstateaccount>
   ```

2. Add these **repository secrets**:
   - `TF_BACKEND_RG` = resource group name (e.g. `tfstate-rg`)
   - `TF_BACKEND_SA` = storage account name
   - `TF_BACKEND_CONTAINER` = container name (e.g. `tfstate`)
   - `TF_BACKEND_KEY` = state file key (e.g. `ecommerce.terraform.tfstate`)

3. Grant the same app registration **Storage Blob Data Contributor** (or equivalent) on the state storage account so Terraform can read/write state via OIDC (`use_azuread=true`).

If `TF_BACKEND_*` are not set, the Deploy workflow fails at Terraform init with instructions to configure them. The **Terraform Plan** workflow can run with `terraform init -backend=false` when backend secrets are not set (plan only, no remote state).

### First run

After secrets are set, push to `main` or run **Deploy** from the Actions tab. The workflow will:

1. Run Terraform apply (creating/updating resource group, Cosmos DB, Function App, Storage).
2. Deploy the Python Azure Functions to the Function App.
3. Build the React app with `VITE_API_BASE_URL` set to the Function App URL, then upload the build to the frontend Storage account `$web` container.

You may still need to **seed the database** once (e.g. run `database/seeds/seed_cosmos.py` locally with Cosmos credentials from Terraform output or Azure Portal).

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (logged in: `az login`)
- [Terraform](https://www.terraform.io/downloads) >= 1.0
- [Node.js](https://nodejs.org/) 18+ (for frontend)
- [Python](https://www.python.org/) 3.11+ and [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local) (for local API)

## Quick start

### 1. Deploy infrastructure

```bash
cd infrastructure/terraform
# Local state (no backend config):
terraform init -backend=false
# Or remote state: create backend storage, then:
# terraform init -backend-config="resource_group_name=..." -backend-config="storage_account_name=..." ...
terraform plan -out=tfplan
terraform apply tfplan
```

For remote state (e.g. for CI or team use), pass `-backend-config=` for `resource_group_name`, `storage_account_name`, `container_name`, and `key`; see `backend.tf.example`.

Note outputs: `api_base_url` (Function App hostname) and `frontend_url` (static website URL).

### 2. Seed the database

```bash
cd database/seeds
pip install -r requirements.txt
export COSMOS_ENDPOINT="<from Terraform or Azure Portal>"
export COSMOS_KEY="<from Terraform or Azure Portal>"
export COSMOS_DATABASE=ecommerce
export COSMOS_CONTAINER=products
python seed_cosmos.py
```

### 3. Deploy the backend (Azure Functions)

From the repo root, publish the Function App (replace `<function_app_name>` with the name from Terraform output, e.g. `ecommerce-dev-xxxxxx-api`):

```bash
cd backend/function_app
pip install -r requirements.txt
func azure functionapp publish <function_app_name> --python
```

Or use the Azure portal / DevOps to deploy the `backend/function_app` folder.

### 4. Build and deploy the frontend

Set the API base URL and build:

```bash
cd frontend/react-app
echo "VITE_API_BASE_URL=https://<function_app_name>.azurewebsites.net" > .env
npm install
npm run build
```

Deploy to the Storage account (name from Terraform frontend module output):

```bash
../../scripts/deploy-frontend.sh <storage_account_name>
```

Open the frontend URL (e.g. `https://<storage_account_name>.z.web.core.windows.net`).

## Local development

1. **Cosmos DB** – Use the same Cosmos account as deployed, or Azure Cosmos DB Emulator, and set `COSMOS_*` in `backend/function_app/local.settings.json` (copy from `local.settings.json.example`; do not commit secrets).

2. **Backend** – Run Functions locally:
   ```bash
   cd backend/function_app
   func start
   ```
   API will be at `http://localhost:7071` (e.g. `http://localhost:7071/api/products`).

3. **Frontend** – Vite proxy is set to `/api` → `http://localhost:7071`:
   ```bash
   cd frontend/react-app
   npm run dev
   ```
   So you can use the app without setting `VITE_API_BASE_URL` for local dev.

## Key decisions

- **Cosmos DB serverless** – Pay per request and storage; no throughput provisioning; good for variable e-commerce traffic.
- **Single-purpose Azure Functions** – One function per operation (list, get, create, update, delete) for clear scaling and deployment.
- **Static website with SPA fallback** – `index.html` for both index and 404 so client-side routing works without extra config.
- **Modular Terraform** – Separate database, backend, and frontend modules with outputs wiring them (e.g. Cosmos settings into the Function App).

## License

MIT.
