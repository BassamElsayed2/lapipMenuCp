import { decode } from "base64-arraybuffer";
import supabase from "./supabase";
import { compressImage } from "./imageCompression";

export interface Product {
  id?: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  category_id: string;
  user_id: string;
  image_url?: string;
  price?: number;
  discount?: number;
  created_at?: string;
}

export interface ProductType {
  id?: string;
  product_id: string;
  name_ar: string;
  name_en: string;
  image_url?: string;
  created_at?: string;
}

export interface ProductSize {
  id?: string;
  type_id: string;
  size_ar: string;
  size_en: string;
  price: number;
  offer_price?: number;
  created_at?: string;
}

export interface ProductTypeWithSizes extends ProductType {
  sizes?: ProductSize[];
}

export interface ProductWithTypes extends Product {
  types?: ProductTypeWithSizes[];
}

export async function getProducts(
  page = 1,
  limit = 10,
  filters?: {
    categoryId?: string;
    search?: string;
    date?: string;
  }
): Promise<{ products: Product[]; total: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("products").select("*", { count: "exact" });

  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters?.search) {
    query = query.or(
      `title_ar.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%`
    );
  }

  if (filters?.date) {
    const now = new Date();
    const startDate = new Date();

    switch (filters.date) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    query = query.gte("created_at", startDate.toISOString());
  }

  query = query.order("created_at", { ascending: false });

  const { data: products, error, count } = await query.range(from, to);

  if (error) {
    console.error("خطأ في جلب المنتجات:", error.message);
    throw new Error("تعذر تحميل المنتجات");
  }

  return {
    products: products || [],
    total: count ?? 0,
  };
}

export async function getProductById(id: string): Promise<Product> {
  // Get the product only (no types or sizes)
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError) throw productError;

  return product;
}

export async function createProduct(productData: Product): Promise<Product> {
  // Create the product
  const { data: createdProduct, error: productError } = await supabase
    .from("products")
    .insert([productData])
    .select()
    .single();

  if (productError) {
    console.error("خطأ في إنشاء المنتج:", productError);
    throw new Error("تعذر إنشاء المنتج");
  }

  return createdProduct;
}

export async function uploadProductImage(
  file: File | { base64: string; name: string },
  folder = "products"
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
    .from("product-images")
    .upload(fileName, fileData, {
      contentType: file instanceof File ? "image/jpeg" : `image/${fileExt}`,
    });

  if (error) {
    console.error("خطأ أثناء رفع صورة المنتج:", error.message);
    throw new Error("تعذر رفع صورة المنتج");
  }

  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function uploadProductTypeImage(
  file: File | { base64: string; name: string }
): Promise<string> {
  let fileExt: string;
  let fileName: string;
  let fileData: File | ArrayBuffer;

  if (file instanceof File) {
    // ضغط الصورة قبل الرفع
    const compressedFile = await compressImage(file, 1920, 1080, 0.8);

    fileExt = "jpg"; // بعد الضغط تصبح الصورة jpg
    fileName = `product-type-img/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    fileData = compressedFile;
  } else {
    // Base64 case - لا يمكن ضغطها هنا لأنها base64
    fileExt = file.name.split(".").pop()!;
    fileName = `product-type-img/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    fileData = decode(file.base64);
  }

  const { error } = await supabase.storage
    .from("product-type-img")
    .upload(fileName, fileData, {
      contentType: file instanceof File ? "image/jpeg" : `image/${fileExt}`,
    });

  if (error) {
    console.error("خطأ أثناء رفع صورة نوع المنتج:", error.message);
    throw new Error("تعذر رفع صورة نوع المنتج");
  }

  const { data: publicUrlData } = supabase.storage
    .from("product-type-img")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function deleteProduct(id: string) {
  // First, get the product to check if it has an image
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    throw new Error("حدث خطأ أثناء جلب بيانات المنتج");
  }

  // Delete the image if it exists
  if (product?.image_url) {
    const path = new URL(product.image_url).pathname;
    const match = path.match(
      /\/storage\/v1\/object\/public\/product-images\/(.+)/
    );
    const filePath = match?.[1];

    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([filePath]);

      if (storageError) {
        console.error("فشل حذف صورة المنتج:", storageError);
      }
    }
  }

  // Delete the product (types and sizes will be deleted automatically due to CASCADE)
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error("حدث خطأ أثناء حذف المنتج");
  }
}

export async function updateProduct(
  id: string,
  updatedProduct: Partial<Product>
): Promise<Product> {
  // Update the product (no need to handle types anymore)
  const { error: productError } = await supabase
    .from("products")
    .update(updatedProduct)
    .eq("id", id);

  if (productError) {
    console.error("خطأ في تحديث المنتج:", productError.message);
    throw new Error("تعذر تحديث المنتج");
  }

  // Return the updated product
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("خطأ في جلب المنتج المحدث:", fetchError.message);
    throw new Error("تعذر جلب المنتج المحدث");
  }

  return product;
}
