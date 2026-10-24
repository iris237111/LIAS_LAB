-- notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- messages
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

-- documents
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;
ALTER TABLE documents ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

-- membership_requests reviewed_by
ALTER TABLE membership_requests DROP CONSTRAINT IF EXISTS membership_requests_reviewed_by_fkey;
ALTER TABLE membership_requests ADD CONSTRAINT membership_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- material_requests
ALTER TABLE material_requests DROP CONSTRAINT IF EXISTS material_requests_requested_by_fkey;
ALTER TABLE material_requests ADD CONSTRAINT material_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE material_requests DROP CONSTRAINT IF EXISTS material_requests_reviewed_by_fkey;
ALTER TABLE material_requests ADD CONSTRAINT material_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- annual_reports
ALTER TABLE annual_reports DROP CONSTRAINT IF EXISTS annual_reports_generated_by_fkey;
ALTER TABLE annual_reports ADD CONSTRAINT annual_reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL;

-- audit_log
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_actor_id_fkey;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;
