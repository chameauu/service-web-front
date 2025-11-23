# IoT Dashboard

A comprehensive web-based IoT Dashboard for monitoring and managing IoT devices with real-time telemetry visualization.

## Features

### User Management
- User authentication with email and password
- User registration with account creation
- Role-based access control (User/Admin)

### Device Management
- View list of user devices with status indicators
- Register new devices with API key generation
- Edit device information
- Delete devices
- View device details and telemetry data

### Telemetry & Charts
- Real-time telemetry visualization with Recharts
- Device details page with live sensor data
- Time range filtering (Last Hour, Last 24 Hours, Last 7 Days, Last 30 Days)
- Manual chart refresh capability

### Custom Charts
- Create custom charts with multiple devices
- Select specific measurements to display
- Choose chart types (Line, Bar, Area)
- Save chart configurations
- Edit existing charts
- Delete charts
- View and manage saved charts

### Admin Dashboard
- View all users in the system
- View all devices across all users
- Manage user accounts
- Monitor platform-wide device status

### Responsive Design
- Mobile-first design approach
- Responsive layout for all screen sizes
- Touch-friendly interface
- Adaptive navigation

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

## API Integration

The dashboard integrates with a Flask backend API with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Devices
- `GET /devices/user/{user_id}` - Get user devices
- `GET /devices/{device_id}` - Get device details
- `POST /devices/register` - Register new device
- `PUT /devices/{device_id}` - Update device
- `DELETE /devices/{device_id}` - Delete device

### Telemetry
- `GET /telemetry/{device_id}` - Get device telemetry data

### Charts
- `GET /charts?user_id={user_id}` - Get user charts
- `GET /charts/{chart_id}` - Get chart details
- `POST /charts` - Create chart
- `PUT /charts/{chart_id}` - Update chart
- `DELETE /charts/{chart_id}` - Delete chart
- `GET /charts/{chart_id}/data` - Get chart data

### Admin
- `GET /admin/users` - Get all users
- `GET /admin/devices` - Get all devices

## Setup Instructions

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set environment variables:
   \`\`\`bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

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

## Future Enhancements

- Real-time WebSocket updates
- Advanced data filtering and search
- User profile management
- Email notifications
- Data export capabilities
- Batch device operations
- Custom user roles and permissions
- Multi-language support
