# Kore Runbook — Deployment

## Purpose
Step‑by‑step guide to deploy a Kore backend stack and connect it to the frontend.

This runbook ensures consistent, secure deployments using SAM + scripts.

---

# 1. Prerequisites

- AWS account
- AWS CLI configured
- SAM CLI installed
- Repo cloned

Verify:

```bash
aws sts get-caller-identity
sam --version
```

---

# 2. Choose Deployment Parameters

Decide:

- client name
- stage (dev/prod)
- region
- allowed origin (site domain)
- admin token

Example:

```
client = joes-pizza
stage = prod
region = us-east-1
origin = https://joespizza.com
```

---

# 3. Create Admin Token in SSM

Generate (must be ≥ 32 chars, cryptographically random — see `kore-standards-security-tier1.md` §2.4):

```bash
openssl rand -hex 32
```

Store (path must match `/{client}/{stage}/admin-token`):

```bash
aws ssm put-parameter   --name /joes-pizza/prod/admin-token   --type SecureString   --value "<token>"
```

> **Important:** Dev and prod must use **different** SSM paths and **different** tokens. Never share tokens across stages.

---

# 4. Run Tests

Before deploying, run the test suite and confirm all tests pass:

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

Do **not** proceed if any test fails.

---

# 5. Deploy Stack

From repo root:

```bash
cd backend
./deploy.sh joes-pizza prod us-east-1 https://joespizza.com
```

Script will:

- run tests
- build SAM
- deploy stack
- fetch outputs
- update frontend config

> **Checklist before deploying to prod:** Complete the Production Go/No-Go Checklist in `kore-standards-security-tier1.md` §13 before any production deploy.

---

# 6. Verify Outputs

Script prints:

- API URL
- table names
- bucket name

Example:

```
API: https://abc123.execute-api.us-east-1.amazonaws.com
```

---

# 7. SES Email Setup (v2 only — optional)

SES (Simple Email Service) handles two email functions in v2:
- **Owner notification** — you get an email when someone submits the lead/contact form
- **User confirmation** — the person who submitted gets an HTML "thanks for signing up" email

SES is **fully optional**. The stack deploys and works without it. You can enable SES at any time.

## What `init.sh` automates

When `kore.config.json` has `ses: true` and a `senderEmail`, `init.sh` will:

1. Call `aws sesv2 create-email-identity` to register your sender email with SES
2. Print whether verification is pending or already done
3. Print sandbox mode instructions

## Manual step: click the verification link

After `init.sh` runs, check your inbox for a verification email from AWS. Click the link. You can verify status with:

```bash
aws sesv2 get-email-identity --email-identity your@email.com --region us-east-1 --profile your-profile
```

Look for `"VerifiedForSendingStatus": true`.

## Sandbox vs Production mode

All new AWS accounts start in **SES sandbox mode**:
- You can only send emails to **verified** email addresses (both sender AND recipient)
- This means during development, you must verify any test recipient emails too
- Sending limit: 200 emails/day, 1 email/second

For production (sending to real users), you must **request production access**:

1. Go to: `https://console.aws.amazon.com/ses/home#/account`
2. Click **Request production access**
3. Fill in:
   - **Mail type:** Transactional
   - **Website URL:** your site URL
   - **Use case description:** "We send transactional emails: a confirmation email when users submit a contact/signup form, and a notification to the site owner. Users can only receive email by explicitly submitting the form. We do not send marketing emails."
4. AWS typically approves within 24 hours

## Testing SES

After verification, test with curl:

```bash
curl -X POST https://<api-url>/leads \
  -H "Content-Type: application/json" \
  -d '{"email":"verified-test@example.com","name":"Test","message":"Hello"}'
```

Check two inboxes:
- **Owner inbox** (your sender email) — should receive a plain-text notification
- **Submitted email** — should receive an HTML confirmation email

## Custom domain (optional, future)

