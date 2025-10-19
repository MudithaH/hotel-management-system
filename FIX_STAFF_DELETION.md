# Fix: Staff Deletion Foreign Key Constraint Error

## Problem
When trying to delete staff members, you receive this error:
```
Cannot delete or update a parent row: a foreign key constraint fails 
(`hotel_management`.`auditlog`, CONSTRAINT `auditlog_ibfk_1` 
FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`))
```

## Root Cause
The `AuditLog` table has a foreign key constraint on `StaffID` that prevents deletion of staff members who have audit log entries. This is because the original constraint didn't specify what to do when a referenced staff member is deleted.

## Solution
Modify the foreign key constraint to use `ON DELETE SET NULL`, which allows staff deletion while preserving audit history. When a staff member is deleted, their `StaffID` in the audit logs becomes `NULL` rather than causing an error.

## How to Apply the Fix

### Option 1: Run the Migration Script (Recommended)
```bash
# From the project root
mysql -u root -p hotel_management < backend/fix_auditlog_foreign_key.sql
```

### Option 2: Run Commands Manually
Connect to MySQL and run:
```sql
USE hotel_management;

-- Drop existing constraint
ALTER TABLE `AuditLog` 
DROP FOREIGN KEY `auditlog_ibfk_1`;

-- Make StaffID nullable
ALTER TABLE `AuditLog` 
MODIFY COLUMN `StaffID` int NULL;

-- Add constraint with ON DELETE SET NULL
ALTER TABLE `AuditLog`
ADD CONSTRAINT `auditlog_ibfk_1` 
FOREIGN KEY (`StaffID`) 
REFERENCES `staff`(`StaffID`)
ON DELETE SET NULL
ON UPDATE CASCADE;
```

## After Applying the Fix

### Staff Can Now Be Deleted
- Staff members can be deleted without constraint errors
- Their audit logs remain in the database (with `StaffID = NULL`)
- Historical data is preserved for compliance and auditing

### Querying Audit Logs
When querying audit logs, use `LEFT JOIN` to show deleted staff:

```sql
SELECT 
    al.AuditID,
    COALESCE(s.Name, '[Deleted Staff]') as StaffName,
    al.StaffID,
    al.TableName,
    al.Operation,
    al.ChangedAt
FROM AuditLog al
LEFT JOIN staff s ON al.StaffID = s.StaffID
ORDER BY al.ChangedAt DESC
LIMIT 100;
```

### Updated Files
1. `backend/fix_auditlog_foreign_key.sql` - Migration script (NEW)
2. `backend/schema.sql` - Updated for future deployments
3. This document

## Verification
After running the migration, verify the change:
```sql
SHOW CREATE TABLE AuditLog;
```

You should see:
```sql
FOREIGN KEY (`StaffID`) REFERENCES `staff` (`StaffID`) 
ON DELETE SET NULL ON UPDATE CASCADE
```

## Notes
- This change is backward compatible
- Existing audit logs are preserved
- The `@current_staff_id` session variable can still be NULL for unauthenticated operations
- Consider updating your admin UI to show "[Deleted Staff]" for NULL StaffIDs in audit reports
