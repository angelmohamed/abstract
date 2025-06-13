"use client";
import React from "react";
import EventLinting from "../components/customComponents/EventLinting";

const Tst = () => {
  return (
    <div>
      <EventLinting selectedSubcategory={"all"} selectCategory={"music"} showClosed={false}/>
    </div>
  );
};

export default Tst;
