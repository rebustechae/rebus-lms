"use server"

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function markLessonComplete(courseId: string, lessonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Avoid `upsert(..., { onConflict })` here: some deployments/tables/views
  // can reject ON CONFLICT (we've seen this with `user_progress`).
  // Instead, do an idempotent "check then insert".
  const { data: existing, error: existingError } = await supabase
    .from("user_progress")
    .select("user_id, lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath(`/dashboard/courses/${courseId}/lessons/${lessonId}`);
    return { success: true, data: existing };
  }

  const { data, error } = await supabase
    .from("user_progress")
    .insert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
    })
    .select("user_id, lesson_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Purge cache to update sidebar
  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath(`/dashboard/courses/${courseId}/lessons/${lessonId}`);
  
  return { success: true, data };
}