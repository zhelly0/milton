# Azure Deployment Plan

Status: Ready for Validation

## Goal
Deploy the existing Task Manager app using:
- Frontend: Azure Static Web Apps (React build from `frontend`)
- Backend API: Azure App Service (Node.js Express from `backend`)
- Integration: Static Web Apps linked to App Service backend through `/api`

## Current App Assessment
- Frontend is a React + TypeScript SPA in `frontend`
- Backend is an Express API in `backend`
- Frontend currently calls `http://localhost:5000/api/tasks` directly

## Proposed Architecture
- Azure Static Web Apps hosts the frontend assets globally
- Azure App Service hosts the Express API
- Static Web Apps routes `/api/*` to the linked App Service backend
- Frontend API base URL updated to use relative `/api/tasks`

## Required Changes
1. Frontend configuration
- Replace hardcoded `http://localhost:5000/api/tasks` with environment-driven or relative `/api/tasks`

2. Backend readiness
- Ensure production start script is available (`npm start`)
- Keep API route prefix `/api` as-is
- Add health endpoint verification for App Service

3. Static Web App configuration
- Add `staticwebapp.config.json` for SPA fallback and route behavior
- Configure GitHub Actions workflow for SWA build/deploy

4. App Service deployment setup
- Add GitHub Actions workflow to deploy backend to App Service
- Include startup/runtime configuration guidance

5. Documentation
- Add deployment instructions and required Azure resources
- Document required secrets and variables in GitHub repository settings

## Azure Resources
- Subscription ID: 746887ba-7b8a-4ef3-bc07-9f06372b0806
- Region: swedencentral
- Resource Group: rg-test-taskmanager
- Naming Prefix: milton-taskmgr
- Azure Static Web App: milton-taskmgr-swa
- Azure App Service Plan: milton-taskmgr-plan
- Azure Web App (API): milton-taskmgr-api

## User Inputs
- Azure subscription: 746887ba-7b8a-4ef3-bc07-9f06372b0806
- Azure region: swedencentral
- Resource group: rg-test-taskmanager
- App naming prefix: milton-taskmgr
- Repository workflow preference: GitHub Actions

## Validation Checklist
- Frontend build succeeds from `frontend`
- Backend starts with `npm start` in `backend`
- Frontend requests resolve through `/api/tasks`
- Static Web App deployment workflow completes
- App Service deployment workflow completes

## Handoff Sequence
1. Update plan to Ready for Validation
2. Run azure-validate checks
3. Run deployment steps
