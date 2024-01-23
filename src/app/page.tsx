"use client";
import { useUser, useRedirectFunctions } from "@propelauth/nextjs/client";
import { Card, CardBody, Spinner, Pagination, Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import NavBar from "@/components/Navbar";
import React from "react";
import RedditTaskModal from "@/components/Modals/RedditTaskModal";
import { defaultDocumentsPerPage } from "@/helpers/default";
import BusinessIcon from "@/components/BusinessIcon";
export default function MetricsPage() {
  const { loading, user, isLoggedIn } = useUser();
  const getTaskList = async () => {
    console.log("Inside Client-side Get Task List");
    // Remove documents
    const formData = new FormData();
    setTaskList([]);
    setTaskLoading(true);
    const taskListResponse = await fetch("/api/metrics", {
      method: "POST",
      body: formData,
    });
    console.log("Task List Response: ", taskListResponse);
    const task_res = (await taskListResponse.json()).response;
    // Repopulate documents

    setTaskList(task_res["task_list"] || "");
    setTaskLoading(false);
  };

  useEffect(() => {
    getTaskList();
  }, []);

  const [taskSelected, setTaskSelected] = useState<boolean>(false);
  const [taskToOpen, setTaskToOpen] = useState<any>(null);
  const [taskList, setTaskList] = useState<any[]>([]);
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  const pageSize = defaultDocumentsPerPage; // Number of items per page
  const [page, setPage] = useState(1);

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }
  const paginatedOptions = taskList.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleCardClick = (task: any) => {
    setTaskSelected(true);
    setTaskToOpen(task);
  };

  const handleCloseModal = () => {
    setTaskSelected(false);
    setTaskToOpen("");
  };
  if (isLoggedIn) {
    return (
      <>
        <NavBar />

        {taskLoading ? (
          <Spinner label="Loading Tasks" />
        ) : (
          <>
            {taskSelected && (
              <RedditTaskModal
                open={taskSelected}
                task={taskToOpen}
                onClose={handleCloseModal}
              />
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <h1>
                Task Board: {user?.firstName} {user?.lastName}
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px",
              }}
            >
              {paginatedOptions.map((task, index) => (
                <Card
                  key={index}
                  isPressable
                  onPress={() => handleCardClick(task)}
                  style={{ marginBottom: "5px" }}
                >
                  <CardBody>
                    <div
                      className="flex"
                      style={{ marginTop: "5px", marginBottom: "5px" }}
                    >
                      <p
                        style={{
                          marginRight: "30px",
                          marginLeft: "10px",
                          color: "orange",
                        }}
                      >
                        {task["count"]}
                      </p>
                      <p>{task["task"]}</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={Math.ceil(taskList.length / pageSize)}
                onChange={handlePageChange}
              />
            </div>
          </>
        )}
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
          <Spinner label="Loading metrics" />
        </div>
      </div>
    );
  } else {
    return <SignupAndLoginButtons />;
  }
}

export function SignupAndLoginButtons() {
  const { redirectToSignupPage, redirectToLoginPage } = useRedirectFunctions();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <BusinessIcon width={400} height={400} alt={"Thread Title"} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Button
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
            onClick={() => redirectToSignupPage()}
            color="primary"
          >
            Sign up
          </Button>
          <Button
            style={{ padding: "5px 10px", borderRadius: "5px" }}
            onClick={() => redirectToLoginPage()}
            color="primary"
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  );
}
