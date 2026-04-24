# Implementation Plan

- [x] 1. Initialize project structure



  - Create `/client` (React, Tailwind CSS) and `/server` (Express) directories with package.json files
  - Set up Tailwind CSS config in the client
  - Add `.env` file to `/server` with PORT, JWT_SECRET, DATABASE_URL placeholders
  - Configure Axios base URL and proxy from client to server
  - _Requirements: 8.5_

- [x] 2. Set up database and schema



  - [x] 2.1 Create PostgreSQL connection utility in `/server`


    - Write `db.js` using the `pg` Pool with DATABASE_URL from env
    - Export a `query` helper function
    - _Requirements: 4.1, 4.2_
  - [x] 2.2 Write and run database migration script


    - Create `migrate.js` that runs the CREATE TABLE statements for `users` and `batches`
    - Include the CHECK constraints for role and unit, and the FK from batches to users
    - _Requirements: 4.1, 4.2, 4.3_

- [-] 3. Implement backend authentication



  - [ ] 3.1 Create User model



    - Write `models/User.js` with functions: `createUser`, `findByEmail`, `findById`
    - Hash password with bcrypt in `createUser`
    - _Requirements: 1.1, 1.2_
  - [x] 3.2 Implement auth controller and routes




    - Write `controllers/authController.js` with `register` and `login` handlers
    - `register`: validate fields, check duplicate email, create user, return JWT
    - `login`: verify credentials, return JWT with `{ id, role }` payload (24h expiry)
    - Wire up `routes/auth.js` and mount at `/api/auth`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 8.1, 8.2_
  - [ ] 3.3 Implement JWT middleware
    - Write `middleware/verifyToken.js` to extract and verify Bearer token
    - Attach `req.user = { id, role }` on success; return 401 on failure
    - _Requirements: 3.2, 3.3_

- [-] 4. Implement backend batch API

  - [ ] 4.1 Create Batch model
    - Write `models/Batch.js` with functions: `createBatch`, `getBatchesByFarmer`
    - `getBatchesByFarmer` filters by farmer_id
    - _Requirements: 4.2, 4.3_
  - [ ] 4.2 Implement batch controller and routes
    - Write `controllers/batchController.js` with `getBatches` and `createBatch` handlers
    - `getBatches`: return batches for `req.user.id` only
    - `createBatch`: validate fields, insert batch, return created record
    - Wire up `routes/batches.js` with `verifyToken` middleware and mount at `/api/batches`
    - _Requirements: 6.3, 8.3, 8.4_

- [ ] 5. Write backend tests
  - Set up Jest + Supertest; configure a test DATABASE_URL
  - Write tests for register (success, duplicate email, missing fields)
  - Write tests for login (success, wrong password)
  - Write tests for GET /api/batches (authenticated, unauthenticated)
  - Write tests for POST /api/batches (success, missing fields)
  - _Requirements: 1.2, 1.3, 2.2, 3.2, 6.5, 8.1, 8.2, 8.3, 8.4_

- [-] 6. Implement frontend auth

  - [ ] 6.1 Create AuthContext and Axios instance
    - Write `context/AuthContext.jsx` storing token and user (id, role) in state + localStorage
    - Expose `login`, `logout` functions
    - Write `api/axios.js` Axios instance that attaches Authorization header from context
    - _Requirements: 2.1, 3.1_
  - [ ] 6.2 Build Register and Login pages
    - Write `pages/RegisterPage.jsx` with form fields: name, email, password, role dropdown
    - Write `pages/LoginPage.jsx` with email and password fields
    - Both call the respective API endpoints, store token on success, and redirect by role
    - Display inline error messages on failure
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 2.4_
  - [ ] 6.3 Implement PrivateRoute component
    - Write `components/PrivateRoute.jsx` that checks token presence and user role
    - Redirect to /login if unauthenticated; redirect to correct dashboard if wrong role
    - _Requirements: 3.1, 5.3, 7.2_

- [ ] 7. Implement Farmer Dashboard
  - [ ] 7.1 Build BatchTable component
    - Write `components/BatchTable.jsx` rendering columns: Batch ID, Product Name, Origin, Harvest Date, Quantity, Status
    - Show empty state message when no batches exist
    - _Requirements: 5.1, 5.2, 5.4_
  - [ ] 7.2 Build FarmerDashboard page
    - Write `pages/FarmerDashboard.jsx` that fetches GET /api/batches on mount
    - Render BatchTable with fetched data
    - Include a "New Harvest Entry" button that opens the HarvestEntryForm
    - _Requirements: 5.1, 5.5_

- [x] 8. Implement Harvest Entry Form

  - Write `components/HarvestEntryForm.jsx` with fields: Batch ID, Product Name, Origin, Harvest Date, Quantity, Unit dropdown (kg/tons/liters)
  - Auto-generate Batch ID as BATCH-001, BATCH-002... based on existing batch count; allow manual override
  - On submit, POST to /api/batches, show success message, and trigger batch list refresh
  - Validate required fields client-side before submission
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 9. Implement Manufacturer Dashboard placeholder

  - Write `pages/ManufacturerDashboard.jsx` displaying "Stage 2: Processing module coming soon"
  - Wrap with PrivateRoute restricted to manufacturer role
  - _Requirements: 7.1, 7.2_

- [x] 10. Wire up React Router and finalize client


  - Configure routes in `App.jsx`: /, /register, /login, /farmer/dashboard, /manufacturer/dashboard
  - Add Navbar component with user display and logout button
  - Write frontend component tests (React Testing Library) for LoginPage, HarvestEntryForm, and PrivateRoute
  - _Requirements: 2.3, 2.4, 3.1_
