"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function markLessonComplete(
  courseId: string,
  lessonId: string
) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Save progress (with course_id for better query performance)
  const { error } = await supabase.from("user_progress").upsert({
    user_id: user.id,
    lesson_id: lessonId,
    course_id: courseId,
  });

  if (error) {
    throw new Error(`Failed to save progress: ${error.message}`);
  }

  // Revalidate the layout to refresh sidebar data
  revalidatePath(`/dashboard/courses/${courseId}`, "layout");

  return true;
}
