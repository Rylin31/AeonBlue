import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime

if not os.path.exists("Forensic_Reports"):
    os.makedirs("Forensic_Reports")

# Import modules from our forensic engine layers
from sar_processing.processor import SARProcessor
from lagrangian_backtracking.engine import BacktrackingEngine
from ais_correlation.correlator import AISCorrelator
from reporting.generator import ReportGenerator

app = FastAPI(title="AeonBlue Forensic Engine API", 
              description="Automates the 'Pixels-to-Proof' workflow.",
              version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/reports", StaticFiles(directory="Forensic_Reports"), name="reports")

# Instantiate engines
sar_engine = SARProcessor()
physics_engine = BacktrackingEngine()
attribution_engine = AISCorrelator()
reporting_engine = ReportGenerator()

class SpillRequest(BaseModel):
    image_id: str
    gps_coordinates: dict  # expected keys: "lon", "lat"
    timestamp: str  # ISO 8601 string, e.g., "2023-11-04T12:00:00"

poll_counter = 0

@app.get("/system-status")
async def get_system_status():
    global poll_counter
    poll_counter += 1
    
    # Simulate finding a new image after a polling cycle to simulate "True" live detection
    if poll_counter % 2 == 0:
        return {
            "status": "active",
            "new_incident": True,
            "incident_data": {
                "id": f"LIVE-S1-ACQ-{poll_counter}",
                "coords": [103.82, 1.22],
                "location": "Live Satellite Alert (Singapore Strait)",
                "date": "Just now"
            }
        }
    else:
        return {
            "status": "listening",
            "new_incident": False
        }

@app.post("/analyze_spill")
async def analyze_spill(request: SpillRequest):
    print(f"\n--- Starting Forensic Analysis for Spill: {request.image_id} ---")
    
    try:
        # Layer A: SAR Processing & AI Proxy
        print(">> Triggering Layer A: SAR Processing")
        sar_result = sar_engine.process_spill(request.image_id, request.gps_coordinates)
        
        # Layer B: Lagrangian Backtracking
        print(">> Triggering Layer B: Physics & Backtracking")
        physics_result = physics_engine.run_backtrack(request.gps_coordinates, request.timestamp)
        
        # Layer C: AIS Correlation
        print(">> Triggering Layer C: Spatiotemporal AIS Attribution")
        attribution_result = attribution_engine.attribute_polluter(
            physics_result["origin_point"], 
            physics_result["leak_start_time"]
        )
        
        # Layer D: Reporting
        print(">> Triggering Layer D: Automated Forensic Reporting")
        report_result = reporting_engine.generate_evidence_packet(
            request.image_id,
            sar_result,
            physics_result,
            attribution_result
        )
        
        return {
            "status": "success",
            "message": "Pixels-to-Proof workflow execution completed.",
            "data": {
                "sar_processing": sar_result,
                "lagrangian_backtracking": physics_result,
                "ais_correlation": attribution_result,
                "reporting": report_result
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Initializing AeonBlue Forensic Engine (Simulated Data Core)...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
