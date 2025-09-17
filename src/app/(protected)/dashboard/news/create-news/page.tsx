"use client";

import { useEffect, useState } from "react";

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
import { useCategories } from "@/components/news/categories/useCategories";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  uploadProductImage,
  Product,
} from "../../../../../../services/apiProducts";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UUID } from "crypto";

import { getCurrentUser } from "../../../../../../services/apiauth";
import Image from "next/image";
import Link from "next/link";

type ProductFormValues = {
  title_ar: string;
  title_en: string;
  category_id: UUID;
  description_ar: string;
  description_en: string;
  user_id: UUID;
  image: File | null;
  price: number;
  discount?: number;
};

const CreateProductForm: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [userId, setUserId] = useState<UUID | null>(null);

  //get categories
  const { data: categories } = useCategories();

  // Text Editor
  const [editorAr, setEditorAr] = useState("اكتب وصف المنتج بالعربية...");
  const [editorEn, setEditorEn] = useState(
    "Write the product description in English..."
  );

  const { register, handleSubmit, setValue, formState } =
    useForm<ProductFormValues>({});

  const { errors } = formState;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setValue("category_id", selectedId as UUID);
  };

  useEffect(() => {
    async function fetchUser() {
      const user = await getCurrentUser();
      if (user?.id) {
        setUserId(user.id as UUID);
        setValue("user_id", user.id as UUID);
      }
    }

    fetchUser();
  }, [setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("تم إنشاء المنتج بنجاح");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/dashboard/news");
    },
    onError: (error) => toast.error("حدث خطأ ما" + error.message),
  });

  // Upload image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  const onSubmit = async (data: ProductFormValues) => {
    if (!userId) {
      toast.error("حدث خطأ: لم يتم تحديد المستخدم");
      return;
    }

    // تحقق أن category_id موجود وصحيح
    if (!data.category_id || data.category_id.trim() === "") {
      toast.error("الرجاء اختيار التصنيف");
      return;
    }

    // الصورة اختيارية - لا نحتاج للتحقق من وجودها

    // تحقق من السعر
    if (!data.price || data.price <= 0) {
      toast.error("يجب إدخال سعر صحيح للمنتج");
      return;
    }

    try {
      setIsUploadingImage(true);

      let uploadedImageUrl: string | undefined;

      // ارفع الصورة فقط إذا تم اختيارها
      if (selectedImage) {
        uploadedImageUrl = await uploadProductImage(selectedImage);
      }

      const finalData: Product = {
        title_ar: data.title_ar,
        title_en: data.title_en,
        description_ar: data.description_ar,
        description_en: data.description_en,
        category_id: data.category_id,
        user_id: userId,
        image_url: uploadedImageUrl,
        price: data.price,
        discount: data.discount,
      };

      mutate(finalData);
    } catch (error: Error | unknown) {
      toast.error("حدث خطأ أثناء رفع الصور");
      console.error("Image upload error:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0"> انشاء منتج</h5>

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
          <li className="breadcrumb-item inline-block  relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            المنتجات
          </li>
          <li className="breadcrumb-item inline-block  relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            انشاء منتج
          </li>
        </ol>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className=" gap-[25px]">
          <div className="lg:col-span-2">
            <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                <div className="trezo-card-title">
                  <h5 className="!mb-0">أضف منتج</h5>
                </div>
              </div>

              <div className="trezo-card-content">
                <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      عنوان المنتج (بالعربي)
                    </label>
                    <input
                      type="text"
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="يجب الايزيد عن 100 حرف"
                      id="title_ar"
                      {...register("title_ar", {
                        required: "يجب ادخال عنوان المنتج",
                        max: {
                          value: 100,
                          message: "يجب الايزيد عن 100 حرف",
                        },
                      })}
                    />
                    {errors?.title_ar?.message && (
                      <span className="text-red-700 text-sm">
                        {errors.title_ar.message}
                      </span>
                    )}
                  </div>
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      عنوان المنتج (بالانجليزي)
                    </label>
                    <input
                      type="text"
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="يجب الايزيد عن 100 حرف"
                      id="title_en"
                      {...register("title_en", {
                        required: "يجب ادخال عنوان المنتج",
                        max: {
                          value: 100,
                          message: "يجب الايزيد عن 100 حرف",
                        },
                      })}
                    />
                    {errors?.title_en?.message && (
                      <span className="text-red-700 text-sm">
                        {errors.title_en.message}
                      </span>
                    )}
                  </div>

                  <input type="hidden" {...register("user_id")} />

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      التصنيف
                    </label>
                    <select
                      className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500"
                      {...register("category_id")}
                      onChange={handleCategoryChange}
                    >
                      <option value="">اختر التصنيف</option>
                      {categories?.map((category) => (
                        <option
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      السعر الأساسي *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="0.00"
                      id="price"
                      {...register("price", {
                        required: "يجب إدخال السعر",
                        min: {
                          value: 0.01,
                          message: "يجب أن يكون السعر أكبر من صفر",
                        },
                        valueAsNumber: true,
                      })}
                    />
                    {errors?.price?.message && (
                      <span className="text-red-700 text-sm">
                        {errors.price.message}
                      </span>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      السعر بعد الخصم (اختياري)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                      placeholder="0.00"
                      id="discount"
                      {...register("discount", {
                        min: {
                          value: 0.01,
                          message: "يجب أن يكون الخصم أكبر من صفر",
                        },
                        valueAsNumber: true,
                      })}
                    />
                    {errors?.discount?.message && (
                      <span className="text-red-700 text-sm">
                        {errors.discount.message}
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      وصف المنتج (بالعربي) - اختياري
                    </label>
                    <EditorProvider>
                      <Editor
                        value={editorAr}
                        onChange={(e) => {
                          setEditorAr(e.target.value);
                          setValue("description_ar", e.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        style={{ minHeight: "200px" }}
                        className="rsw-editor"
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

                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      وصف المنتج (بالانجليزي) - اختياري
                    </label>
                    <EditorProvider>
                      <Editor
                        value={editorEn}
                        onChange={(e) => {
                          setEditorEn(e.target.value);
                          setValue("description_en", e.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        style={{ minHeight: "200px" }}
                        className="rsw-editor"
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

                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      صورة المنتج - اختياري
                    </label>

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
                            <br /> صورة المنتج من هنا
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            حجم الصورة: حتى 50 ميجابايت
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

                      {/* Image Preview */}
                      {selectedImage && (
                        <div className="mt-[10px] flex items-center gap-2">
                          <div className="relative w-[50px] h-[50px]">
                            <Image
                              src={URL.createObjectURL(selectedImage)}
                              alt="product-preview"
                              width={50}
                              height={50}
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
              type="reset"
              className="font-medium inline-block transition-all rounded-md md:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
            >
              ألغاء
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
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                      add
                    </i>
                    انشاء منتج
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

export default CreateProductForm;
