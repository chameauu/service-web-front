# IoTFlow Dashboard

A comprehensive web-based IoT Dashboard for monitoring and managing IoT devices with real-time telemetry visualization and device grouping capabilities.

## ✨ Features

### 🔐 User Management
- User authentication with username and password
- User registration with account creation
- Role-based access control (User/Admin)
- Admin can view and manage all users
- User activation/deactivation (soft delete)
- User deletion (permanent)

### 📱 Device Management
- View list of devices with status indicators
- **Admin users see all devices system-wide**
- **Regular users see only their devices**
- Register new devices with API key generation
- Edit device information
- Delete devices
- View device details and telemetry data
- Color-coded status badges (Online, Offline, Maintenance)

### 📊 Telemetry Visualization
- Real-time telemetry visualization with Recharts
- Device details page with live sensor data
- Time range filtering (Last Hour, Last 24 Hours, Last 7 Days, Last 30 Days)
- Manual chart refresh capability
- Latest telemetry readings
- Aggregated telemetry data

### 📦 Device Groups (NEW)
- **Create groups** to organize devices (by location, type, or purpose)
- **Filter devices by group** on dashboard and devices pages
- **Add/remove devices** from groups with visual feedback
- **Color-coded groups** with 8 preset colors
- **Group count badges** showing device membership
- **Modal-based UI** for better user experience
- **Real-time updates** when groups change

### 👥 Admin Dashboard
- View all users in the system with details
- View all devices across all users
- **Activate/deactivate users** (soft delete)
- **Delete users** permanently
- Manage user accounts
- Monitor platform-wide device status
- System statistics and metrics

### 🎨 Responsive Design
- Mobile-first design approach
- Responsive layout for all screen sizes
- Touch-friendly interface
- Adaptive navigation
- Modal dialogs for better UX

## Architecture

### Frontend
- Next.js 15+ with App Router
- React 19.2+ with Server Components
- TypeScript for type safety
- Tailwind CSS v4 for styling
- Recharts for data visualization

### Components
- Modular component structure
- Reusable UI components from shadcn/ui
- Layout components for consistent navigation

### State Management
- React hooks for component state
- localStorage for authentication persistence

## 🔌 API Integration

The dashboard integrates with a Flask backend API (41 endpoints):

### Authentication (3 endpoints)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### User Management (4 endpoints)
- `GET /api/v1/users` - List all users (admin)
- `GET /api/v1/users/{user_id}` - Get user details
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user (admin)
- `PATCH /api/v1/users/{user_id}/deactivate` - Deactivate user (admin)
- `PATCH /api/v1/users/{user_id}/activate` - Activate user (admin)

### Device Management (9 endpoints)
- `POST /api/v1/devices/register` - Register new device
- `GET /api/v1/devices/user/{user_id}` - Get user's devices
- `GET /api/v1/devices/{device_id}/status` - Get device status
- `PUT /api/v1/devices/config` - Update device config
- `GET /api/v1/devices/status` - Get device status (device-side)
- `POST /api/v1/devices/heartbeat` - Send heartbeat (device-side)
- `GET /api/v1/devices/credentials` - Get device credentials
- `GET /api/v1/devices/{device_id}/groups` - Get device's groups

### Telemetry (7 endpoints)
- `POST /api/v1/telemetry` - Submit telemetry data
- `GET /api/v1/telemetry/{device_id}` - Get telemetry history
- `GET /api/v1/telemetry/{device_id}/latest` - Get latest telemetry
- `GET /api/v1/telemetry/{device_id}/aggregated` - Get aggregated data
- `DELETE /api/v1/telemetry/{device_id}` - Delete telemetry
- `GET /api/v1/telemetry/status` - Telemetry service status
- `GET /api/v1/telemetry/user/{user_id}` - Get user's telemetry

### Device Groups (10 endpoints)
- `POST /api/v1/groups` - Create group
- `GET /api/v1/groups` - List user's groups
- `GET /api/v1/groups/{id}` - Get group details
- `PUT /api/v1/groups/{id}` - Update group
- `DELETE /api/v1/groups/{id}` - Delete group
- `POST /api/v1/groups/{id}/devices` - Add device to group
- `DELETE /api/v1/groups/{id}/devices/{device_id}` - Remove device from group
- `GET /api/v1/groups/{id}/devices` - List group's devices
- `POST /api/v1/groups/{id}/devices/bulk` - Bulk add devices

