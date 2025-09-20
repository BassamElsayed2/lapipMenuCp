"use client";

import React from "react";
import { useCategories } from "@/components/news/categories/useCategories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import {
  Editor,
  EditorProvider,
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import {
  getProductById,
  updateProduct,
  uploadProductImage,
  Product,
} from "../../../../../../services/apiProducts";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import toast from "react-hot-toast";

interface ProductFormData {
  title_ar: string;
  title_en: string;
  category_id: string;
  description_ar: string;
  description_en: string;
  image_url?: string;
  price?: number;
  discount?: number;
}

export default function EditProductPage() {
  const [serverImage, setServerImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [loadedProductId, setLoadedProductId] = useState<string | null>(null);

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      title_ar: "",
      title_en: "",
      category_id: "",
      description_ar: "",
      description_en: "",
      price: 0,
      discount: 0,
    },
  });

  //get id
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  //get categories
  const { data: categories } = useCategories();

  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      if (!id) throw new Error("No ID provided");
      return getProductById(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (product && (!isDataInitialized || loadedProductId !== product.id)) {
      reset({
        title_ar: product.title_ar || "",
        title_en: product.title_en || "",
        category_id: product.category_id?.toString() || "",
        description_ar: product.description_ar || "",
        description_en: product.description_en || "",
        price: product.price || 0,
        discount: product.discount || 0,
      });

      if (product.image_url) {
        setServerImage(product.image_url);
      }

      setIsDataInitialized(true);
      setLoadedProductId(product.id || null);
    }
  }, [product, isDataInitialized, loadedProductId, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const queryClient = useQueryClient();

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      if (!id) throw new Error("No ID found");

      setIsSubmitting(true);
      let uploadedImageUrl: string | undefined;

      if (selectedImage) {
        setIsUploadingImage(true);
        uploadedImageUrl = await uploadProductImage(selectedImage);
        setIsUploadingImage(false);
      }

      // Prepare update data
      const updatedData: Partial<Product> = {
        ...data,
        image_url: uploadedImageUrl || serverImage || undefined,
      };

      // تنفيذ التحديث في Supabase
      const updated = await updateProduct(id, updatedData);

      console.log("تم تحديث المنتج بنجاح:", updated);

      // يمكنك هنا إعادة التوجيه أو عرض رسالة نجاح
      toast.success("تم تحديث المنتج بنجاح");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/dashboard/news");
    } catch (error: Error | unknown) {
      toast.error("حدث خطأ ما");
      console.log("حدث خطأ أثناء تحديث المنتج:", error);
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className=" gap-[25px]">
        <div className="lg:col-span-2">
          <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <div className="trezo-card-title">
                <h5 className="!mb-0">تعديل منتج</h5>
              </div>
            </div>

            <div className="trezo-card-content">
              <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                {/* العنوانين */}
                <div>
                  <label className="block font-medium mb-2">العنوان (ع)</label>
                  <input
                    {...register("title_ar")}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">العنوان (EN)</label>
                  <input
                    {...register("title_en")}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  />
                </div>

                {/* التصنيف */}
                {product && (
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      التصنيف
                    </label>
                    <select
                      {...register("category_id")}
                      className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500"
                    >
                      {categories?.map((category) => (
                        <React.Fragment key={category.id}>
                          <option value={category.id}>
                            {category.name_ar}
                          </option>
                          {category.children?.map((subCategory) => (
                            <option key={subCategory.id} value={subCategory.id}>
                              &nbsp;&nbsp;{subCategory.name_ar}
                            </option>
                          ))}
                        </React.Fragment>
                      ))}
                    </select>
                  </div>
                )}

                {/* السعر والخصم */}
                <div>
                  <label className="block font-medium mb-2">السعر</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("price", { valueAsNumber: true })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">الخصم (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register("discount", { valueAsNumber: true })}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>

                {/* الخبر بالعربية */}
                <div className="sm:col-span-2">
                  <EditorProvider>
                    <Controller
                      control={control}
                      name="description_ar"
                      render={({ field }) => (
                        <div className="sm:col-span-2">
                          <label className="block font-medium mb-2">
                            وصف المنتج (بالعربي)
                          </label>
                          <EditorProvider>
                            <Editor
                              style={{ minHeight: "200px" }}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <Toolbar>
                                <BtnUndo />
                                <BtnRedo />
                                <Separator />
                                <BtnBold />
                                <BtnItalic />
                                <BtnUnderline />
                                <BtnStrikeThrough />
                                <Separator />
                                <BtnNumberedList />
                                <BtnBulletList />
                                <Separator />
                                <BtnLink />
                                <BtnClearFormatting />
                                <HtmlButton />
                                <Separator />
                                <BtnStyles />
                              </Toolbar>
                            </Editor>
                          </EditorProvider>
                        </div>
                      )}
                    />
                  </EditorProvider>
                </div>

                {/* الخبر بالانجليزية */}
                <div className="sm:col-span-2">
                  <EditorProvider>
                    <Controller
                      control={control}
                      name="description_en"
                      render={({ field }) => (
                        <div className="sm:col-span-2">
                          <label className="block font-medium mb-2">
                            وصف المنتج (بالانجليزي)
                          </label>
                          <EditorProvider>
                            <Editor
                              style={{ minHeight: "200px" }}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <Toolbar>
                                <BtnUndo />
                                <BtnRedo />
                                <Separator />
                                <BtnBold />
                                <BtnItalic />
                                <BtnUnderline />
                                <BtnStrikeThrough />
                                <Separator />
                                <BtnNumberedList />
                                <BtnBulletList />
                                <Separator />
                                <BtnLink />
                                <BtnClearFormatting />
                                <HtmlButton />
                                <Separator />
                                <BtnStyles />
                              </Toolbar>
                            </Editor>
                          </EditorProvider>
                        </div>
                      )}
                    />
                  </EditorProvider>
                </div>

                {/* الصورة */}
                <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    صورة المنتج
                  </label>

                  <div id="fileUploader">
                    <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
                      <div className="flex items-center justify-center">
                        <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                          <i className="ri-upload-2-line"></i>
                        </div>
                        <p className="leading-[1.5]">
                          <strong className="text-black dark:text-white">
                            اضغط لرفع
                          </strong>
                          <br /> صورة المنتج من هنا
                        </p>
                      </div>

                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                      />
                    </div>

                    {/* Image Preview */}
                    <div className="mt-[10px] flex flex-wrap gap-2">
                      {/* صورة السيرفر */}
                      {serverImage && (
                        <div className="relative w-[50px] h-[50px]">
                          <Image
                            src={serverImage}
                            alt="server-img"
                            width={50}
                            height={50}
                            className="rounded-md object-cover w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.png";
                            }}
                          />
                          <button
                            type="button"
                            className="absolute top-[-5px] right-[-5px] bg-red-600 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                            onClick={() => setServerImage(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* صورة الرفع الجديدة */}
                      {selectedImage && (
                        <div className="relative w-[50px] h-[50px]">
                          <Image
                            src={URL.createObjectURL(selectedImage)}
                            alt="selected-img"
                            width={50}
                            height={50}
                            className="rounded-md object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                            onClick={() => setSelectedImage(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الأزرار */}
      <div className="trezo-card mb-[25px]">
        <div className="trezo-card-content">
          <button
            type="reset"
            className="font-medium inline-block transition-all rounded-md md:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
              {isUploadingImage ? (
                <>
                  <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                    sync
                  </i>
                  جاري رفع الصورة...
                </>
              ) : isSubmitting ? (
                <>
                  <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                    sync
                  </i>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                    save
                  </i>
                  حفظ التعديلات
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
