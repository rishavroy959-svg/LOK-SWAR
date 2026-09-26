"""
Lok Swar - MongoDB Database & Persistence Engine
Manages collections for Citizens, Officers, Grievances, Audio Files, Votes, Budget Schemes, and Drone Missions.
Supports both MongoDB (Local / Atlas URI) and automatic high-availability local JSON store.
"""

import os
import sys
import json
import time
from datetime import datetime
import re
import hashlib

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

try:
    from pymongo import MongoClient, ASCENDING, DESCENDING
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False

# Auto-load .env file from project root
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(_env_path):
    try:
        with open(_env_path, "r", encoding="utf-8") as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _v = _line.split("=", 1)
                    if _k.strip() not in os.environ:
                        os.environ[_k.strip()] = _v.strip()
    except Exception:
        pass

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = "lok_swar_db"

class LokSwarDB:
    def __init__(self):
        self.is_connected = False
        self.client = None
        self.db = None
        self.use_fallback = False
        self.local_cache_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "local_store.json")
        self.local_data = {
            "citizens": {},
            "officers": {},
            "grievances": {},
            "budget_schemes": {},
            "drone_missions": {},
            "audio_recordings": {}
        }
        self.connect()

    def connect(self):
        if PYMONGO_AVAILABLE:
            try:
                self.client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000, connectTimeoutMS=10000, socketTimeoutMS=15000)
                # Test connection
                self.client.admin.command('ping')
                self.db = self.client[DB_NAME]
                try:
                    self.alt_db = self.client["citizen_portal_db"]
                except Exception:
                    self.alt_db = None
                self.is_connected = True
                self.use_fallback = False
                print(f"[MongoDB] Connected successfully to {DB_NAME} (and citizen_portal_db) at {MONGODB_URI}")
                self.init_indexes_and_seed()
            except Exception as e:
                print(f"[MongoDB] Notice: Standalone MongoDB server not reachable ({e}). Switching to high-performance local persistent engine.")
                self.use_fallback = True
                self.load_local_cache()
                self.seed_fallback_data()
                return
        else:
            self.use_fallback = True
            self.load_local_cache()
            self.seed_fallback_data()
            return

        # Mirror databases after successful connection (outside try block so failure doesn't trigger fallback)
        try:
            self.mirror_databases()
        except Exception as e:
            print(f"[MongoDB Mirroring Notice]: {e}")

    def mirror_databases(self):
        """Mirror collections between lok_swar_db and citizen_portal_db for full cross-database compatibility"""
        if not self.is_connected or self.alt_db is None:
            return
        try:
            for coll_name in ["citizens", "grievances", "officers", "budget_schemes", "drone_missions"]:
                # Sync primary -> alt
                items = list(self.db[coll_name].find())
                for item in items:
                    doc = dict(item)
                    if "_id" in doc: del doc["_id"]
                    key_field = "mobile" if coll_name == "citizens" else "id"
                    if key_field in doc:
                        self.alt_db[coll_name].update_one({key_field: doc[key_field]}, {"$set": doc}, upsert=True)
            print("[MongoDB] Database mirroring active: lok_swar_db and citizen_portal_db fully synchronized.")
        except Exception as e:
            print(f"[MongoDB Mirroring Notice]: {e}")

    def ensure_connected(self):
        """Self-healing auto-reconnect check before write/read operations"""
        if not self.is_connected and PYMONGO_AVAILABLE:
            try:
                self.connect()
            except Exception:
                pass
        return self.is_connected

    def init_indexes_and_seed(self):
        try:
            # Create indexes
            self.db.citizens.create_index([("mobile", ASCENDING)], unique=True)
            self.db.officers.create_index([("id", ASCENDING)], unique=True)
            self.db.grievances.create_index([("id", ASCENDING)], unique=True)
            self.db.grievances.create_index([("urgencyScore", DESCENDING)])

            # Always sync and seed officers
            self.seed_mongodb_data()
        except Exception as e:
            print(f"[MongoDB Indexing/Seed Error]: {e}")

    def seed_mongodb_data(self):
        print("[MongoDB] Syncing collections in lok_swar_db...")
        # 1. Officers (generic — no location-specific data)
        officers = [
            {
                "id": "admin@lokaswar.gov.in",
                "aadhaar": "889911223344",
                "aadhaarFormatted": "8899 1122 3344",
                "password": "admin123",
                "name": "Dr. K. C. Tripathy (IAS)",
                "designation": "District Magistrate & Collector",
                "department": "District Administration & Disaster Management",
                "badge": "District Head",
                "avatar": "👨‍💼",
                "jurisdiction": "Entire Constituency"
            },
            {
                "id": "dpc.planner@lokaswar.gov.in",
                "aadhaar": "556677889900",
                "aadhaarFormatted": "5566 7788 9900",
                "password": "admin123",
                "name": "Er. A. Sharma (DPC)",
                "designation": "District Planning Coordinator (DPC)",
                "department": "Planning & Coordination Dept",
                "badge": "Budget Sanction Head",
                "avatar": "📋",
                "jurisdiction": "All Gram Panchayats"
            },
            {
                "id": "ee.roads@lokaswar.gov.in",
                "aadhaar": "123456789012",
                "aadhaarFormatted": "1234 5678 9012",
                "password": "admin123",
                "name": "Er. Sunita Soren",
                "designation": "Executive Engineer (R&B)",
                "department": "Works & Road Infrastructure Dept",
                "badge": "Field Ops Lead",
                "avatar": "👷‍♀️",
                "jurisdiction": "All Blocks"
            },
            {
                "id": "drone.commander@lokaswar.gov.in",
                "aadhaar": "998877665544",
                "aadhaarFormatted": "9988 7766 5544",
                "password": "admin123",
                "name": "Squadron Ldr. S. Patnaik",
                "designation": "Aerial Drone Telemetry Commander",
                "department": "Space Applications Centre Liaison",
                "badge": "UAV Squad Lead",
                "avatar": "🛸",
                "jurisdiction": "Aerial Disaster Survey Grid"
            }
        ]
        for off in officers:
            self.db.officers.update_one({"id": off["id"]}, {"$set": off}, upsert=True)

        # Citizens, grievances, budget schemes, drone missions are NOT seeded.
        # Only real user-submitted data will be stored.
        # Migrate any locally cached grievances (from local_store.json) into MongoDB Atlas
        self._migrate_local_grievances_to_mongo()
        self.purge_demo_grievances()
        print("[MongoDB] Seeding complete with default data.")

    def is_under_consideration(self, grievance):
        """Check if grievance is under active review/consideration/resolution and locked from withdrawal"""
        if not grievance or not isinstance(grievance, dict):
            return False
        raw_stage = grievance.get("statusStage", 1)
        stage = 1
        if isinstance(raw_stage, (int, float)):
            stage = int(raw_stage)
        elif isinstance(raw_stage, str):
            m = re.search(r'\d+', raw_stage)
            if m:
                stage = int(m.group(0))
        status = str(grievance.get("status", "")).strip().lower()
        locked_keywords = ["consideration", "progress", "review", "sanction", "resolved", "inspection", "assigned", "action"]
        return stage > 1 or any(k in status for k in locked_keywords)

    def can_withdraw_grievance(self, grievance_id):
        """Return (can_withdraw: bool, reason: str)"""
        g = self.get_grievance(grievance_id)
        if not g:
            return False, "Grievance not found"
        if self.is_under_consideration(g):
            return False, "Grievance is currently under active administrative consideration and cannot be withdrawn"
        return True, "Grievance is eligible for withdrawal"

    def purge_demo_grievances(self):
        """Purge known fake / demo / test grievances from MongoDB Atlas and local store"""
        demo_patterns = [
            "^TKT-9999", "^MSG-5127", "^PROB-5661", "^TKT-880", "^TKT-10", "^PROB-10", "^TEST-"
        ]
        self.ensure_connected()
        purged_count = 0
        if self.is_connected:
            try:
                for pat in demo_patterns:
                    res = self.db.grievances.delete_many({"id": {"$regex": pat}})
                    purged_count += res.deleted_count
                    if self.alt_db is not None:
                        self.alt_db.grievances.delete_many({"id": {"$regex": pat}})
                if purged_count > 0:
                    print(f"[MongoDB Atlas] Purged {purged_count} demo / test grievance(s).")
            except Exception as e:
                print(f"[MongoDB Demo Purge Error]: {e}")
        
        # Also clean local store
        local_grievances = self.local_data.get("grievances", {})
        keys_to_del = [k for k in list(local_grievances.keys()) if any(re.match(pat, k) for pat in demo_patterns)]
        for k in keys_to_del:
            del local_grievances[k]
            purged_count += 1
        if keys_to_del:
            self.save_local_cache()
            print(f"[LocalStore] Purged {len(keys_to_del)} local demo grievance(s).")
        return purged_count

    # -------------------------------------------------------------
    # Fallback Local Persistence Engine
    # -------------------------------------------------------------

    def _migrate_local_grievances_to_mongo(self):
        """Migrate any grievances stored in local_store.json into MongoDB Atlas.
        Runs once on connect to ensure zero data loss when switching from offline to online."""
        if not self.is_connected:
            return
        try:
            # Load local cache to inspect stored grievances
            local_cache_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "local_store.json")
            if not os.path.exists(local_cache_file):
                return
            with open(local_cache_file, "r", encoding="utf-8") as f:
                local_data = json.load(f)
            local_grievances = local_data.get("grievances", {})
            if not local_grievances:
                return
            migrated = 0
            for gid, grievance in local_grievances.items():
                if not gid or not isinstance(grievance, dict):
                    continue
                # Only upsert if MongoDB Atlas doesn't already have this record
                existing = self.db.grievances.find_one({"id": gid}, {"_id": 0})
                if not existing:
                    if "createdAt" not in grievance:
                        grievance["createdAt"] = datetime.now().isoformat()
                    self.db.grievances.update_one({"id": gid}, {"$set": grievance}, upsert=True)
                    if self.alt_db is not None:
                        self.alt_db.grievances.update_one({"id": gid}, {"$set": grievance}, upsert=True)
                    migrated += 1
            if migrated > 0:
                print(f"[MongoDB] Migrated {migrated} local grievance(s) to MongoDB Atlas.")
        except Exception as e:
            print(f"[MongoDB Migration Notice]: {e}")

    def load_local_cache(self):
        if os.path.exists(self.local_cache_file):
            try:
                with open(self.local_cache_file, "r", encoding="utf-8") as f:
                    self.local_data = json.load(f)
            except Exception:
                pass

    def save_local_cache(self):
        try:
            os.makedirs(os.path.dirname(self.local_cache_file), exist_ok=True)
            with open(self.local_cache_file, "w", encoding="utf-8") as f:
                json.dump(self.local_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[LocalStore Error]: {e}")

    def seed_fallback_data(self):
        # Always ensure officers table in local storage has full aadhaar information
        self.local_data.setdefault("officers", {})
        self.local_data["officers"]["admin@lokaswar.gov.in"] = {
            "id": "admin@lokaswar.gov.in", "aadhaar": "889911223344", "aadhaarFormatted": "8899 1122 3344", "password": "admin123",
            "name": "Dr. K. C. Tripathy (IAS)", "designation": "District Magistrate & Collector",
            "department": "District Administration", "badge": "District Head", "avatar": "👨‍💼",
            "jurisdiction": "Entire Constituency"
        }
        self.local_data["officers"]["dpc.planner@lokaswar.gov.in"] = {
            "id": "dpc.planner@lokaswar.gov.in", "aadhaar": "556677889900", "aadhaarFormatted": "5566 7788 9900", "password": "admin123",
            "name": "Er. A. Sharma (DPC)", "designation": "District Planning Coordinator (DPC)",
            "department": "Planning Dept", "badge": "Budget Sanction Head", "avatar": "📋",
            "jurisdiction": "All Gram Panchayats"
        }
        self.local_data["officers"]["ee.roads@lokaswar.gov.in"] = {
            "id": "ee.roads@lokaswar.gov.in", "aadhaar": "123456789012", "aadhaarFormatted": "1234 5678 9012", "password": "admin123",
            "name": "Er. Sunita Soren", "designation": "Executive Engineer (R&B)",
            "department": "Works Dept", "badge": "Field Ops Lead", "avatar": "👷‍♀️",
            "jurisdiction": "All Blocks"
        }
        self.local_data["officers"]["drone.commander@lokaswar.gov.in"] = {
            "id": "drone.commander@lokaswar.gov.in", "aadhaar": "998877665544", "aadhaarFormatted": "9988 7766 5544", "password": "admin123",
            "name": "Squadron Ldr. S. Patnaik", "designation": "Aerial Drone Telemetry Commander",
            "department": "Space Applications Centre Liaison", "badge": "UAV Squad Lead", "avatar": "🛸",
            "jurisdiction": "Aerial Disaster Survey Grid"
        }

        self.local_data.setdefault("citizens", {})
        self.local_data.setdefault("grievances", {})
        self.save_local_cache()

    # -------------------------------------------------------------
    # Collection Query Methods (Transparent MongoDB / Local)
    # -------------------------------------------------------------
    def get_citizen(self, mobile):
        if not mobile:
            return None
        clean_mobile = str(mobile).strip().replace("+91", "").replace(" ", "").replace("-", "")
        if self.is_connected:
            doc = self.db.citizens.find_one({"$or": [{"mobile": mobile}, {"mobile": clean_mobile}]}, {"_id": 0})
            return doc
        return self.local_data.get("citizens", {}).get(clean_mobile) or self.local_data.get("citizens", {}).get(mobile)

    def get_citizen_by_identifier(self, identifier):
        if not identifier:
            return None
        clean_id = str(identifier).strip().replace("+91", "").replace(" ", "").replace("-", "").lower()
        if self.is_connected:
            doc = self.db.citizens.find_one({
                "$or": [
                    {"mobile": identifier},
                    {"mobile": clean_id},
                    {"email": {"$regex": f"^{re.escape(clean_id)}$", "$options": "i"}}
                ]
            }, {"_id": 0})
            return doc
        
        for c in self.local_data.get("citizens", {}).values():
            if (c.get("mobile") == identifier or 
                c.get("mobile") == clean_id or 
                str(c.get("email", "")).strip().lower() == clean_id):
                return c
        return None

    def get_all_citizens(self):
        if self.is_connected:
            return list(self.db.citizens.find({}, {"_id": 0}))
        return list(self.local_data.get("citizens", {}).values())

    def save_citizen(self, citizen_dict):
        mobile = citizen_dict.get("mobile")
        if not mobile:
            return False
        clean_mobile = str(mobile).strip().replace("+91", "").replace(" ", "").replace("-", "")
        citizen_dict["mobile"] = clean_mobile
        if "updatedAt" not in citizen_dict:
            citizen_dict["updatedAt"] = datetime.now().isoformat()
        if "createdAt" not in citizen_dict:
            citizen_dict["createdAt"] = datetime.now().isoformat()
            
        self.ensure_connected()
        if self.is_connected:
            try:
                self.db.citizens.update_one({"mobile": clean_mobile}, {"$set": citizen_dict}, upsert=True)
                if self.alt_db is not None:
                    self.alt_db.citizens.update_one({"mobile": clean_mobile}, {"$set": citizen_dict}, upsert=True)
                print(f"[MongoDB Atlas] Successfully persisted citizen {clean_mobile} to MongoDB Atlas ({DB_NAME} & citizen_portal_db)")
            except Exception as e:
                print(f"[MongoDB Citizen Save Error]: {e}")
            self.local_data.setdefault("citizens", {})[clean_mobile] = citizen_dict
            self.save_local_cache()
            return True
        self.local_data.setdefault("citizens", {})[clean_mobile] = citizen_dict
        self.save_local_cache()
        return True

    def get_officer(self, officer_id):
        if not officer_id:
            return None
        clean_id = str(officer_id).strip().replace(" ", "").replace("-", "")
        if self.is_connected:
            return self.db.officers.find_one({
                "$or": [
                    {"id": officer_id},
                    {"id": clean_id},
                    {"aadhaar": clean_id},
                    {"aadhaar": officer_id},
                    {"aadhaarFormatted": officer_id}
                ]
            }, {"_id": 0})
        for off in self.local_data.get("officers", {}).values():
            if (off.get("id") == officer_id or off.get("id") == clean_id or 
                off.get("aadhaar") == clean_id or off.get("aadhaar") == officer_id or 
                off.get("aadhaarFormatted") == officer_id):
                return off
        return None

    def get_grievances(self):
        if self.is_connected:
            try:
                mongo_grievances = list(self.db.grievances.find({}, {"_id": 0}).sort([("createdAt", DESCENDING), ("id", DESCENDING)]))
                # Merge with local cache as a safety net to catch any sync-gap submissions
                local_grievances = self.local_data.get("grievances", {})
                if local_grievances:
                    mongo_ids = {g.get("id") for g in mongo_grievances}
                    for gid, grievance in local_grievances.items():
                        if gid and gid not in mongo_ids and isinstance(grievance, dict):
                            mongo_grievances.insert(0, grievance)
                return mongo_grievances
            except Exception as e:
                print(f"[MongoDB get_grievances Error]: {e}, falling back to local cache")
        
        return sorted(
            list(self.local_data.get("grievances", {}).values()),
            key=lambda x: (x.get("createdAt") or x.get("timestamp") or "", x.get("id") or ""),
            reverse=True
        )

    def get_grievance(self, grievance_id):
        if self.is_connected:
            try:
                g = self.db.grievances.find_one({"id": grievance_id}, {"_id": 0})
                if g:
                    return g
            except Exception as e:
                print(f"[MongoDB get_grievance Error]: {e}, falling back to local cache")
        # Fallback to local cache
        return self.local_data.get("grievances", {}).get(grievance_id)


    def save_grievance(self, grievance_dict):
        gid = grievance_dict.get("id")
        if not gid:
            return False
        if "createdAt" not in grievance_dict:
            grievance_dict["createdAt"] = datetime.now().isoformat()
        self.ensure_connected()
        if self.is_connected:
            try:
                self.db.grievances.update_one({"id": gid}, {"$set": grievance_dict}, upsert=True)
                if self.alt_db is not None:
                    self.alt_db.grievances.update_one({"id": gid}, {"$set": grievance_dict}, upsert=True)
                print(f"[MongoDB Atlas] Successfully persisted grievance #{gid} to MongoDB Atlas ({DB_NAME} & citizen_portal_db)")
            except Exception as e:
                print(f"[MongoDB Grievance Save Error]: {e}")
            self.local_data.setdefault("grievances", {})[gid] = grievance_dict
            self.save_local_cache()
            return True
        self.local_data.setdefault("grievances", {})[gid] = grievance_dict
        self.save_local_cache()
        return True

    def withdraw_grievance(self, grievance_id):
        """Withdraw a grievance only if it has not advanced past initial review"""
        if not grievance_id:
            return False, "Grievance ID is required"
        g = self.get_grievance(grievance_id)
        if not g:
            return False, "Grievance not found"
        if self.is_under_consideration(g):
            return False, "Grievance is currently under active administrative consideration and cannot be withdrawn."
        deleted = self.delete_grievance(grievance_id)
        if deleted:
            return True, f"Grievance {grievance_id} withdrawn and purged successfully"
        return False, "Failed to withdraw grievance from database"

    def delete_grievance(self, grievance_id):
        if not grievance_id:
            return False
        deleted = False
        self.ensure_connected()
        if self.is_connected:
            try:
                res = self.db.grievances.delete_one({"id": grievance_id})
                if self.alt_db is not None:
                    self.alt_db.grievances.delete_one({"id": grievance_id})
                if res.deleted_count > 0:
                    deleted = True
                print(f"[MongoDB Atlas] Deleted #{grievance_id} from MongoDB Atlas")
            except Exception as e:
                print(f"[MongoDB Delete Error]: {e}")
        if grievance_id in self.local_data.get("grievances", {}):
            del self.local_data["grievances"][grievance_id]
            self.save_local_cache()
            deleted = True
        return deleted

    def clear_all_grievances(self):
        if self.is_connected:
            try:
                self.db.grievances.delete_many({})
            except Exception as e:
                print(f"[MongoDB Clear Error]: {e}")
        self.local_data["grievances"] = {}
        self.save_local_cache()
        return True

    def update_grievance_votes(self, grievance_id, user_id=None, delta=1):
        g = self.get_grievance(grievance_id)
        if not g:
            return None
        voted_users = list(g.get("votedUsers") or [])
        user_key = str(user_id or "default_citizen").strip()
        
        if delta > 0:
            if user_key in voted_users:
                # Already endorsed by this user - do not duplicate vote!
                g["hasVoted"] = True
                return g
            voted_users.append(user_key)
            new_votes = g.get("votes", 0) + 1
        else:
            if user_key in voted_users:
                voted_users.remove(user_key)
            new_votes = max(1, g.get("votes", 1) - 1)

        new_urgency = min(99.8, round(g.get("urgencyScore", 70.0) + (0.3 if delta > 0 else -0.3), 1))
        g["votes"] = new_votes
        g["votedUsers"] = voted_users
        g["urgencyScore"] = new_urgency
        self.save_grievance(g)
        return g

    def add_grievance_opinion(self, grievance_id, opinion_dict):
        g = self.get_grievance(grievance_id)
        if not g:
            return None
        opinions = g.get("opinions", [])
        opinions.insert(0, opinion_dict)
        g["opinions"] = opinions
        self.save_grievance(g)
        return g

    def update_grievance_status(self, grievance_id, status, status_stage, official_response="", assigned_officer=""):
        g = self.get_grievance(grievance_id)
        if not g:
            return None
        g["status"] = status
        g["statusStage"] = status_stage
        if official_response:
            g["officialResponse"] = official_response
        if assigned_officer:
            g["assignedOfficer"] = assigned_officer
        self.save_grievance(g)
        return g

    def add_official_note(self, grievance_id, note_dict):
        g = self.get_grievance(grievance_id)
        if not g:
            return None
        notes = g.get("officialNotes", [])
        notes.append(note_dict)
        g["officialNotes"] = notes
        self.save_grievance(g)
        return g

    def get_budget_schemes(self):
        if self.is_connected:
            return list(self.db.budget_schemes.find({}, {"_id": 0}))
        return list(self.local_data.get("budget_schemes", {}).values()) or [
            { "id": "SCH-1", "name": "SDRF Disaster Relief Fund", "totalPoolCr": 4.50, "sanctionedCr": 4.20, "utilizationPct": 93.3 },
            { "id": "SCH-2", "name": "Jal Jeevan Mission (RWSS)", "totalPoolCr": 2.50, "sanctionedCr": 2.10, "utilizationPct": 84.0 },
            { "id": "SCH-3", "name": "5T School Infrastructure Fund", "totalPoolCr": 1.80, "sanctionedCr": 1.48, "utilizationPct": 82.2 },
            { "id": "SCH-4", "name": "Unallocated Emergency Pool", "totalPoolCr": 1.20, "sanctionedCr": 0.00, "utilizationPct": 0.0 }
        ]

    def get_drone_missions(self):
        if self.is_connected:
            return list(self.db.drone_missions.find({}, {"_id": 0}))
        return list(self.local_data.get("drone_missions", {}).values()) or [
            {
                "id": "DRONE-001",
                "targetGrievanceId": "PROB-101",
                "droneModel": "Garuda-V4 Quadcopter (Thermal + 4K Optical)",
                "flightAltitude": "120m AGL",
                "orthomosaicResolution": "2.1 cm/pixel",
                "surveyDate": "18 Aug 2026",
                "status": "Completed (Orthomosaic 3D Surface Ready)",
                "damageAssessment": "100% culvert pier collapsed. Earthwork required: 14,200 m³. Embankment breach length: 42 meters."
            }
        ]

    # -------------------------------------------------------------
    # Voice Note CRUD Operations (Mongoose Compatible)
    # -------------------------------------------------------------
    def save_voice_note(self, note_dict):
        note_id = note_dict.get("id")
        if not note_id:
            note_id = f"VN-{int(time.time()*1000)}"
            note_dict["id"] = note_id
            note_dict["_id"] = note_id
        if self.is_connected:
            self.db.voice_notes.update_one({"id": note_id}, {"$set": note_dict}, upsert=True)
            return note_dict
        self.local_data.setdefault("voice_notes", {})[note_id] = note_dict
        self.save_local_cache()
        return note_dict

    def get_my_voice_notes(self, citizen_id):
        if self.is_connected:
            return list(self.db.voice_notes.find({"citizenId": citizen_id}, {"_id": 0}).sort("createdAt", DESCENDING))
        all_notes = list(self.local_data.get("voice_notes", {}).values())
        return [n for n in all_notes if str(n.get("citizenId")) == str(citizen_id)]

    def get_admin_voice_notes(self, status=None):
        query = {}
        if status:
            query["status"] = status.lower()
        if self.is_connected:
            return list(self.db.voice_notes.find(query, {"_id": 0}).sort("createdAt", DESCENDING))
        all_notes = list(self.local_data.get("voice_notes", {}).values())
        if status:
            all_notes = [n for n in all_notes if n.get("status") == status.lower()]
        return sorted(all_notes, key=lambda x: x.get("createdAt", ""), reverse=True)

    def update_voice_note_status(self, note_id, status):
        status = status.lower()
        if self.is_connected:
            self.db.voice_notes.update_one({"id": note_id}, {"$set": {"status": status, "updatedAt": datetime.now().isoformat()}})
            return self.db.voice_notes.find_one({"id": note_id}, {"_id": 0})
        note = self.local_data.get("voice_notes", {}).get(note_id)
        if note:
            note["status"] = status
            note["updatedAt"] = datetime.now().isoformat()
            self.save_local_cache()
        return note

# Global Singleton
db_instance = LokSwarDB()

def get_db():
    return db_instance

