"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBanner, deleteBanner } from "../../../../../services/apiBanners";
import toast from "react-hot-toast";

const BannersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: banner,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["banner"],
    queryFn: () => getBanner(),
  });

  const deleteBannerMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      toast.success("تم حذف البانر بنجاح");
      queryClient.invalidateQueries({ queryKey: ["banner"] });
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء حذف البانر: " + error.message);
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف البانر؟")) {
      deleteBannerMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">حدث خطأ في تحميل البانر</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0">إدارة البانر</h5>

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
            البانر
          </li>
        </ol>
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0">البانر الحالي</h5>
          </div>
          {banner ? (
            <Link
              href="/dashboard/banners/edit"
              className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
            >
              <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
                <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                  edit
                </i>
                تعديل البانر
              </span>
            </Link>
          ) : (
            <Link
              href="/dashboard/banners/create"
              className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
            >
              <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
                <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                  add
                </i>
                إضافة بانر
              </span>
            </Link>
          )}
        </div>

        <div className="trezo-card-content">
          {banner ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h6 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  معاينة البانر
                </h6>
                <div className="relative w-full h-48 border border-gray-200 dark:border-[#172036] rounded-md overflow-hidden">
                  <Image
                    src={banner.image}
                    alt="Banner"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div>
                <h6 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  تفاصيل البانر
                </h6>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الرابط
                    </label>
                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600 break-all"
                      >
                        {banner.link}
                      </a>
                    ) : (
                      <span className="text-gray-400">لا يوجد رابط</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <Link
                      href="/dashboard/banners/edit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <i className="material-symbols-outlined text-lg ltr:mr-2 rtl:ml-2">
                        edit
                      </i>
                      تعديل
                    </Link>

                    <button
                      onClick={() => handleDelete(banner.id!)}
                      disabled={deleteBannerMutation.isPending}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="material-symbols-outlined text-lg ltr:mr-2 rtl:ml-2">
                        delete
                      </i>
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#172036] rounded-full flex items-center justify-center">
                <i className="material-symbols-outlined text-2xl text-gray-400">
                  image
                </i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا يوجد بانر
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                لم يتم إضافة بانر بعد. يمكنك إضافة بانر جديد من هنا.
              </p>
              <Link
                href="/dashboard/banners/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <i className="material-symbols-outlined text-lg ltr:mr-2 rtl:ml-2">
                  add
                </i>
                إضافة بانر جديد
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BannersPage;
