"use client";
import { useUser } from "@propelauth/nextjs/client";
import { Spinner } from "@nextui-org/react";
// import { useEffect, useState } from "react";
import NavBar from "@/components/Navbar";
import React from "react";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
export default function MetricsPage() {
  const { loading, isLoggedIn } = useUser();
  // const getTaskList = async () => {
  //   console.log("Inside Client-side Get Task List");
  //   // Remove documents
  //   const formData = new FormData();
  //   setTaskList([]);
  //   setTaskLoading(true);
  //   const taskListResponse = await fetch("/api/metrics", {
  //     method: "POST",
  //     body: formData,
  //   });
  //   console.log("Task List Response: ", taskListResponse);
  //   const task_res = (await taskListResponse.json()).response;
  //   // Repopulate documents

  //   setTaskList(task_res["task_list"] || "");
  //   setTaskLoading(false);
  // };

  // useEffect(() => {
  //   getTaskList();
  // }, []);

  // const [taskSelected, setTaskSelected] = useState<boolean>(false);
  // const [taskToOpen, setTaskToOpen] = useState<any>(null);
  // // const [taskList, setTaskList] = useState<any[]>([]);
  // // const [taskLoading, setTaskLoading] = useState<boolean>(false);
  // const pageSize = defaultDocumentsPerPage; // Number of items per page
  // const [page, setPage] = useState(1);

  // function handlePageChange(newPage: number) {
  //   setPage(newPage);
  // }
  // const paginatedOptions = taskList.slice(
  //   (page - 1) * pageSize,
  //   page * pageSize
  // );

  // const handleCardClick = (task: any) => {
  //   setTaskSelected(true);
  //   setTaskToOpen(task);
  // };

  // const handleCloseModal = () => {
  //   setTaskSelected(false);
  //   setTaskToOpen("");
  // };
  if (isLoggedIn) {
    return (
      <>
        <NavBar />
      </>
    );
  } else if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spinner label="Loading" />
        </div>
      </div>
    );
  } else {
    return <SignupAndLoginButtons />;
  }
}
