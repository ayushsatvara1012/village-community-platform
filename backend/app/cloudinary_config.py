import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Validate Cloudinary configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if not all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]):
    print("WARNING: Cloudinary environment variables are missing. Image uploads will fail.")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

def upload_image(file, folder="general"):
    """
    Uploads a file to Cloudinary and returns the secure URL.
    """
    try:
        # If file is an UploadFile, use its file object
        file_to_upload = file
        if hasattr(file, 'file'):
            file_to_upload = file.file

        result = cloudinary.uploader.upload(file_to_upload, folder=f"village_platform/{folder}")
        url = result.get("secure_url")
        if url:
            print(f"Successfully uploaded to Cloudinary: {url}")
        return url
    except Exception as e:
        import traceback
        print(f"Cloudinary upload error: {str(e)}")
        print(traceback.format_exc())
        return None

def delete_image(image_url: str):
    """
    Deletes an image from Cloudinary given its URL.
    """
    if not image_url or "cloudinary.com" not in image_url:
        return

    try:
        # Extract public_id from URL
        # URL format: .../upload/v12345678/folder/subfolder/public_id.jpg
        parts = image_url.split("/")
        # Find the index of 'upload' and skip the version part (starts with 'v')
        if "upload" in parts:
            upload_index = parts.index("upload")
            # public_id starts after version (upload_index + 2) until the last part (filename)
            # but we need to remove the extension from the last part
            public_id_parts = parts[upload_index + 2:]
            filename = public_id_parts[-1]
            public_id_parts[-1] = filename.split(".")[0]
            public_id = "/".join(public_id_parts)
            
            cloudinary.uploader.destroy(public_id)
            print(f"Deleted from Cloudinary: {public_id}")
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
