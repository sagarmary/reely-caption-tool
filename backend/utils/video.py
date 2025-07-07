import os
os.environ["IMAGEMAGICK_BINARY"] = "C:/Program Files/ImageMagick-7.1.1-Q16/magick.exe"

import whisper
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip

model = whisper.load_model("medium")

def transcribe_and_caption(video_path, output_path="videos/output_sample.mp4", lang="auto", translate_to="en"):
    try:
        print("🎧 [1] Extracting audio with ffmpeg...")
        audio_path = "temp.wav"
        os.system(f'ffmpeg -y -i "{video_path}" -ar 16000 -ac 1 -f wav {audio_path}')

        print(f"🔍 [2] Transcribing and translating to '{translate_to}' using Whisper...")
        result = model.transcribe(audio_path, task="translate")
        segments = result.get("segments", [])
        print(f"🧠 [3] Found {len(segments)} segments")

        print("🎞️ [4] Loading video file...")
        video = VideoFileClip(video_path)
        clips = [video]

        print("✏️ [5] Adding styled captions to video...")
        for seg in segments:
            print(f"📝 Caption from {seg['start']}s to {seg['end']}s: {seg['text']}")
            try:
                txt = TextClip(
                    seg["text"],
                    fontsize=40,
                    color='white',
                    font='Arial',
                    bg_color='black',
                    size=(video.w, None),
                    method='label'
                ).margin(bottom=20)

                txt = txt.set_start(seg["start"]).set_end(seg["end"]).set_position(("center", "bottom"))
                clips.append(txt)
            except Exception as e:
                print("⚠️ Skipping one caption due to error:", e)

        print("💾 [6] Writing final captioned video...")
        final = CompositeVideoClip(clips)
        final.write_videofile(
            output_path,
            codec="libx264",
            preset="ultrafast",
            threads=4,
            bitrate="400k",
            audio_codec="aac",
            temp_audiofile="temp-audio.m4a",
            remove_temp=True,
            write_logfile=False
        )

        print("✅ [7] Captioned video saved at:", output_path)

        if os.path.exists(audio_path):
            os.remove(audio_path)

    except Exception as e:
        print("🔥 ERROR in transcribe_and_caption():", e)
        raise e