-- Email Template System Database Schema
-- This system uses a two-table structure:
-- 1. email_template_layouts: Store reusable header/footer combinations
-- 2. email_templates: Store individual email bodies that reference a layout

-- Table for storing email layouts (header + footer combinations)
CREATE TABLE `email_template_layouts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `locale` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,           -- Layout name, e.g. "Default", "Marketing", "Transactional"
  `header_html` text NOT NULL,
  `footer_html` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_locale_name` (`locale`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing individual email templates
CREATE TABLE `email_templates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,           -- Template code, e.g. 'welcome_email'
  `locale` varchar(10) NOT NULL,
  `layout_id` int unsigned NOT NULL,      -- References email_template_layouts(id)
  `subject` varchar(255) DEFAULT NULL,
  `body_html` text NOT NULL,
  `is_auto_translated` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_code_locale` (`code`, `locale`),
  CONSTRAINT `fk_email_template_layout`
      FOREIGN KEY (`layout_id`) REFERENCES `email_template_layouts` (`id`)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for layouts
INSERT INTO `email_template_layouts` (`locale`, `name`, `header_html`, `footer_html`) VALUES
('en', 'Default', 
 '<!DOCTYPE html><html><head><meta charset="utf-8"><title>{{subject}}</title></head><body style="font-family: Arial, sans-serif;"><div style="max-width: 600px; margin: 0 auto;"><header style="background: #f8f9fa; padding: 20px; text-align: center;"><h1 style="color: #333;">PetsBook</h1></header><main style="padding: 20px;">',
 '</main><footer style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;"><p>&copy; 2024 PetsBook. All rights reserved.</p><p>If you no longer wish to receive these emails, you can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p></footer></div></body></html>'),

('en', 'Marketing', 
 '<!DOCTYPE html><html><head><meta charset="utf-8"><title>{{subject}}</title></head><body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><div style="max-width: 600px; margin: 0 auto; background: white;"><header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;"><h1 style="color: white; margin: 0;">🐾 PetsBook</h1><p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Where pets and people connect</p></header><main style="padding: 30px;">',
 '</main><footer style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;"><p>&copy; 2024 PetsBook. All rights reserved.</p><p><a href="{{unsubscribe_url}}" style="color: #667eea;">Unsubscribe</a> | <a href="{{preferences_url}}" style="color: #667eea;">Email Preferences</a></p></footer></div></body></html>');

-- Sample data for templates
INSERT INTO `email_templates` (`code`, `locale`, `layout_id`, `subject`, `body_html`, `is_auto_translated`) VALUES
('welcome_email', 'en', 1, 'Welcome to PetsBook!', 
 '<h2>Welcome to PetsBook, {{user_name}}!</h2><p>We''re excited to have you join our community of pet lovers. Here''s what you can do next:</p><ul><li>Complete your profile</li><li>Add your pets</li><li>Connect with other pet owners</li></ul><p>If you have any questions, don''t hesitate to reach out to our support team.</p><p>Happy pet networking!</p><p>The PetsBook Team</p>', 
 0),

('password_reset', 'en', 1, 'Reset Your Password', 
 '<h2>Password Reset Request</h2><p>Hi {{user_name}},</p><p>We received a request to reset your password. Click the button below to create a new password:</p><p style="text-align: center; margin: 30px 0;"><a href="{{reset_url}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p><p>This link will expire in 24 hours. If you didn''t request this password reset, please ignore this email.</p><p>Best regards,<br>The PetsBook Team</p>', 
 0); 