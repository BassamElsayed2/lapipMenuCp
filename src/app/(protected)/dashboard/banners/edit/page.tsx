"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBanner,
  updateBanner,
  uploadBannerImage,
  Banner,
} from "../../../../../../services/apiBanners";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type BannerFormValues = {
  image: File | null;
  link?: string;
};

const EditBannerForm: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { register, handleSubmit, setValue, formState, reset } =
    useForm<BannerFormValues>({});
  const { errors } = formState;

  // Get banner data
  const { data: banner, isLoading: isLoadingBanner } = useQuery({
    queryKey: ["banner"],
    queryFn: () => getBanner(),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<Banner>) => {
      if (!banner?.id) {
        throw new Error("لا يوجد بانر للتعديل");
      }
      return updateBanner(banner.id, data);
    },
    onSuccess: () => {
      toast.success("تم تحديث البانر بنجاح");
      queryClient.invalidateQueries({ queryKey: ["banner"] });
      router.push("/dashboard/banners");
    },
    onError: (error) => toast.error("حدث خطأ ما: " + error.message),
  });

  // Upload image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  // Reset form when banner data is loaded
  useEffect(() => {
    if (banner) {
      reset({
        link: banner.link || "",
      });
      setCurrentImageUrl(banner.image);
    }
  }, [banner, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        toast.error(`الملف ${file.name} ليس صورة`);
        return;
      }

      // التحقق من حجم الملف (50MB كحد أقصى)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`حجم الصورة ${file.name} يجب أن لا يتجاوز 50MB`);
        return;
      }

      setSelectedImage(file);
      setValue("image", file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setValue("image", null);
  };

  const onSubmit = async (data: BannerFormValues) => {
    try {
      setIsUploadingImage(true);

      let finalData: Partial<Banner> = {
        link: data.link || undefined,
      };

      // إذا تم اختيار صورة جديدة، ارفعها
      if (selectedImage) {
        const uploadedImageUrl = await uploadBannerImage(selectedImage);
        finalData.image = uploadedImageUrl;
      }

      mutate(finalData);
    } catch (error: Error | unknown) {
      toast.error("حدث خطأ أثناء رفع الصورة");
      console.error("Image upload error:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoadingBanner) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">لم يتم العثور على البانر</p>
        <Link
          href="/dashboard/banners"
          className="text-primary-500 hover:text-primary-600 mt-4 inline-block"
        >
          العودة إلى إدارة البانر
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0">تعديل البانر</h5>

        <ol className="breadcrumb mt-[12px] md:mt-0 rtl:flex-row-reverse">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-primary-500"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-primary-500 top-1/2 -translate-y-1/2">
                home
              </i>
              رئيسية
            </Link>
          </li>
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard/banners"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-primary-500"
            >
              البانر
            </Link>
          </li>
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            تعديل البانر
          </li>
        </ol>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="gap-[25px]">
          <div className="lg:col-span-2">
            <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                <div className="trezo-card-title">
                  <h5 className="!mb-0">تعديل البانر</h5>
                </div>
              </div>

              <div className="trezo-card-content">
                <div className="sm:grid sm:grid-cols-1 sm:gap-[25px]">
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      الرابط (اختياري)
                    </label>
                    <input
                      type="url"
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="https://example.com"
                      id="link"
                      {...register("link", {
                        pattern: {
                          value: /^https?:\/\/.+/,
                          message:
                            "يجب أن يكون الرابط صحيحاً ويبدأ بـ http:// أو https://",
                        },
                      })}
                    />
                    {errors?.link?.message && (
                      <span className="text-red-700 text-sm">
                        {errors.link.message}
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-1 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      صورة البانر
                    </label>

                    {/* Current Image */}
                    {currentImageUrl && !selectedImage && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          الصورة الحالية:
                        </p>
                        <div className="relative w-[200px] h-[120px]">
                          <Image
                            src={currentImageUrl}
                            alt="Current Banner"
                            width={200}
                            height={120}
                            className="rounded-md object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    )}

                    <div id="fileUploader">
                      <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg mb-3">
                            <i className="ri-upload-2-line"></i>
                          </div>
                          <p className="leading-[1.5] mb-2">
                            <strong className="text-black dark:text-white">
                              اضغط لرفع
                            </strong>
                            <br /> صورة جديدة (اختياري)
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            حجم الصورة: حتى 50 ميجابايت
                            <br />
                            <span className="text-xs text-blue-500">
                              سيتم ضغط الصورة تلقائياً لتحسين الأداء
                            </span>
                          </p>
                        </div>

                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                        />
                        {errors?.image?.message && (
                          <span className="text-red-700 text-sm">
                            {errors.image.message}
                          </span>
                        )}
                      </div>

                      {/* New Image Preview */}
                      {selectedImage && (
                        <div className="mt-[10px] flex items-center gap-2">
                          <div className="relative w-[100px] h-[60px]">
                            <Image
                              src={URL.createObjectURL(selectedImage)}
                              alt="banner-preview"
                              width={100}
                              height={60}
                              className="rounded-md object-cover w-full h-full"
                            />
                            <button
                              type="button"
                              className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs rtl:right-auto rtl:left-[-5px]"
                              onClick={handleRemoveImage}
                            >
                              ✕
                            </button>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedImage.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="trezo-card mb-[25px]">
          <div className="trezo-card-content">
            <button
              type="button"
              onClick={() => router.back()}
              className="font-medium inline-block transition-all rounded-md md:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isPending || isUploadingImage}
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
                ) : isPending ? (
                  <>
                    <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                      sync
                    </i>
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                      save
                    </i>
                    حفظ التغييرات
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default EditBannerForm;
