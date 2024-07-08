"use client"

import { useEffect, useState } from "react";

export const Year = () => {
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
    setYear(new Date().getFullYear());
    }, []);

    return year;
};