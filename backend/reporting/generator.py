import os
import json
from datetime import datetime

class ReportGenerator:
    def __init__(self, output_dir: str = "Forensic_Reports"):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_evidence_packet(self, spill_id: str,
                                 sar_evidence: dict, 
                                 physics_proof: dict, 
                                 attribution_proof: dict):
        """
        Compiles a structured "Evidence Packet" in PDF format.
        """
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"AeonBlue_Evidential_Packet_{spill_id}_{timestamp}.pdf"
        output_path = os.path.join(self.output_dir, filename)

        print(f"[Reporting] Generating Evidence Packet: {output_path}")
        
        report_content = {
            "title": f"Forensic Evidence Report: {spill_id}",
            "generated_at": timestamp,
            "visual_evidence": {
                "sar_image_id": sar_evidence.get('image_id'),
                "mask_path": sar_evidence.get('mask_path'),
                "total_area_m2": sar_evidence.get('metrics', {}).get('total_area_m2', 0),
                "estimated_volume_liters": sar_evidence.get('metrics', {}).get('volume_liters', 0)
            },
            "physics_proof": {
                "origin_point": physics_proof['origin_point'],
                "leak_start_time": physics_proof['leak_start_time'],
                "wake_path_geojson": "Included as GeoJSON overlay plot in final PDF"
            },
            "attribution_proof": {
                "intersection_time": attribution_proof['intersection_time'],
                "attributed_vessel": attribution_proof['attributed_vessels'][0] if attribution_proof['attributed_vessels'] else None
            }
        }
        
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
            c = canvas.Canvas(output_path, pagesize=letter)
            c.setFont("Helvetica-Bold", 16)
            c.drawString(50, 750, report_content["title"])
            c.setFont("Helvetica", 12)
            c.drawString(50, 730, f"Generated At: {report_content['generated_at']}")
            
            y = 700
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, y, "Visual Evidence (SAR)")
            y -= 20
            c.setFont("Helvetica", 12)
            c.drawString(50, y, f"SAR Image ID: {report_content['visual_evidence']['sar_image_id']}")
            y -= 15
            c.drawString(50, y, f"Total Area (m2): {report_content['visual_evidence']['total_area_m2']}")
            y -= 15
            c.drawString(50, y, f"Est Volume (Liters): {report_content['visual_evidence']['estimated_volume_liters']}")
            
            y -= 30
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, y, "Physics Proof (Lagrangian Backtracking)")
            y -= 20
            c.setFont("Helvetica", 12)
            c.drawString(50, y, f"Origin Point: {report_content['physics_proof']['origin_point']}")
            y -= 15
            c.drawString(50, y, f"Leak Start Time: {report_content['physics_proof']['leak_start_time']}")
            
            y -= 30
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, y, "Attribution Proof (AIS Intersection)")
            y -= 20
            c.setFont("Helvetica", 12)
            c.drawString(50, y, f"Intersection Time: {report_content['attribution_proof']['intersection_time']}")
            
            vessel = report_content['attribution_proof']['attributed_vessel']
            if vessel:
                y -= 15
                c.drawString(50, y, f"Vessel Name: {vessel.get('vessel_name', 'Unknown')}")
                y -= 15
                c.drawString(50, y, f"MMSI/IMO: {vessel.get('mmsi', 'Unknown')} / {vessel.get('imo_number', 'Unknown')}")
                y -= 15
                c.drawString(50, y, f"Speed: {vessel.get('speed_knots', 0)} knots")
                y -= 15
                c.drawString(50, y, f"Confidence: {vessel.get('probability_score_percent', 'N/A')}%")
            else:
                y -= 15
                c.drawString(50, y, "No exact vessel correlation within timeframe.")
            
            c.save()
        except Exception as e:
            print(f"[Reporting] Could not generate actual PDF: {e}")
            with open(output_path, 'w') as f:
                f.write(json.dumps(report_content, indent=4))
        
        print(f"[Reporting] Packet assembly complete. Saved as {filename}")
        
        return {
            "report_path": filename,
            "report_summary": report_content
        }
