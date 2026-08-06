import { UserProfile, Incident, IncidentCategory, InfrastructureTelemetry, PatrolAllocationResult, PatrolUnit } from '../types';
import bcrypt from 'bcryptjs';

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('Sentinel123!', 10);

// Helper to generate dynamic dates
const daysAgo = (days: number, hours: number = 0) => {
  return new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000).toISOString();
};

class InMemoryDBStore {
  public users: UserProfile[] = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      email: 'citizen@sentinel.ai',
      fullName: 'Ananya Sharma',
      role: 'citizen',
      createdAt: new Date().toISOString()
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      email: 'police@sentinel.ai',
      fullName: 'Inspector Rajesh Kumar',
      role: 'police',
      badgeNumber: 'P-8842',
      stationSector: 'Cyberabad Sector 4 - HITEC Hub',
      createdAt: new Date().toISOString()
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      email: 'admin@sentinel.ai',
      fullName: 'Alex Vance (Admin)',
      role: 'admin',
      badgeNumber: 'ADM-001',
      stationSector: 'Hyderabad City Headquarters',
      createdAt: new Date().toISOString()
    }
  ];

  public userPasswords: Record<string, string> = {
    'citizen@sentinel.ai': DEFAULT_PASSWORD_HASH,
    'police@sentinel.ai': DEFAULT_PASSWORD_HASH,
    'admin@sentinel.ai': DEFAULT_PASSWORD_HASH
  };

  public categories: IncidentCategory[] = [
    { id: 'cat-1', name: 'Street Robbery / Theft', code: 'THEFT', baseSeverityWeight: 0.8, description: 'Snatch-and-grab property theft' },
    { id: 'cat-2', name: 'Physical Assault', code: 'ASSAULT', baseSeverityWeight: 1.0, description: 'Physical conflict or violent attack' },
    { id: 'cat-3', name: 'Streetlamp Fault / Dark Zone', code: 'LIGHTING_FAULT', baseSeverityWeight: 0.4, description: 'Broken lighting creating dark zone' },
    { id: 'cat-4', name: 'Vehicle Vandalism', code: 'VANDALISM', baseSeverityWeight: 0.5, description: 'Damage to parked vehicles' },
    { id: 'cat-5', name: 'Suspicious Loitering / Harassment', code: 'HARASSMENT', baseSeverityWeight: 0.6, description: 'Verbal harassment or stalking' }
  ];

  // 35 Incidents across Greater Hyderabad
  public incidents: Incident[] = [
    { id: 'inc-hyd-01', categoryId: 'cat-1', categoryName: 'Street Robbery / Theft', severity: 'high', latitude: 17.4410, longitude: 78.4975, occurredAt: daysAgo(1, 2), status: 'verified', description: 'Chain snatching reported near Secunderabad Metro Exit #2 late night.', piiScrubbed: true, createdAt: daysAgo(1) },
    { id: 'inc-hyd-02', categoryId: 'cat-3', categoryName: 'Streetlamp Fault / Dark Zone', severity: 'medium', latitude: 17.4365, longitude: 78.4690, occurredAt: daysAgo(3, 4), status: 'verified', description: 'Streetlight array outage along 400m Begumpet flyover slip road.', piiScrubbed: true, createdAt: daysAgo(3) },
    { id: 'inc-hyd-03', categoryId: 'cat-5', categoryName: 'Suspicious Loitering / Harassment', severity: 'medium', latitude: 17.4170, longitude: 78.5310, occurredAt: daysAgo(2, 1), status: 'verified', description: 'Harassment reported near Tarnaka bus stand after 22:30.', piiScrubbed: true, createdAt: daysAgo(2) },
    { id: 'inc-hyd-04', categoryId: 'cat-2', categoryName: 'Physical Assault', severity: 'critical', latitude: 17.4480, longitude: 78.3810, occurredAt: daysAgo(4, 5), status: 'verified', description: 'Physical brawl outside Mindspace IT Hub lounge.', piiScrubbed: true, createdAt: daysAgo(4) },
    { id: 'inc-hyd-05', categoryId: 'cat-4', categoryName: 'Vehicle Vandalism', severity: 'low', latitude: 17.4370, longitude: 78.3820, occurredAt: daysAgo(5, 8), status: 'verified', description: 'Vehicle glass broken in open parking area near Inorbit Mall road.', piiScrubbed: true, createdAt: daysAgo(5) },
    { id: 'inc-hyd-06', categoryId: 'cat-1', categoryName: 'Street Robbery / Theft', severity: 'high', latitude: 17.4325, longitude: 78.4080, occurredAt: daysAgo(6, 3), status: 'verified', description: 'Mobile phone theft near Jubilee Hills Road #36 metro pillar.', piiScrubbed: true, createdAt: daysAgo(6) },
    { id: 'inc-hyd-07', categoryId: 'cat-3', categoryName: 'Streetlamp Fault / Dark Zone', severity: 'low', latitude: 17.3620, longitude: 78.4750, occurredAt: daysAgo(7, 2), status: 'pending', description: 'Dark corridor reported in heritage lane near Charminar Laad Bazaar.', piiScrubbed: true, createdAt: daysAgo(7) },
    { id: 'inc-hyd-08', categoryId: 'cat-5', categoryName: 'Suspicious Loitering / Harassment', severity: 'high', latitude: 17.4350, longitude: 78.4480, occurredAt: daysAgo(0, 12), status: 'pending', description: 'Group loitering near Ameerpet metro underpass following commuters.', piiScrubbed: true, createdAt: daysAgo(0, 12) },
    { id: 'inc-hyd-09', categoryId: 'cat-2', categoryName: 'Physical Assault', severity: 'critical', latitude: 17.4420, longitude: 78.3490, occurredAt: daysAgo(0, 18), status: 'verified', description: 'Armed robbery attempt on Gachibowli ORR slip road.', piiScrubbed: true, createdAt: daysAgo(0, 18) },
    { id: 'inc-hyd-10', categoryId: 'cat-1', categoryName: 'Street Robbery / Theft', severity: 'medium', latitude: 17.3910, longitude: 78.4750, occurredAt: daysAgo(2, 6), status: 'resolved', description: 'Pickpocketing reported near Abids commercial market.', piiScrubbed: true, createdAt: daysAgo(2) },
    
    // Additional Hyderabad locations
    { id: 'inc-hyd-11', categoryId: 'cat-1', categoryName: 'Street Robbery / Theft', severity: 'high', latitude: 17.4840, longitude: 78.4100, occurredAt: daysAgo(1, 4), status: 'verified', description: 'Laptop bag snatch theft near Kukatpally KPHB Metro Station.', piiScrubbed: true, createdAt: daysAgo(1) },
    { id: 'inc-hyd-12', categoryId: 'cat-3', categoryName: 'Streetlamp Fault / Dark Zone', severity: 'medium', latitude: 17.4520, longitude: 78.3680, occurredAt: daysAgo(3, 2), status: 'verified', description: 'Unlit street section along Kondapur RTA road.', piiScrubbed: true, createdAt: daysAgo(3) },
    { id: 'inc-hyd-13', categoryId: 'cat-5', categoryName: 'Suspicious Loitering / Harassment', severity: 'low', latitude: 17.4150, longitude: 78.4340, occurredAt: daysAgo(2, 8), status: 'pending', description: 'Suspicious loitering reported near Banjara Hills Road #12 plaza.', piiScrubbed: true, createdAt: daysAgo(2) },
    { id: 'inc-hyd-14', categoryId: 'cat-4', categoryName: 'Vehicle Vandalism', severity: 'medium', latitude: 17.3680, longitude: 78.5250, occurredAt: daysAgo(4, 2), status: 'verified', description: 'Two-wheeler mirror damage reported near Dilsukhnagar bus depot.', piiScrubbed: true, createdAt: daysAgo(4) },
    { id: 'inc-hyd-15', categoryId: 'cat-2', categoryName: 'Physical Assault', severity: 'high', latitude: 17.3980, longitude: 78.5080, occurredAt: daysAgo(5, 10), status: 'verified', description: 'Late night altercation outside Uppal X-Roads eatery.', piiScrubbed: true, createdAt: daysAgo(5) },
    { id: 'inc-hyd-16', categoryId: 'cat-1', categoryName: 'Street Robbery / Theft', severity: 'critical', latitude: 17.4250, longitude: 78.4520, occurredAt: daysAgo(1, 14), status: 'verified', description: 'Jewelry snatching reported near Punjagutta flyover pillar.', piiScrubbed: true, createdAt: daysAgo(1) },
    { id: 'inc-hyd-17', categoryId: 'cat-3', categoryName: 'Streetlamp Fault / Dark Zone', severity: 'high', latitude: 17.3850, longitude: 78.4867, occurredAt: daysAgo(2, 3), status: 'verified', description: 'Dark pedestrian path along Tank Bund Secretariat Road.', piiScrubbed: true, createdAt: daysAgo(2) },
    { id: 'inc-hyd-18', categoryId: 'cat-5', categoryName: 'Suspicious Loitering / Harassment', severity: 'medium', latitude: 17.4010, longitude: 78.4770, occurredAt: daysAgo(3, 6), status: 'pending', description: 'Stalking complaint logged near Basheerbagh press club road.', piiScrubbed: true, createdAt: daysAgo(3) },
    { id: 'inc-hyd-19', categoryId: 'cat-4', categoryName: 'Vehicle Vandalism', severity: 'low', latitude: 17.4435, longitude: 78.3772, occurredAt: daysAgo(6, 1), status: 'resolved', description: 'Car scratching incident in HITEC Cyber Towers visitor lot.', piiScrubbed: true, createdAt: daysAgo(6) },
    { id: 'inc-hyd-20', categoryId: 'cat-2', categoryName: 'Physical Assault', severity: 'high', latitude: 17.4580, longitude: 78.3620, occurredAt: daysAgo(0, 8), status: 'pending', description: 'Assault reported near Hafeezpet flyover underpass.', piiScrubbed: true, createdAt: daysAgo(0, 8) },

    { id: 'inc-hyd-21', categoryId: 'cat-1', categoryName: 'Street Robbery / Theft', severity: 'medium', latitude: 17.4210, longitude: 78.4480, occurredAt: daysAgo(2, 5), status: 'verified', description: 'Purse snatching near Somajiguda Yashoda hospital road.', piiScrubbed: true, createdAt: daysAgo(2) },
    { id: 'inc-hyd-22', categoryId: 'cat-3', categoryName: 'Streetlamp Fault / Dark Zone', severity: 'medium', latitude: 17.4470, longitude: 78.3490, occurredAt: daysAgo(4, 1), status: 'pending', description: 'Streetlamp power failure along Gachibowli Stadium Road.', piiScrubbed: true, createdAt: daysAgo(4) },
    { id: 'inc-hyd-23', categoryId: 'cat-5', categoryName: 'Suspicious Loitering / Harassment', severity: 'high', latitude: 17.3750, longitude: 78.4710, occurredAt: daysAgo(1, 9), status: 'verified', description: 'Harassment reported near Nampally Railway Station gate.', piiScrubbed: true, createdAt: daysAgo(1) },
    { id: 'inc-hyd-24', categoryId: 'cat-2', categoryName: 'Physical Assault', severity: 'critical', latitude: 17.4390, longitude: 78.4420, occurredAt: daysAgo(3, 11), status: 'verified', description: 'Midnight brawl near SR Nagar metro station exit.', piiScrubbed: true, createdAt: daysAgo(3) },
    { id: 'inc-hyd-25', categoryId: 'cat-4', categoryName: 'Vehicle Vandalism', severity: 'low', latitude: 17.4080, longitude: 78.5520, occurredAt: daysAgo(5, 4), status: 'resolved', description: 'Bike fuel theft reported near Habsiguda street #3.', piiScrubbed: true, createdAt: daysAgo(5) },
    { id: 'inc-hyd-26', categoryId: 'cat-1', categoryName: 'Street Robbery / Theft', severity: 'high', latitude: 17.3580, longitude: 78.4710, occurredAt: daysAgo(2, 10), status: 'verified', description: 'Mobile theft in crowded Falaknuma market corridor.', piiScrubbed: true, createdAt: daysAgo(2) },
    { id: 'inc-hyd-27', categoryId: 'cat-3', categoryName: 'Streetlamp Fault / Dark Zone', severity: 'medium', latitude: 17.4610, longitude: 78.3410, occurredAt: daysAgo(4, 8), status: 'pending', description: 'Dark alleyway flagged near Miyapur metro depot road.', piiScrubbed: true, createdAt: daysAgo(4) },
    { id: 'inc-hyd-28', categoryId: 'cat-5', categoryName: 'Suspicious Loitering / Harassment', severity: 'low', latitude: 17.4280, longitude: 78.4120, occurredAt: daysAgo(1, 7), status: 'verified', description: 'Loitering near Jubilee Hills Road #45 park entrance.', piiScrubbed: true, createdAt: daysAgo(1) },
    { id: 'inc-hyd-29', categoryId: 'cat-2', categoryName: 'Physical Assault', severity: 'high', latitude: 17.3620, longitude: 78.5380, occurredAt: daysAgo(3, 12), status: 'verified', description: 'Physical fight near LB Nagar X-Roads bus shelter.', piiScrubbed: true, createdAt: daysAgo(3) },
    { id: 'inc-hyd-30', categoryId: 'cat-1', categoryName: 'Street Robbery / Theft', severity: 'critical', latitude: 17.4560, longitude: 78.3840, occurredAt: daysAgo(0, 5), status: 'pending', description: 'Snatch robbery outside Cyber Towers back gate.', piiScrubbed: true, createdAt: daysAgo(0, 5) },

    { id: 'inc-hyd-31', categoryId: 'cat-3', categoryName: 'Streetlamp Fault / Dark Zone', severity: 'medium', latitude: 17.4210, longitude: 78.5180, occurredAt: daysAgo(2, 14), status: 'verified', description: 'Broken streetlamp poles along Shivam Road Vidyanagar.', piiScrubbed: true, createdAt: daysAgo(2) },
    { id: 'inc-hyd-32', categoryId: 'cat-4', categoryName: 'Vehicle Vandalism', severity: 'low', latitude: 17.4040, longitude: 78.4410, occurredAt: daysAgo(4, 3), status: 'resolved', description: 'Mirror smash on parked vehicle in Khairatabad lane.', piiScrubbed: true, createdAt: daysAgo(4) },
    { id: 'inc-hyd-33', categoryId: 'cat-5', categoryName: 'Suspicious Loitering / Harassment', severity: 'medium', latitude: 17.4320, longitude: 78.4840, occurredAt: daysAgo(1, 11), status: 'pending', description: 'Stalking reported near Paradise Hotel Secunderabad lane.', piiScrubbed: true, createdAt: daysAgo(1) },
    { id: 'inc-hyd-34', categoryId: 'cat-2', categoryName: 'Physical Assault', severity: 'high', latitude: 17.3820, longitude: 78.4740, occurredAt: daysAgo(3, 7), status: 'verified', description: 'Street fight outside Moazam Jahi Market complex.', piiScrubbed: true, createdAt: daysAgo(3) },
    { id: 'inc-hyd-35', categoryId: 'cat-1', categoryName: 'Street Robbery / Theft', severity: 'high', latitude: 17.4490, longitude: 78.3690, occurredAt: daysAgo(0, 4), status: 'pending', description: 'Wallet snatching near Botanica Garden Kondapur exit.', piiScrubbed: true, createdAt: daysAgo(0, 4) }
  ];

  // 22 Infrastructure Telemetry Nodes across Hyderabad
  public infrastructure: InfrastructureTelemetry[] = [
    { id: 'inf-hyd-01', telemetryType: 'police_station', name: 'Cyberabad Police Commissionerate Gachibowli', latitude: 17.4401, longitude: 78.3489, statusScore: 1.0, metadata: { phone: '100', activeOfficers: 25 } },
    { id: 'inf-hyd-02', telemetryType: 'police_station', name: 'Secunderabad North Precinct Station', latitude: 17.4415, longitude: 78.5010, statusScore: 1.0, metadata: { phone: '101', activeOfficers: 16 } },
    { id: 'inf-hyd-03', telemetryType: 'police_station', name: 'Banjara Hills Sector Police Station', latitude: 17.4156, longitude: 78.4347, statusScore: 1.0, metadata: { phone: '102', activeOfficers: 18 } },
    { id: 'inf-hyd-04', telemetryType: 'police_station', name: 'Jubilee Hills Precinct Outpost', latitude: 17.4319, longitude: 78.4072, statusScore: 1.0, metadata: { phone: '103', activeOfficers: 15 } },
    { id: 'inf-hyd-05', telemetryType: 'police_station', name: 'Kukatpally Police Station', latitude: 17.4840, longitude: 78.4110, statusScore: 1.0, metadata: { phone: '104', activeOfficers: 20 } },
    { id: 'inf-hyd-06', telemetryType: 'police_station', name: 'Charminar Heritage Police Precinct', latitude: 17.3616, longitude: 78.4747, statusScore: 1.0, metadata: { phone: '105', activeOfficers: 22 } },

    { id: 'inf-hyd-07', telemetryType: 'hospital', name: 'Osmania General Hospital, Afzal Gunj', latitude: 17.3700, longitude: 78.4795, statusScore: 1.0, metadata: { emergencyBeds: 24, icu: true } },
    { id: 'inf-hyd-08', telemetryType: 'hospital', name: 'NIMS University Hospital Punjagutta', latitude: 17.4250, longitude: 78.4520, statusScore: 1.0, metadata: { emergencyBeds: 20, icu: true } },
    { id: 'inf-hyd-09', telemetryType: 'hospital', name: 'Yashoda Super Specialty Hospital Somajiguda', latitude: 17.4210, longitude: 78.4480, statusScore: 1.0, metadata: { emergencyBeds: 18, icu: true } },
    { id: 'inf-hyd-10', telemetryType: 'hospital', name: 'Apollo Hospitals Jubilee Hills', latitude: 17.4280, longitude: 78.4110, statusScore: 1.0, metadata: { emergencyBeds: 30, icu: true } },
    { id: 'inf-hyd-11', telemetryType: 'hospital', name: 'Continental Hospitals Gachibowli', latitude: 17.4410, longitude: 78.3470, statusScore: 1.0, metadata: { emergencyBeds: 25, icu: true } },

    { id: 'inf-hyd-12', telemetryType: 'cctv', name: 'HITEC City Cyber Towers Safety Cam #101', latitude: 17.4490, longitude: 78.3800, statusScore: 1.0, metadata: { active: true, resolution: '4K' } },
    { id: 'inf-hyd-13', telemetryType: 'cctv', name: 'Secunderabad Metro Junction Cam #204', latitude: 17.4405, longitude: 78.4980, statusScore: 0.95, metadata: { active: true } },
    { id: 'inf-hyd-14', telemetryType: 'cctv', name: 'Jubilee Hills Road #36 Cam Array #308', latitude: 17.4325, longitude: 78.4075, statusScore: 1.0, metadata: { active: true } },
    { id: 'inf-hyd-15', telemetryType: 'cctv', name: 'Begumpet Flyover Interchange Cam #410', latitude: 17.4360, longitude: 78.4685, statusScore: 0.90, metadata: { active: true } },
    { id: 'inf-hyd-16', telemetryType: 'cctv', name: 'Charminar Plaza Traffic Cam #502', latitude: 17.3620, longitude: 78.4750, statusScore: 1.0, metadata: { active: true } },

    { id: 'inf-hyd-17', telemetryType: 'streetlight', name: 'Begumpet LED Array (Dark Zone Fault)', latitude: 17.4365, longitude: 78.4690, statusScore: 0.15, metadata: { darkZone: true } },
    { id: 'inf-hyd-18', telemetryType: 'streetlight', name: 'Tarnaka Metro Dark Corridor Array', latitude: 17.4175, longitude: 78.5315, statusScore: 0.20, metadata: { darkZone: true } },
    { id: 'inf-hyd-19', telemetryType: 'streetlight', name: 'Jubilee Hills Smart Lighting Corridor', latitude: 17.4320, longitude: 78.4065, statusScore: 1.0, metadata: { darkZone: false, lumens: 500 } },
    { id: 'inf-hyd-20', telemetryType: 'streetlight', name: 'Kukatpally Smart Lighting Corridor', latitude: 17.4845, longitude: 78.4105, statusScore: 1.0, metadata: { darkZone: false } },

    { id: 'inf-hyd-21', telemetryType: 'shelter', name: 'Madhapur 24/7 Citizen Safe Haven Hub', latitude: 17.4380, longitude: 78.3830, statusScore: 1.0, metadata: { guardOnDuty: true } },
    { id: 'inf-hyd-22', telemetryType: 'shelter', name: 'Secunderabad Station Citizen Safe Haven', latitude: 17.4402, longitude: 78.4988, statusScore: 1.0, metadata: { guardOnDuty: true } }
  ];

  public patrolAllocations: PatrolAllocationResult[] = [];

  public patrolUnits: PatrolUnit[] = [
    { id: 'unit-401', callsign: 'PATROL-401', commander: 'Inspector Rajesh Kumar', sector: 'Sector 4 - HITEC Hub', status: 'ON PATROL', officerCount: 4, latitude: 17.4435, longitude: 78.3772 },
    { id: 'unit-402', callsign: 'PATROL-402', commander: 'Sub-Inspector Vikram Singh', sector: 'Sector 2 - Secunderabad', status: 'ON PATROL', officerCount: 3, latitude: 17.4399, longitude: 78.4983 },
    { id: 'unit-403', callsign: 'PATROL-403', commander: 'Officer Sunita Rao', sector: 'Sector 3 - Jubilee Hills', status: 'STANDBY', officerCount: 4, latitude: 17.4319, longitude: 78.4072 },
    { id: 'unit-404', callsign: 'PATROL-404', commander: 'Officer Mohammad Ali', sector: 'Sector 1 - Charminar', status: 'DISPATCHED', officerCount: 2, latitude: 17.3616, longitude: 78.4747 },
    { id: 'unit-405', callsign: 'PATROL-405', commander: 'Officer Priya Sharma', sector: 'Sector 5 - Kukatpally', status: 'ON PATROL', officerCount: 3, latitude: 17.4840, longitude: 78.4110 }
  ];
}

export const dbStore = new InMemoryDBStore();
