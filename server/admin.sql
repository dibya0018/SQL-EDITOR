-- Create Admin table
CREATE TABLE admin (
    AdminID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastLogin DATETIME NULL
);

-- Insert default admin user (password: admin123)
INSERT INTO admin (
    Username,
    Password,
    Email,
    FullName
) VALUES (
    'admin',
    'admin123',
    'admin@example.com',
    'System Administrator'
); 

select * from results;