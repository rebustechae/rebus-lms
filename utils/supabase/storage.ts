import { createClient } from "@/utils/supabase/client";

/**
 * Upload a video file to Supabase Storage
 * Returns the public URL if successful
 */
export async function uploadVideoFile(
  file: File,
  courseId: string,
  lessonId: string
): Promise<string | null> {
  const supabase = createClient();

  // Generate a unique filename to avoid conflicts
  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop();
  const fileName = `${courseId}/${lessonId}/${timestamp}.${fileExtension}`;

  try {
    // Upload the file to the 'videos' bucket
    const { data, error } = await supabase.storage
      .from("videos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(data.path);

    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      console.error("Failed to generate public URL");
      return null;
    }

    // Ensure CORS headers by adding download=false parameter
    const corsUrl = `${publicUrl}?download=false`;

    console.log("Video uploaded successfully:", {
      path: data.path,
      publicUrl: publicUrl,
      corsUrl: corsUrl,
    });
    return corsUrl;
  } catch (error) {
    console.error("Upload exception:", error);
    return null;
  }
}

/**
 * Delete a video file from Supabase Storage
 */
export async function deleteVideoFile(fileUrl: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // Extract the file path from the public URL
    const urlParts = fileUrl.split("/videos/");
    if (urlParts.length !== 2) return false;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from("videos")
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete exception:", error);
    return false;
  }
}
