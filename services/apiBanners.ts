import { decode } from "base64-arraybuffer";
import supabase from "./supabase";
import { compressImage } from "./imageCompression";

export interface Banner {
  id?: number;
  created_at?: string;
  image: string;
  link?: string;
}

export async function getBanner(): Promise<Banner | null> {
  const { data: banner, error } = await supabase
    .from("Banners")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("خطأ في جلب البانر:", error.message);
    throw new Error("تعذر تحميل البانر");
  }

  return banner || null;
}

export async function getBannerById(id: number): Promise<Banner> {
  const { data: banner, error } = await supabase
    .from("Banners")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return banner;
}

export async function createOrUpdateBanner(
  bannerData: Banner
): Promise<Banner> {
  // First, check if there's already a banner
  const existingBanner = await getBanner();

  if (existingBanner) {
    // Update existing banner
    return await updateBanner(existingBanner.id!, bannerData);
  } else {
    // Create new banner
    const { data: createdBanner, error } = await supabase
      .from("Banners")
      .insert([bannerData])
      .select()
      .single();

    if (error) {
      console.error("خطأ في إنشاء البانر:", error);
      throw new Error("تعذر إنشاء البانر");
    }

    return createdBanner;
  }
}

export async function uploadBannerImage(
  file: File | { base64: string; name: string },
  folder = "banners"
): Promise<string> {
  let fileExt: string;
  let fileName: string;
  let fileData: File | ArrayBuffer;

  if (file instanceof File) {
    // ضغط الصورة قبل الرفع
    const compressedFile = await compressImage(file, 1920, 1080, 0.8);

    fileExt = "jpg"; // بعد الضغط تصبح الصورة jpg
    fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    fileData = compressedFile;
  } else {
    // Base64 case - لا يمكن ضغطها هنا لأنها base64
    fileExt = file.name.split(".").pop()!;
    fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    fileData = decode(file.base64);
  }

  const { error } = await supabase.storage
    .from("banners-images")
    .upload(fileName, fileData, {
      contentType: file instanceof File ? "image/jpeg" : `image/${fileExt}`,
    });

  if (error) {
    console.error("خطأ أثناء رفع صورة البانر:", error.message);
    throw new Error("تعذر رفع صورة البانر");
  }

  const { data: publicUrlData } = supabase.storage
    .from("banners-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function deleteBanner(id: number) {
  // First, get the banner to check if it has an image
  const { data: banner, error: fetchError } = await supabase
    .from("Banners")
    .select("image")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    throw new Error("حدث خطأ أثناء جلب بيانات البانر");
  }

  // Delete the image if it exists
  if (banner?.image) {
    const path = new URL(banner.image).pathname;
    const match = path.match(
      /\/storage\/v1\/object\/public\/banners-images\/(.+)/
    );
    const filePath = match?.[1];

    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("banners-images")
        .remove([filePath]);

      if (storageError) {
        console.error("فشل حذف صورة البانر:", storageError);
      }
    }
  }

  // Delete the banner
  const { error: deleteError } = await supabase
    .from("Banners")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error("حدث خطأ أثناء حذف البانر");
  }
}

export async function updateBanner(
  id: number,
  updatedBanner: Partial<Banner>
): Promise<Banner> {
  const { error: bannerError } = await supabase
    .from("Banners")
    .update(updatedBanner)
    .eq("id", id);

  if (bannerError) {
    console.error("خطأ في تحديث البانر:", bannerError.message);
    throw new Error("تعذر تحديث البانر");
  }

  // Return the updated banner
  const { data: banner, error: fetchError } = await supabase
    .from("Banners")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("خطأ في جلب البانر المحدث:", fetchError.message);
    throw new Error("تعذر جلب البانر المحدث");
  }

  return banner;
}
