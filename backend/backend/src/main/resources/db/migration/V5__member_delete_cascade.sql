-- affiliations
ALTER TABLE affiliations DROP CONSTRAINT IF EXISTS affiliations_member_id_fkey;
ALTER TABLE affiliations ADD CONSTRAINT affiliations_member_id_fkey FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- roles_history
ALTER TABLE roles_history DROP CONSTRAINT IF EXISTS roles_history_member_id_fkey;
ALTER TABLE roles_history ADD CONSTRAINT roles_history_member_id_fkey FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- event_participants
ALTER TABLE event_participants DROP CONSTRAINT IF EXISTS event_participants_member_id_fkey;
ALTER TABLE event_participants ADD CONSTRAINT event_participants_member_id_fkey FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- publications
ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_added_by_fkey;
ALTER TABLE publications ADD CONSTRAINT publications_added_by_fkey FOREIGN KEY (added_by) REFERENCES members(id) ON DELETE SET NULL;

-- material_distributions
ALTER TABLE material_distributions DROP CONSTRAINT IF EXISTS material_distributions_member_id_fkey;
ALTER TABLE material_distributions ADD CONSTRAINT material_distributions_member_id_fkey FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE material_distributions DROP CONSTRAINT IF EXISTS material_distributions_distributed_by_fkey;
ALTER TABLE material_distributions ADD CONSTRAINT material_distributions_distributed_by_fkey FOREIGN KEY (distributed_by) REFERENCES members(id) ON DELETE SET NULL;

-- meetings
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_created_by_fkey;
ALTER TABLE meetings ADD CONSTRAINT meetings_created_by_fkey FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE SET NULL;

-- mandates
ALTER TABLE mandates DROP CONSTRAINT IF EXISTS mandates_director_id_fkey;
ALTER TABLE mandates ADD CONSTRAINT mandates_director_id_fkey FOREIGN KEY (director_id) REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE mandates DROP CONSTRAINT IF EXISTS mandates_vice_director_id_fkey;
ALTER TABLE mandates ADD CONSTRAINT mandates_vice_director_id_fkey FOREIGN KEY (vice_director_id) REFERENCES members(id) ON DELETE SET NULL;

-- team_chiefs
ALTER TABLE team_chiefs DROP CONSTRAINT IF EXISTS team_chiefs_member_id_fkey;
ALTER TABLE team_chiefs ADD CONSTRAINT team_chiefs_member_id_fkey FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;
