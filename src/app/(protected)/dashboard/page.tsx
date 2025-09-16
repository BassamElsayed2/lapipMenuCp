import Welcome from "@/components/MyProfile/Welcome";
import Image from "next/image";

export default function page() {
  return (
    <>
      <div>
        <Welcome />

        <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] py-[20px] md:py-[80px] px-[20px] md:px-[25px] rounded-md">
          <div className="trezo-card-content text-center">
            <Image
              src="/images/starter.png"
              className="inline-block"
              alt="starter-image"
              width={880}
              height={538}
            />

            <h4 className="md:!max-w-[550px] !mx-auto !leading-[1.5] !mt-[25px] md:!mt-[38px] !mb-[20px] md:!mb-[30px] !text-[19px] md:!text-[21px]">
              اصنع شيئاً جميلاً، مثل تحفة فنية أو شطيرة جيدة جداً.
            </h4>
          </div>
        </div>
      </div>
    </>
  );
}
