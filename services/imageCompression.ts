// دالة مشتركة لضغط الصور
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // حساب الأبعاد الجديدة مع الحفاظ على النسبة
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // تعيين أبعاد الكانفاس
      canvas.width = width;
      canvas.height = height;

      // رسم الصورة المضغوطة
      ctx?.drawImage(img, 0, 0, width, height);

      // تحويل إلى blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // إنشاء ملف جديد من الـ blob
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error("فشل في ضغط الصورة"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("فشل في تحميل الصورة"));
    img.src = URL.createObjectURL(file);
  });
}