For branded "from" addresses (e.g., `hello@lokality.com` instead of a personal email), you can verify a domain instead of an individual email. See [AWS SES domain verification docs](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html#verify-domain-procedure).

---

# 8. Verify API Live

```bash
curl https://<api>/content/home
```

Expected:
```json
{ "ok": true, "data": { ... } }
```

---

# 9. Connect Frontend

Confirm `frontend/assets/js/config.js` contains the deployed API URL:

```js
window.APP_CONFIG = {
  API_BASE_URL: "https://abc123.execute-api.us-east-1.amazonaws.com",
  ENV: "prod"
};
```

The deploy script should update this automatically. If it did not, update manually and commit:

```bash
git add frontend/assets/js/config.js
git commit -m "update API config for joes-pizza prod"
```

---

# 10. Deploy Frontend (GitHub Pages)

The frontend is deployed via a GitHub Actions workflow that publishes only the `frontend/` directory to GitHub Pages.

## One-time setup

1. Push the repo to GitHub (if not already)
2. Go to **Settings → Pages → Build and deployment → Source**
3. Change from "Deploy from a branch" to **"GitHub Actions"**

That's it — no branch selection or folder config needed.

## Workflow file

The workflow lives at `.github/workflows/deploy-pages.yml`. It:

- Triggers on every push to `main` (and manual dispatch)
- Uploads only `frontend/` as the Pages artifact
- Deploys via the official `actions/deploy-pages` action

## Deploying

Push to `main`:

```bash
git push origin main
```

The workflow runs automatically. Check status under the repo's **Actions** tab.

## Why not deploy from branch root?

The repo root contains `backend/`, `docs/`, `scripts/`, etc. Deploying from root would serve the `README.md` as the site index. The workflow cleanly publishes only `frontend/` so asset paths stay simple (no `/frontend/` prefix needed).

---

# 11. Production Smoke Test

## Functional
- [ ] `GET /content/home` returns `{ "ok": true, "data": { ... } }`
- [ ] `POST /leads` with valid payload returns 200
- [ ] `POST /media/presign` without token returns 401
- [ ] `POST /media/presign` with valid token returns presigned URL
- [ ] No console errors on frontend

## CORS
Verify CORS headers are returned for the correct origin:

```bash
curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
  -H "Origin: https://joespizza.com" \
  -H "Access-Control-Request-Method: POST" \
  https://<api>/leads
```

Expected: `200` and response includes `Access-Control-Allow-Origin: https://joespizza.com`.

## Security (see `kore-standards-security-tier1.md` §13 for full checklist)
- [ ] Admin token in SSM (≥ 32 chars, cryptographically random)
- [ ] S3 bucket private, SSE-AES256 encryption enabled
- [ ] API throttling active (rate: 10, burst: 20)
- [ ] DynamoDB deletion protection enabled
- [ ] DynamoDB point-in-time recovery enabled
- [ ] CloudWatch log retention set to 30 days
- [ ] Lambda IAM role uses least-privilege policies
- [ ] Error responses do not expose internal details
- [ ] No secrets in frontend code

## Verify throttling
```bash
aws apigatewayv2 get-stage --api-id <api-id> --stage-name '$default' \
  --query 'DefaultRouteSettings.{Throttle: ThrottlingRateLimit, Burst: ThrottlingBurstLimit}'
```

---

# 12. Rollback

If deploy fails or produces a broken stack:

> **Warning:** `sam delete` destroys all stack resources including DynamoDB tables and the S3 bucket. This causes **permanent data loss** unless backups exist.

**Before deleting a production stack:**

1. Confirm DynamoDB PITR is enabled (provides 35-day restore window even after deletion)
2. Back up critical table data if PITR is not enabled:
   ```bash
   aws dynamodb scan --table-name joes-pizza-prod-Leads > leads-backup.json
   ```
3. Ensure the S3 bucket is empty or backed up:
   ```bash
   aws s3 sync s3://joes-pizza-prod-media ./media-backup/
   ```
4. Delete the stack:
   ```bash
   sam delete --stack-name joes-pizza-prod
   ```
5. Redeploy from a known-good commit:
   ```bash
   git checkout <last-good-commit>
   cd backend
   ./deploy.sh joes-pizza prod us-east-1 https://joespizza.com
   ```

---

# 13. Rotation (Admin Token)

Generate a new token (must meet §2.4 requirements — ≥ 32 chars, cryptographically random):

```bash
openssl rand -hex 32
```

Update SSM parameter:

```bash
aws ssm put-parameter   --name /joes-pizza/prod/admin-token   --type SecureString   --overwrite   --value "<new-token>"
```

Redeploy to pick up the new token (Lambda caches the token per container lifecycle):

```bash
cd backend
./deploy.sh joes-pizza prod us-east-1 https://joespizza.com
```

The old token is invalidated once the new Lambda containers start.

---

# 14. Multi-Region Deployment

To deploy to another region:

1. **Create the SSM parameter in the target region first** (SSM parameters are region-scoped):
   ```bash
   aws ssm put-parameter   --name /joes-pizza/prod/admin-token   --type SecureString   --value "<token>"   --region us-west-2
   ```
2. Run the deploy script with the new region:
   ```bash
   cd backend
   ./deploy.sh joes-pizza prod us-west-2 https://joespizza.com
   ```

> Each region creates an independent stack with its own API URL, tables, and bucket.

---

# 15. Cost Awareness

Kore's per-client stack uses pay-per-request pricing. Typical monthly cost for a low-traffic small-business site:

| Service | Estimated cost |
|---------|---------------|
| API Gateway | < $1 |
| Lambda | < $1 |
| DynamoDB | < $1 |
| S3 | < $1 |
| **Total** | **~$1–5/month** |

Recommended: set up a **billing alarm** in the AWS account to catch unexpected cost spikes:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name billing-alarm \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 25 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=Currency,Value=USD \
  --alarm-actions <sns-topic-arn>
```

---

Deployment complete.
