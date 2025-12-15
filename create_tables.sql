-- Add expense categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  userId INT NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_expense_categories_user_name (userId, name)
);

-- Add expenses table (expense summaries)
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NULL,
  userId INT NOT NULL,
  note TEXT NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_expenses_assignment (assignment_id),
  INDEX idx_expenses_user (userId),
  CONSTRAINT fk_expenses_assignment FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE SET NULL
);

-- Add expense_items table (individual expense items)
CREATE TABLE IF NOT EXISTS expense_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expense_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  category VARCHAR(255) NULL,
  date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expense_items_expense (expense_id),
  CONSTRAINT fk_expense_items_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);
