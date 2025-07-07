from fastapi import FastAPI, UploadFile, File, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from utils.video import transcribe_and_caption
import os
import uuid
import json

app = FastAPI()

# Create videos directory if it doesn't exist
os.makedirs("videos", exist_ok=True)
app.mount("/videos", StaticFiles(directory="videos"), name="videos")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "✅ Reely backend is running"}

@app.post("/upload")
async def upload_file(uid: str = Query(default="guest"), file: UploadFile = File(...)):
    user_dir = f"videos/{uid}"
    os.makedirs(user_dir, exist_ok=True)

    file_path = f"{user_dir}/sample.mp4"
    try:
        with open(file_path, "wb") as f:
            f.write(await file.read())
        print(f"📁 Video uploaded to {file_path}")
        return {"message": "Video uploaded!", "path": file_path}
    except Exception as e:
        print("❌ Upload error:", e)
        return {"error": str(e)}

@app.get("/caption")
def caption_video(uid: str = Query(default="guest")):
    input_path = f"videos/{uid}/sample.mp4"
    video_id = uuid.uuid4().hex[:8]
    output_filename = f"{video_id}_captioned.mp4"
    output_path = f"videos/{uid}/{output_filename}"
    relative_path = f"{uid}/{output_filename}"

    if not os.path.exists(input_path):
        return {"error": f"{input_path} not found!"}

    try:
        transcribe_and_caption(input_path, output_path)
        print("✅ Captioning completed:", output_path)

        # Save to history
        history_file = f"videos/{uid}/user_history.json"
        history_data = {"history": []}

        if os.path.exists(history_file):
            try:
                with open(history_file, "r") as f:
                    raw = json.load(f)
                    if isinstance(raw, list):
                        history_data["history"] = raw
                    elif isinstance(raw, dict):
                        history_data = raw
            except Exception as e:
                print("⚠️ Error reading history file, resetting it:", e)

        history_data["history"].append(relative_path)

        with open(history_file, "w") as f:
            json.dump(history_data, f)

        return {"message": "Captioning done!", "output": relative_path}
    except Exception as e:
        print("🔥 Error during captioning:", e)
        return {"error": str(e)}

@app.get("/history")
def get_history(uid: str = Query(default="guest")):
    history_file = f"videos/{uid}/user_history.json"
    print(f"📄 Looking for history: {history_file}")

    if not os.path.exists(history_file):
        return {"history": []}

    try:
        with open(history_file, "r") as f:
            data = json.load(f)
        if isinstance(data, list):
            return {"history": data}
        return {"history": data.get("history", [])}
    except Exception as e:
        print("❌ Failed to read history file:", e)
        return {"history": []}

@app.delete("/delete")
def delete_video(uid: str = Query(...), filename: str = Query(...)):
    full_path = f"videos/{filename}"
    print(f"🗑️ Deleting: {full_path}")
    try:
        if os.path.exists(full_path):
            os.remove(full_path)

        history_file = f"videos/{uid}/user_history.json"
        if os.path.exists(history_file):
            with open(history_file, "r") as f:
                data = json.load(f)
            if isinstance(data, dict):
                history = data.get("history", [])
                if filename in history:
                    history.remove(filename)
                    data["history"] = history
                    with open(history_file, "w") as f:
                        json.dump(data, f)
        return {"message": "Deleted"}
    except Exception as e:
        print("❌ Error deleting video:", e)
        return {"error": str(e)}
