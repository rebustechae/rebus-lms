import { createClient } from "@/utils/supabase/client";

/**
 * Upload a file to a specific Supabase Storage bucket
 */
export async function uploadFile(
  file: File,
  courseId: string,
  lessonId: string,
  bucketName: string = "videos"
): Promise<string | null> {
  const supabase = createClient();

  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop();
  // folder structure: courseId/lessonId/filename
  const fileName = `${courseId}/${lessonId}/${timestamp}.${fileExtension}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    // download=false prevents the browser from trying to download the VTT file
    return `${publicUrl}?download=false`;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}