### Admin (6 endpoints)
- `GET /api/v1/admin/devices` - List all devices
- `GET /api/v1/admin/devices/statuses` - Get all device statuses
- `GET /api/v1/admin/devices/{id}` - Get device details
- `PUT /api/v1/admin/devices/{id}/status` - Update device status
- `DELETE /api/v1/admin/devices/{id}` - Delete device
- `GET /api/v1/admin/stats` - System statistics

### Health & Status (3 endpoints)
- `GET /health` - Health check
- `GET /status` - System status
- `GET /` - API information

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Backend API running on port 5000

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Set environment variables:**
   
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm build
pnpm start
```

### Run Tests

```bash
pnpm test          # Run tests in watch mode
pnpm test:run      # Run tests once
pnpm test:ui       # Run tests with UI
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API endpoint

## Design System

### Color Scheme
- **Primary**: Blue (#4A90E2)
- **Status Online**: Green
- **Status Offline**: Red
- **Status Maintenance**: Yellow
- **Background**: Light gray (#F8F9FA)
- **Text**: Dark gray (#2C3E50)

### Typography
- Font: Geist sans-serif
- Headings: Bold, 24px-48px
- Body text: Regular, 14px-16px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests:** 20 tests for API utilities
- **Integration Tests:** 16 tests for API endpoints
- **Device Groups Tests:** 9 tests for group functionality
- **Chart Removal Tests:** 4 tests for cleanup verification

**Total:** 49 tests with 100% pass rate on implemented features

Run tests with:
```bash
pnpm test:run
```

## 📁 Project Structure

```
iotflow_front/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin pages
│   │   └── users/          # User management
│   ├── dashboard/          # Main dashboard
│   ├── devices/            # Devices list page
│   ├── device/[id]/        # Device detail page
│   └── register/           # User registration
├── components/              # React components
│   ├── devices/            # Device-related components
│   │   ├── group-filter.tsx
│   │   ├── create-group-modal.tsx
│   │   └── add-to-group-button.tsx
│   ├── layout/             # Layout components
│   └── ui/                 # UI components (shadcn/ui)
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
│   ├── api.ts              # API client (31 functions)
│   └── __tests__/          # Test files
└── public/                  # Static assets
```

## 🔑 Authentication

The dashboard uses **admin token authentication** for protected endpoints:

- **Public endpoints:** No authentication (login, register)
- **User endpoints:** `X-User-ID` header with user UUID
- **Device endpoints:** `X-API-Key` header with device API key
- **Admin endpoints:** `Authorization: admin test` header

## 🎨 UI Components

Built with **shadcn/ui** components:
- Buttons, Cards, Dialogs, Modals
- Forms, Inputs, Selects
- Tables, Badges, Tooltips
- Responsive navigation
- Loading states and skeletons

## 📝 Recent Updates (November 2025)

### Added
- ✅ Device Groups feature (10 endpoints)
- ✅ Group filtering on dashboard and devices pages
- ✅ Admin sees all devices system-wide
- ✅ User activation/deactivation
- ✅ Group count badges on devices
- ✅ Modal-based group management
- ✅ Color-coded groups with 8 presets

### Removed
- ❌ Charts page (backend endpoints not available)
- ❌ JWT authentication (simplified to admin token)

### Changed
- 🔄 Simplified authentication (admin token only)
- 🔄 Improved error handling
- 🔄 Better loading states
- 🔄 Enhanced UI/UX with modals

## 🐛 Known Issues

- User deletion works but list refresh may fail (backend authentication issue)
- Chart endpoints return 404 (backend not implemented)

## 🚀 Future Enhancements

### Planned
- Real-time WebSocket updates
- Advanced data filtering and search
- User profile management
- Email notifications
- Data export capabilities
- Batch device operations

### Possible
- Group hierarchy (parent/child groups)
- Smart groups (auto-add by rules)
- Group-based alerts
- Custom user roles and permissions
- Multi-language support
- Dark mode

## 📄 License

This project is part of the IoTFlow platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test:run`
5. Submit a pull request

## 📞 Support

For issues and questions, please check the documentation in the `/docs` folder or create an issue in the repository.
