# AeonBlue Forensic Engine - Backend

This backend implements the "Pixels-to-Proof" workflow for the comprehensive maritime forensics system.

## Architecture & Modules

The backend is divided into 4 core directories mapping exactly to the specification:

1. **`sar_processing/` (Layer A: SAR Processing & AI Proxy)**
   - Deals with raw satellite data transitions.
   - Normalization of Sentinel-1 TIFFs to Sigma0 decibel values (mocked for forensic engine architecture).
   - Serves an AI stand-in proxy fetching masks from the `DataSet/Mask/` directory until the `Attention U-Net++` is trained.
   - Calculates pixel-to-area logic and volume estimation in liters and cubic meters based on a designated film thickness.

2. **`lagrangian_backtracking/` (Layer B: The Physics)**
   - Responsible for rolling back time to determine the origin of the spill.
   - Mock integration of the OpenDrift framework using environmental wind vectors (ECMWF ERA5) and current vectors (CMEMS).
   - Generates a GeoJSON Wake Path FeatureCollection representing the historical trajectory.

3. **`ais_correlation/` (Layer C: The Attribution)**
   - Identifies the likely responsible vessel using a spatiotemporal AIS join.
   - Imitates PostGIS `ST_DWithin` spatial query over an AIS Database.
   - Conducts confidence scoring, assigning higher weights to vessels in transit versus vessels at anchor or drifting.

4. **`reporting/` (Layer D: The Legal Output)**
   - Turns data into finalized evidence packets.
   - Generates a compiled proxy packet for structural reference incorporating Visual Evidence (SAR + Masks), Physics Proof (Wake Path), and Attribution (IMO Numbers, Probability).

## How to Run

1. Ensure dependencies from `requirements.txt` are installed:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the main FastAPI server:
   ```bash
   python main.py
   ```
3. Test the forensic engine by sending a simulated spill payload to `http://localhost:8000/analyze_spill` via POST:
   ```json
   {
       "image_id": "ZENODO_S1A_IW_GRDH_1SDV_0001",
       "gps_coordinates": {
           "lon": -89.654,
           "lat": 28.532
       },
       "timestamp": "2023-11-04T12:00:00"
   }
   ```
   *The mock backend will compute the volume, find the origin, score likely vessels, and output the report parameters.*
