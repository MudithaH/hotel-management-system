# Audit Tracking with MySQL Session Variables

## Overview
The audit triggers now use MySQL session variables to dynamically track which staff member performed database operations. This provides accurate audit logging without requiring application code changes in every controller.

## How It Works

### 1. Database Triggers
All audit triggers in `audit_triggers.sql` now use:
```sql
IFNULL(@current_staff_id, 1)
```

This means:
- If `@current_staff_id` is set, use that value
- If not set, default to StaffID = 1

### 2. Middleware Integration
The `authenticateToken` middleware in `authMiddleware.js` automatically sets the session variable:
```javascript
await connection.query('SET @current_staff_id = ?', [req.user.StaffID]);
```

This happens on every authenticated request, ensuring the correct staff ID is tracked.

### 3. Affected Tables
The following operations are automatically tracked with the correct StaffID:
- **guest** (INSERT, UPDATE, DELETE)
- **booking** (INSERT, UPDATE, DELETE)
- **payment** (INSERT)
- **serviceUsage** (INSERT, UPDATE, DELETE)
- **room** (UPDATE - status changes)

### 4. Staff Table Exception
The `staff` table has special handling:
- **INSERT**: Uses `NEW.StaffID` (self-registration)
- **UPDATE**: Uses `NEW.StaffID` (staff updating their own profile)
- **DELETE**: Uses StaffID = 0 (system operation)

## Usage

### Automatic (Recommended)
When using authenticated routes, the session variable is set automatically:
```javascript
// No changes needed - session variable is set by middleware
router.post('/guests', authenticateToken, guestController.createGuest);
```

### Manual (If Needed)
For operations outside authenticated routes:
```javascript
const { pool } = require('./config/db');

async function manualOperation(staffId) {
  const connection = await pool.getConnection();
  try {
    // Set the session variable
    await connection.query('SET @current_staff_id = ?', [staffId]);
    
    // Perform database operations
    await connection.query('INSERT INTO guest ...');
    
    // Audit log will automatically use the correct staffId
  } finally {
    connection.release();
  }
}
```

## Benefits

1. **Automatic Tracking**: No need to pass StaffID to every database operation
2. **Accurate Audit Logs**: Every change is tracked with the correct user
3. **Centralized Logic**: Session variable is set once per request in middleware
4. **Backward Compatible**: Defaults to StaffID = 1 if session variable not set
5. **Error Resilient**: Audit tracking failure doesn't break application functionality

## Querying Audit Logs

View recent audit logs with staff information:
```sql
SELECT 
    al.LogID,
    al.StaffID,
    s.Name as StaffName,
    al.TableName,
    al.Operation,
    al.ChangedAt
FROM AuditLog al
LEFT JOIN staff s ON al.StaffID = s.StaffID
ORDER BY al.ChangedAt DESC
LIMIT 100;
```

View operations by specific staff member:
```sql
SELECT * FROM AuditLog 
WHERE StaffID = 5 
ORDER BY ChangedAt DESC;
```

View operations on specific table:
```sql
SELECT * FROM AuditLog 
WHERE TableName = 'booking' 
ORDER BY ChangedAt DESC;
```

## Applying the Changes

### Step 1: Update Triggers
```bash
mysql -u root -p hotel_management < backend/audit_triggers.sql
```

### Step 2: Restart Backend
The middleware changes are already applied. Just restart your backend:
```bash
cd backend
npm start
```

### Step 3: Test
1. Login as a staff member
2. Perform any operation (create guest, booking, payment, etc.)
3. Check the AuditLog table - it should show the correct StaffID

## Troubleshooting

### Issue: Audit logs show StaffID = 1
**Solution**: Ensure the `authenticateToken` middleware is applied to the route.

### Issue: Connection errors
**Solution**: The middleware catches errors and continues operation even if audit tracking fails.

### Issue: Session variable not persisting
**Solution**: Session variables are per-connection and per-request. This is intentional - each request sets its own value.

## Notes

- Session variables are connection-specific and request-specific
- They automatically reset when the connection is returned to the pool
- This ensures isolation between different user requests
- The default value (1) ensures system still works during development/testing
