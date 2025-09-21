import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";
import supabase from "../../../../services/supabase";
import { compressImage } from "../../../../services/imageCompression";

interface UpdateCategoryPayload {
  id: string;
  name_ar: string;
  name_en: string;
  image?: File;
  parent_id?: string | null;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  const { mutate: updateCategory, isPending } = useMutation({
    mutationFn: async ({
      id,
      name_ar,
      name_en,
      image,
      parent_id,
    }: UpdateCategoryPayload) => {
      let image_url = undefined;

      if (image) {
        // ضغط الصورة قبل الرفع
        const compressedImage = await compressImage(image, 1920, 1080, 0.8);

        const fileName = `${id}-${Date.now()}.jpg`; // بعد الضغط تصبح jpg
        const { error: uploadError } = await supabase.storage
          .from("cat-img")
          .upload(fileName, compressedImage, {
            contentType: "image/jpeg",
          });

        if (uploadError) throw new Error(uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from("cat-img").getPublicUrl(fileName);

        image_url = publicUrl;
      }

      const updateData: Record<string, unknown> = { name_ar, name_en };
      if (image_url !== undefined) updateData.image_url = image_url;
      if (parent_id !== undefined) updateData.parent_id = parent_id;

      const { error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("تم تحديث التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["parent-categories"] });
    },
    onError: (error) => {
      toast.error("فشل في تحديث التصنيف: " + error.message);
    },
  });

  return { updateCategory, isPending };
}
