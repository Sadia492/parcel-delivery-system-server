"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes")); // Your main router (import all modules there)
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = require("./middleware/globalErrorHandler");
const notFoundRoute_1 = require("./middleware/notFoundRoute");
const env_1 = require("./app/config/env");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: env_1.envVars.FRONTEND_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use("/api", routes_1.default);
// Landing page with your Parcel Management API info and routes
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>📦 Parcel Management API</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            color: #333;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          }
          h1 {
            text-align: center;
            color: #1e3c72;
            margin-bottom: 20px;
          }
          .status {
            text-align: center;
            background: #d4edda;
            color: #155724;
            padding: 12px 20px;
            border-radius: 50px;
            display: inline-block;
            font-weight: 600;
            margin-bottom: 30px;
          }
          .routes {
            margin-top: 20px;
          }
          .route-group {
            margin-bottom: 25px;
          }
          .route-group h2 {
            border-bottom: 2px solid #1e3c72;
            padding-bottom: 5px;
            color: #1e3c72;
            margin-bottom: 12px;
          }
          .route {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #eee;
            padding: 10px 0;
            font-size: 1.05em;
          }
          .route:last-child {
            border-bottom: none;
          }
          .badge {
            background: #1e3c72;
            color: white;
            border-radius: 6px;
            padding: 4px 12px;
            font-weight: 700;
            font-family: monospace;
            font-size: 0.9em;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
          }
          .doc-box {
            background: #fff3cd;
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
            border: 1px solid #ffeeba;
            color: #856404;
          }
        </style>
    </head>
    <body>
      <div class="container">
        <h1>📦 Parcel Management API</h1>
        <div class="status">🚀 Server is running smoothly</div>

        <div class="routes">
          <div class="route-group">
            <h2>🔐 Authentication</h2>
            <div class="route">
              <span>Change Password</span>
              <span class="badge">POST /api/auth/change-password</span>
            </div>
            <div class="route">
              <span>Reset Password</span>
              <span class="badge">POST /api/auth/reset-password</span>
            </div>
            <div class="route">
              <span>Logout</span>
              <span class="badge">POST /api/auth/logout</span>
            </div>
          </div>

          <div class="route-group">
            <h2>👤 User Management</h2>
            <div class="route">
              <span>Register User</span>
              <span class="badge">POST /api/users/</span>
            </div>
            <div class="route">
              <span>Login User</span>
              <span class="badge">POST /api/users/login</span>
            </div>
            <div class="route">
              <span>Refresh Token</span>
              <span class="badge">POST /api/users/refresh-token</span>
            </div>
            <div class="route">
              <span>Get Users List</span>
              <span class="badge">GET /api/users/</span>
            </div>
            <div class="route">
              <span>Get User Details</span>
              <span class="badge">GET /api/users/:id</span>
            </div>
            <div class="route">
              <span>Block User</span>
              <span class="badge">PATCH /api/users/block/:id</span>
            </div>
            <div class="route">
              <span>Unblock User</span>
              <span class="badge">PATCH /api/users/unblock/:id</span>
            </div>
          </div>

          <div class="route-group">
            <h2>📦 Parcel Operations</h2>
            <div class="route">
              <span>Create Parcel</span>
              <span class="badge">POST /api/parcels/</span>
            </div>
            <div class="route">
              <span>Get User Parcels (Sender or Receiver)</span>
              <span class="badge">GET /api/parcels/me</span>
            </div>
            <div class="route">
              <span>Update Parcel Status</span>
              <span class="badge">PATCH /api/parcels/status/:parcelId</span>
            </div>
            <div class="route">
              <span>Cancel Parcel</span>
              <span class="badge">PATCH /api/parcels/cancel/:parcelId</span>
            </div>
            <div class="route">
              <span>Confirm Delivery</span>
              <span class="badge">PATCH /api/parcels/confirm-delivery/:parcelId</span>
            </div>
            <div class="route">
              <span>Block/Unblock Parcel</span>
              <span class="badge">PATCH /api/parcels/block/:parcelId</span>
            </div>
          </div>
        </div>

        <div class="doc-box">
          <h3>📖 Documentation</h3>
          <p>Coming soon: Detailed API docs and Postman collection.</p>
        </div>

        <div class="footer">
          <p>Parcel Management System v1.0.0</p>
          <p>Developed with ❤️ using Node.js, Express, and MongoDB</p>
          <p>Last Updated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFoundRoute_1.notFoundRoute);
exports.default = app;
