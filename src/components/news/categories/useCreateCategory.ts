import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import supabase from "../../../../services/supabase";
import { compressImage } from "../../../../services/imageCompression";

export function useAddCategory() {
  const queryClient = useQueryClient();

  const { mutate: addCategory, isPending } = useMutation({
    mutationFn: async ({
      name_ar,
      name_en,
      image,
      parent_id,
    }: {
      name_ar: string;
      name_en: string;
      image?: File;
      parent_id?: string | null;
    }) => {
      let image_url = undefined;

      if (image) {
        // ضغط الصورة قبل الرفع
        const compressedImage = await compressImage(image, 1920, 1080, 0.8);

        const fileName = `${Date.now()}.jpg`; // بعد الضغط تصبح jpg
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

      const { error } = await supabase
        .from("categories")
        .insert([{ name_ar, name_en, image_url, parent_id }]);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("تمت إضافة التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["parent-categories"] });
    },
    onError: (error) => {
      toast.error("فشل في إضافة التصنيف: " + error.message);
    },
  });

  return { addCategory, isPending };
}
