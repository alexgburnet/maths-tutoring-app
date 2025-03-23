# utils/mathpix_helper.py

import os
import time
import requests
import json
import zipfile
import io

def extract_latex_from_pdf(pdf_path):
    MATHPIX_APP_KEY = os.getenv("MATHPIX_APP_KEY")
    MATHPIX_APP_ID = os.getenv("MATHPIX_APP_ID")

    options = {
        "conversion_formats": {"tex.zip": True},
        "math_inline_delimiters": ["$", "$"],
        "rm_spaces": True
    }

    with open(pdf_path, "rb") as file_data:
        upload_resp = requests.post(
            "https://api.mathpix.com/v3/pdf",
            headers={
                "app_id": MATHPIX_APP_ID,
                "app_key": MATHPIX_APP_KEY
            },
            data={"options_json": json.dumps(options)},
            files={"file": file_data}
        )

    upload_data = upload_resp.json()
    pdf_id = upload_data.get("pdf_id")
    if not pdf_id:
        print("❌ Mathpix upload failed:", upload_data)
        return

    # Wait until the conversion is ready
    status_url = f"https://api.mathpix.com/v3/pdf/{pdf_id}"
    while True:
        res = requests.get(status_url, headers={
            "app_id": MATHPIX_APP_ID,
            "app_key": MATHPIX_APP_KEY
        })
        data = res.json()
        if data.get("status") == "completed":
            break
        elif data.get("status") == "error":
            print("❌ Mathpix error:", data)
            return
        time.sleep(5)

    # Download and read .zip into memory
    zip_url = f"https://api.mathpix.com/v3/pdf/{pdf_id}.tex"
    response = requests.get(zip_url, headers={
        "app_id": MATHPIX_APP_ID,
        "app_key": MATHPIX_APP_KEY
    })

    with zipfile.ZipFile(io.BytesIO(response.content)) as z:
        full_latex = ""
        for name in sorted(z.namelist()):
            if name.endswith(".tex"):
                with z.open(name) as tex_file:
                    full_latex += tex_file.read().decode("utf-8") + "\n\n"
    
    return full_latex