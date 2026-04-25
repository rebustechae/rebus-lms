/**
 * Optimized Query Utilities for Supabase
 * These functions follow best practices for scalability:
 * - Select only needed columns
 * - Use batch queries to avoid N+1
 * - Let the database do aggregations
 * - Add pagination where needed
 */

import { createClient } from "@/utils/supabase/server";

/**
 * Get all lessons for a course (cached-friendly)
 * Only select needed columns
 */
export async function getLessonsForCourse(courseId: string) {
  const supabase = await createClient();
  
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id, title, order_index, course_id, video_url")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }

  return lessons || [];
}

/**
 * Get user progress for all lessons in a course
 * Optimized: single query instead of N queries
 */
export async function getUserProgressForCourse(
  userId: string,
  courseId: string
) {
  const supabase = await createClient();

  const { data: progress, error } = await supabase
    .from("user_progress")
    .select("lesson_id, completed_at")
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) {
    console.error("Error fetching progress:", error);
    return [];
  }

  return progress || [];
}

/**
 * Get user's course progress summary
 * Uses materialized view for performance
 */
export async function getUserProgressSummary(userId: string) {
  const supabase = await createClient();

  const { data: summary, error } = await supabase
    .from("user_progress_summary")
    .select("course_id, lessons_completed, completion_percentage")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching progress summary:", error);
    return [];
  }

  return summary || [];
}

/**
 * Get paginated users list with role and basic stats
 * Pagination prevents loading all users at once
 */
export async function getPaginatedUsers(
  page: number = 1,
  pageSize: number = 20,
  searchQuery?: string
) {
  const supabase = await createClient();
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("profiles")
    .select("id, email, role, created_at");

  // Apply search filter if provided
  if (searchQuery) {
    query = query.or(
      `email.ilike.%${searchQuery}%,role.ilike.%${searchQuery}%`
    );
  }

  // Pagination
  const { data: users, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)
    .returns<any[]>();

  if (error) {
    console.error("Error fetching paginated users:", error);
    return { users: [], total: 0, page, pageSize };
  }

  return {
    users: users || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Get user's course enrollment with progress
 * Single efficient query using JOINs
 */
export async function getUserCourseProgress(userId: string) {
  const supabase = await createClient();

  const { data: courseProgress, error } = await supabase
    .from("user_progress_summary")
    .select(
      `
      course_id,
      lessons_completed,
      completion_percentage,
      courses:course_id(id, title, description)
      `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user course progress:", error);
    return [];
  }

  return courseProgress || [];
}

/**
 * Check if a specific lesson is completed
 * Lightweight query for single checks
 */
export async function isLessonCompleted(
  userId: string,
  lessonId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    console.error("Error checking lesson completion:", error);
    return false;
  }

  return !!data;
}

/**
 * Get lesson with prerequisite check (all previous lessons completed)
 * Optimized for lock logic
 */
export async function getLessonWithLockStatus(
  lessonId: string,
  userId: string,
  courseId: string
) {
  const supabase = await createClient();

  // Get current lesson
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, title, order_index, content, course_id, video_url")
    .eq("id", lessonId)
    .single();

  if (lessonError) return { lesson: null, isLocked: true };

  // Check if first lesson
  if (lesson.order_index === 1) {
    return { lesson, isLocked: false };
  }

  // Check if previous lesson completed
  const { data: prevLesson, error: prevError } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId)
    .eq("order_index", lesson.order_index - 1)
    .maybeSingle();

  if (!prevLesson) {
    return { lesson, isLocked: false };
  }

  // Check if user completed previous lesson
  const isCompleted = await isLessonCompleted(userId, prevLesson.id);

  return { lesson, isLocked: !isCompleted };
}

/**
 * Batch get completion status for multiple lessons
 * More efficient than checking one by one
 */
export async function getBatchLessonCompletionStatus(
  userId: string,
  lessonIds: string[]
) {
  const supabase = await createClient();

  const { data: completed, error } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  if (error) {
    console.error("Error fetching batch completion status:", error);
    return new Set<string>();
  }

  return new Set((completed || []).map((p) => p.lesson_id));
}

/**
 * Get all courses with user's progress (paginated for admin)
 */
export async function getCoursesWithUserStats(
  page: number = 1,
  pageSize: number = 10
) {
  const supabase = await createClient();
  const offset = (page - 1) * pageSize;

  const { data: courses, error, count } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      lessons(count)
      `
    )
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching courses:", error);
    return { courses: [], total: 0 };
  }

  return {
    courses: courses || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
