# AIDO Group — Backend API

REST API for the **AIDO Group Company Ltd** inventory management system. It powers
the AIDO frontend with authentication, products, purchases, sales, clients,
reports, receipts data, contact emails, and multi-branch ("Boss") tenancy. The
API is deployed on Render and the frontend is hosted on Vercel.

## Tech Stack

- **Node.js** + **Express 5**
- **Mongoose 9** (MongoDB)
- **JSON Web Tokens** (JWT) for authentication (`jsonwebtoken`)
- **bcryptjs** for password hashing
- **Nodemailer** for password reset and contact emails
- **CORS**, **cookie-parser**, **dotenv**

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB — a local instance (`mongod`) or an Atlas cluster

### Installation

```bash
cd backend
npm install
```

Copy the example environment file and fill in the values:

```bash
cp .env.example .env
```

### Running

```bash
# Development (auto-restarts on file changes)
npm start

# Run the branch tenancy + index migrations manually
npm run migrate:branches
```

The server listens on `http://localhost:5000` by default and prints a health
message at `GET /`.

## Environment Variables

| Variable        | Description                                        | Default      | Required |
| --------------- | -------------------------------------------------- | ------------ | -------- |
| `MONGO_URI`     | MongoDB connection string                          | —            | Yes      |
| `JWT_SECRET`    | Secret used to sign and verify JWTs                | —            | Yes      |
| `PORT`          | HTTP port the server listens on                    | `5000`       | No       |
| `EMAIL_HOST`    | SMTP host (e.g. `smtp.gmail.com`)                  | `smtp.gmail.com` | No   |
| `EMAIL_PORT`    | SMTP port                                          | `587`        | No       |
| `EMAIL_USER`    | SMTP username / sender account                     | —            | No\*     |
| `EMAIL_PASS`    | SMTP password or app password                      | —            | No\*     |
| `FROM_NAME`     | Display name used as email sender                  | `AIDO Group` | No       |
| `FROM_EMAIL`    | Email address used as sender                       | `EMAIL_USER` | No       |
| `CONTACT_EMAIL` | Destination inbox for the contact form             | —            | No       |

\* If `EMAIL_USER`/`EMAIL_PASS` are missing, Nodemailer falls back to a
one-off **Ethereal** test account and logs a preview URL where the reset link
can be opened locally. For real mail, provide real SMTP credentials.

## Scripts

| Script               | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `npm start`          | Runs the API with `nodemon` (auto-restart on changes). |
| `npm run migrate:branches` | Runs pending data migrations manually.           |

## Project Structure

```
backend/
├── controllers/    # Request handlers per entity
│   ├── clientController.js
│   ├── contactController.js
│   ├── productController.js
│   ├── purchaseController.js
│   ├── reportController.js
│   ├── saleController.js
│   └── userController.js
├── db/
│   ├── connectDB.js     # Mongo connection
│   └── migrations.js    # One-shot auto-migrations
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   └── branchMiddleware.js  # Resolves the active branch tenant
├── models/            # Mongoose schemas
│   ├── Client.js
│   ├── Product.js
│   ├── Purchase.js
│   ├── Sale.js
│   └── User.js
├── routes/            # Express routers (mount under /api/*)
│   ├── clientRoutes.js
│   ├── contactRoutes.js
│   ├── productRoutes.js
│   ├── purchaseRoutes.js
│   ├── reportRoutes.js
│   ├── saleRoutes.js
│   └── userRoutes.js
├── scripts/
│   └── migrateBranches.js  # Manual migration trigger
├── utils/
│   └── sendEmail.js        # Nodemailer transport
└── server.js          # App entry point
```

## API Reference

Base URL (local): `http://localhost:5000` · Live: your Render URL.

