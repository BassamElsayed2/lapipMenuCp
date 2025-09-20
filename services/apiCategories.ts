import supabase from "./supabase";

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  image_url?: string | null;
  parent_id?: string | null;
  created_at?: string;
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

// جلب جميع التصنيفات مع التصنيفات الفرعية
export async function getCategories(): Promise<CategoryWithChildren[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, image_url, parent_id, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;

  // تنظيم التصنيفات في هيكل هرمي
  return organizeCategoriesHierarchically(data || []);
}

// جلب التصنيفات الرئيسية فقط (بدون تصنيفات فرعية)
export async function getParentCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, image_url, parent_id, created_at")
    .is("parent_id", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

// جلب التصنيفات الفرعية لتصنيف معين
export async function getSubCategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, image_url, parent_id, created_at")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

// جلب تصنيف واحد بالتفصيل
export async function getCategoryById(id: string): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, image_url, parent_id, created_at")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// دالة مساعدة لتنظيم التصنيفات في هيكل هرمي
function organizeCategoriesHierarchically(
  categories: Category[]
): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // إنشاء خريطة للتصنيفات
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // تنظيم التصنيفات في هيكل هرمي
  categories.forEach((category) => {
    const categoryWithChildren = categoryMap.get(category.id)!;

    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children!.push(categoryWithChildren);
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  return rootCategories;
}
