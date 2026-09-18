import { getSupabase } from "./supabase";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
}

export interface ReviewInput {
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
}

interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
}

const NOT_SET_UP = "Reviews aren't set up yet: run the reviews migration in Supabase.";

function isMissingTable(code: string | undefined): boolean {
  return code === "PGRST205" || code === "42P01";
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    authorName: row.author_name,
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
  };
}

/** Reviews for one product, newest first. */
export async function listReviews(productId: string): Promise<Review[]> {
  const { data, error } = await getSupabase()
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load reviews", error);
    throw new Error(
      isMissingTable(error.code) ? NOT_SET_UP : "We couldn't load reviews. Please try again.",
    );
  }
  return (data as ReviewRow[]).map(toReview);
}

export async function submitReview(input: ReviewInput): Promise<Review> {
  const { data, error } = await getSupabase()
    .from("reviews")
    .insert({
      product_id: input.productId,
      user_id: input.userId,
      author_name: input.authorName.trim(),
      rating: input.rating,
      title: input.title.trim() || null,
      body: input.body.trim(),
    })
    .select()
    .single();
  if (error) {
    console.error("Failed to submit review", error);
    if (isMissingTable(error.code)) throw new Error(NOT_SET_UP);
    if (error.code === "23505") throw new Error("You've already reviewed this product.");
    throw new Error("We couldn't post your review. Please try again.");
  }
  return toReview(data as ReviewRow);
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await getSupabase().from("reviews").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete review", error);
    throw new Error("We couldn't delete your review. Please try again.");
  }
}

export interface CustomerMessage {
  name: string;
  email: string;
  topic: string;
  orderNumber: string;
  message: string;
  userId: string | null;
}

/** Saves a contact-form message or problem report for the team to follow up. */
export async function sendCustomerMessage(input: CustomerMessage): Promise<void> {
  const { error } = await getSupabase()
    .from("customer_messages")
    .insert({
      user_id: input.userId,
      name: input.name.trim(),
      email: input.email.trim(),
      topic: input.topic,
      order_number: input.orderNumber.trim().toUpperCase() || null,
      message: input.message.trim(),
    });
  if (error) {
    console.error("Failed to send message", error);
    if (isMissingTable(error.code)) {
      throw new Error(
        "Messages aren't set up yet: run the reviews migration in Supabase. Meanwhile, please email or call us.",
      );
    }
    throw new Error("We couldn't send your message. Please try again, or email us instead.");
  }
}
