'use client'

import dynamic from "next/dynamic"
// import AssignmentPage from "../Components/AssignmentPage"

const AssignmentsPage = dynamic(
    () => import("../Components/AssignmentPage"),
    { ssr: false }
  );

export default function Page() {

    return <AssignmentsPage />;
}