All business routes are protected: the client must send the JWT either as an
`Authorization: Bearer <token>` header or in an `httpOnly` cookie set at login.
Business routes also run through the branch middleware (see
[Multi-Branch Tenancy](#multi-branch-tenancy)).

### Health

| Method | Endpoint     | Description                          |
| ------ | ------------ | ------------------------------------ |
| GET    | `/`          | Service banner / liveness.           |
| GET    | `/api/health`| Lightweight health check (`{status:"ok"}`). |

### Users — `/api/users`

| Method | Endpoint               | Auth | Description                        |
| ------ | ---------------------- | ---- | ---------------------------------- |
| POST   | `/register`            | —    | Create an account.                 |
| POST   | `/login`               | —    | Log in, sets the JWT cookie.       |
| POST   | `/logout`              | Yes  | Log out, clears the cookie.        |
| GET    | `/profile`             | Yes  | Current user profile.              |
| PUT    | `/profile`             | Yes  | Update profile fields.             |
| PUT    | `/change-password`     | Yes  | Change password.                   |
| POST   | `/forgot-password`     | —    | Sends a reset link by email.       |
| POST   | `/reset-password/:token` | —  | Reset password with the emailed token. |
| GET    | `/`                    | Yes  | List users (admin/Boss only).      |
| DELETE | `/user/:id`            | Yes  | Delete a user.                     |

### Products — `/api/products`

| Method | Endpoint  | Auth | Description             |
| ------ | --------- | ---- | ----------------------- |
| POST   | `/`       | Yes  | Create a product.       |
| GET    | `/`       | Yes  | List products (branch-scoped). |
| GET    | `/:id`    | Yes  | Get one product.        |
| PUT    | `/:id`    | Yes  | Update a product.       |
| DELETE | `/:id`    | Yes  | Delete a product.       |

### Purchases — `/api/purchases`

| Method | Endpoint  | Auth | Description             |
| ------ | --------- | ---- | ----------------------- |
| POST   | `/`       | Yes  | Create a purchase (increments stock, validates idempotency). |
| GET    | `/`       | Yes  | List purchases (branch-scoped). |
| GET    | `/:id`    | Yes  | Get one purchase.       |
| PUT    | `/:id`    | Yes  | Update a purchase.      |
| DELETE | `/:id`    | Yes  | Delete a purchase.      |

### Sales — `/api/sales`

| Method | Endpoint  | Auth | Description             |
| ------ | --------- | ---- | ----------------------- |
| POST   | `/`       | Yes  | Create a sale (decrements stock, computes profit, validates idempotency). |
| GET    | `/`       | Yes  | List sales (branch-scoped). |
| GET    | `/:id`    | Yes  | Get one sale.           |
| PUT    | `/:id`    | Yes  | Update a sale.          |
| DELETE | `/:id`    | Yes  | Delete a sale.          |

### Clients — `/api/clients`

| Method | Endpoint              | Auth | Description                      |
| ------ | --------------------- | ---- | -------------------------------- |
| POST   | `/`                   | Yes  | Create a client.                 |
| GET    | `/`                   | Yes  | List clients (branch-scoped).    |
| GET    | `/search`             | Yes  | Search clients by name/email/phone. |
| GET    | `/:id`                | Yes  | Get one client.                  |
| PUT    | `/:id`                | Yes  | Update a client.                 |
| DELETE | `/:id`                | Yes  | Delete a client.                 |
| PUT    | `/:id/purchase-stats` | Yes  | Update client purchase stats.    |

### Reports — `/api/reports`

| Method | Endpoint                         | Description                                |
| ------ | -------------------------------- | ------------------------------------------ |
| GET    | `/income/{daily\|weekly\|monthly\|annual}` | Income over the period.          |
| GET    | `/expense/{daily\|weekly\|monthly\|annual}` | Expense over the period.        |
| GET    | `/profit/{daily\|weekly\|monthly\|annual}` | Profit over the period.         |
| GET    | `/loss/{daily\|weekly\|monthly\|annual}` | Loss over the period.            |
| GET    | `/clients/{daily\|weekly}`        | New clients over the period.               |
| GET    | `/low-stock`                      | Low-stock items (supports `?threshold=10`). |
| GET    | `/inventory-summary`              | Inventory totals/summary.                  |
| GET    | `/recent-transactions`            | Recent sales/purchases.                    |

### Contact — `/api/contact`

| Method | Endpoint  | Auth | Description                         |
| ------ | --------- | ---- | ----------------------------------- |
| POST   | `/send`   | —    | Send the public contact form email. |

## Authentication

- Passwords are hashed with **bcryptjs**; tokens are signed with `JWT_SECRET`.
- On login the token is returned and set as an `httpOnly` cookie.
- `authMiddleware` reads the token from the cookie or the `Authorization` header
  and rejects with `401` otherwise. Authenticated responses are sent with
  `Cache-Control: no-store` (and the server disables ETags) so protected GETs
  are never revalidated into `304 Not Modified`, which the frontend would treat
  as a failure.

## Multi-Branch Tenancy

The API is tenant-aware across **two branches**:

- `AIDO_GROUP`
- `AIDO_PAPER_BAGS`

`branchMiddleware` runs after `authMiddleware` on every business route and
resolves the active branch:

- Users with `canSwitchBranches: true` (Bosses) may select a branch via the
  `X-Active-Branch` request header. An invalid value returns `400`.
- Fixed users are pinned to their own `branch` and never read the header.
- The last-used branch is persisted as `activeBranch` on the user document.

Every product, purchase, sale, client, and report is scoped to the resolved
branch.

## Offline Sync Idempotency

The frontend can record sales/purchases while offline and replay them later. To
make replay safe, each offline write carries a `clientMutationId` (a UUID):

- The controller checks for an existing document with the same
  `clientMutationId` + `branch` before inserting and returns the existing
  document instead of duplicating.
- A unique **partial** index `cmi_branch_unique` on `{ clientMutationId, branch }`
  with `partialFilterExpression: { clientMutationId: { $type: "string" } }`
  backstops the check at the database level. Because it only indexes string
  values, documents with a missing/`null` mutation id are never indexed and
  cannot collide.

## Auto-Migrations

On server start, `db/migrations.js` runs any pending migrations in the
background (it never blocks or crashes the server):

- Each migration claims itself in the `migrations` collection (`$setOnInsert`),
  so it runs exactly once. Failed runs are un-claimed and retried on the next
  boot.
- `branch_tenancy_v1` — stamps pre-existing data with `AIDO_GROUP` and grants
  existing Bosses `canSwitchBranches`.
- `sale_purchase_partial_index_v2` — drops the old sparse unique index and
  creates the partial `cmi_branch_unique` index on sales and purchases.

Run the same migrations manually with `npm run migrate:branches`.

## Deployment (Render)

1. Create a Render web service pointing at this folder.
2. Add the environment variables from the table above (set `NODE_ENV=production`).
3. Start command: `node server.js`.
4. `server.js` CORS-allowlists `http://localhost:5173` and the Vercel frontend
   URL; add your own origin if you host the frontend elsewhere.
5. Auto-migrations run on the first boot — no manual database work needed.

## License

[MIT](./LICENSE) © 2026 Icyubahiro Jay P
