import axios from "axios";
import { authService } from "./auth.service";

const API_URL = "https://api.synk.hu";

// Create a separate axios instance for S3 uploads without global auth headers
const s3Axios = axios.create();

export const uploadFile = async (file: File): Promise<string> => {
  const token = authService.getToken();

  const { data } = await axios.post(
    `${API_URL}/files`,
    {
      contentType: file.type || "application/octet-stream",
      fileSize: file.size,
      expirationMinutes: null,
    },
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  const uploadUrl: string | undefined =
    data.uploadUrl || data.upload_url || data.url;
  const fileUrl: string | undefined =
    data.fileUrl || data.file_url || data.publicUrl || data.url;

  if (!uploadUrl || !fileUrl) {
    throw new Error("Invalid file upload response");
  }

  // Upload directly to S3 using pre-signed URL with separate axios instance
  await s3Axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  return fileUrl;
};
