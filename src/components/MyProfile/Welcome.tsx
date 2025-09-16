"use client";

import React from "react";
import Image from "next/image";
import { useAdminProfile } from "./useAdminProfile";

const Welcome: React.FC = () => {
  const { data: profile } = useAdminProfile();

  return (
    <>
      <div
        className="trezo-card mb-[25px] p-[20px] md:p-[25px] rounded-md "
        style={{
          background: "linear-gradient(81deg, #605DFF 3.39%, #9747FF 93.3%)",
        }}
      >
        <div className="trezo-card-content relative sm:ltr:pr-[250px] sm:rtl:pl-[250px]">
          <div className="md:py-[25px]">
            <h5 className="!mb-[5px] md:!mb-px !font-semibold !text-white">
              مرحبا بك,{" "}
              <span className="text-orange-100">{profile?.full_name}!</span>
            </h5>
          </div>

          <div className="sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:ltr:-right-[15px] sm:rtl:-left-[15px] sm:-mt-[8px] sm:max-w-[285px]">
            <Image
              src="/images/online-learning.gif"
              alt="online-learning-image"
              width={290}
              height={222}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
