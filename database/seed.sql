-- SentinelAI Seed Data Script (Hyderabad Public Safety Dataset)

-- 1. Insert Categories
INSERT INTO public.incident_categories (id, name, code, base_severity_weight, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Street Robbery / Theft', 'THEFT', 0.80, 'Snatch-and-grab property theft'),
  ('a0000000-0000-0000-0000-000000000002', 'Physical Assault', 'ASSAULT', 1.00, 'Physical conflict or violent attack'),
  ('a0000000-0000-0000-0000-000000000003', 'Streetlamp Fault / Dark Zone', 'LIGHTING_FAULT', 0.40, 'Non-functioning street lighting creating hazard'),
  ('a0000000-0000-0000-0000-000000000004', 'Vehicle Vandalism', 'VANDALISM', 0.50, 'Damage to parked vehicles or property'),
  ('a0000000-0000-0000-0000-000000000005', 'Suspicious Loitering', 'HARASSMENT', 0.60, 'Verbal harassment or stalking behavior')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Test Users
INSERT INTO public.profiles (id, email, password_hash, full_name, role, badge_number, station_sector) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'citizen@sentinel.ai', '$2a$10$w09ZkH.Jj9N52eR7y6k04e3X5Y0H5tY.7lW6S9V0ZgZ.Z8p3G5.5K', 'Ananya Sharma', 'citizen', NULL, NULL),
  ('b0000000-0000-0000-0000-000000000002', 'police@sentinel.ai', '$2a$10$w09ZkH.Jj9N52eR7y6k04e3X5Y0H5tY.7lW6S9V0ZgZ.Z8p3G5.5K', 'Inspector Rajesh Kumar', 'police', 'P-8842', 'Cyberabad Sector 4 - HITEC Hub'),
  ('b0000000-0000-0000-0000-000000000003', 'admin@sentinel.ai', '$2a$10$w09ZkH.Jj9N52eR7y6k04e3X5Y0H5tY.7lW6S9V0ZgZ.Z8p3G5.5K', 'Alex Vance (Admin)', 'admin', 'ADM-001', 'Hyderabad City Headquarters')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Hyderabad Incidents
INSERT INTO public.incidents (id, category_id, severity, latitude, longitude, occurred_at, status, description) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'high', 17.4410, 78.4975, NOW() - INTERVAL '1 day', 'verified', 'Chain snatching reported near Secunderabad Metro Exit #2 late night'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'medium', 17.4365, 78.4690, NOW() - INTERVAL '3 days', 'verified', 'Streetlight array outage along 400m Begumpet flyover slip road'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'medium', 17.4170, 78.5310, NOW() - INTERVAL '2 days', 'verified', 'Harassment reported near Tarnaka bus stand after 22:30'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'critical', 17.4480, 78.3810, NOW() - INTERVAL '4 days', 'verified', 'Physical brawl and assault incident outside Mindspace IT Hub lounge'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'low', 17.4370, 78.3820, NOW() - INTERVAL '5 days', 'verified', 'Vehicle glass broken in open parking area near Inorbit Mall road')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Hyderabad Infrastructure Telemetry
INSERT INTO public.infrastructure_telemetry (telemetry_type, name, latitude, longitude, status_score, metadata) VALUES
  ('police_station', 'Cyberabad Police Commissionerate Gachibowli', 17.4401, 78.3489, 1.00, '{"phone": "100", "activeOfficers": 25}'::jsonb),
  ('police_station', 'Secunderabad North Precinct Station', 17.4415, 78.5010, 1.00, '{"phone": "101", "activeOfficers": 16}'::jsonb),
  ('hospital', 'Osmania General Hospital, Afzal Gunj', 17.3700, 78.4795, 1.00, '{"emergencyBeds": 24, "icu": true}'::jsonb),
  ('cctv', 'HITEC City Cyber Towers Safety Cam #101', 17.4490, 78.3800, 1.00, '{"active": true}'::jsonb),
  ('cctv', 'Secunderabad Metro Junction Cam #204', 17.4405, 78.4980, 0.95, '{"active": true}'::jsonb),
  ('streetlight', 'Begumpet LED Array (Dark Zone Fault)', 17.4365, 78.4690, 0.15, '{"darkZone": true}'::jsonb),
  ('shelter', 'Madhapur 24/7 Citizen Safe Haven Hub', 17.4380, 78.3830, 1.00, '{"guardOnDuty": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;
