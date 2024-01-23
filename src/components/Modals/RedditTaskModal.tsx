import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalContent,
  Pagination,
} from "@nextui-org/react";
import { defaultDocumentsPerPage } from "@/helpers/default";
import React, { useState } from "react";
import EmailThreadModal from "@/components/Modals/EmailThreadModal";
interface RedditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: any;
}

type Email = {
  message: string;
  sender: string;
  subject?: string | undefined;
  timestamp: string;
};

type EmailThread = {
  email_thread: Email[];
  initial_email: Email;
};

const RedditTaskModal = ({ open, task, onClose }: RedditTaskModalProps) => {
  const pageSize = defaultDocumentsPerPage; // Number of items per page
  const [page, setPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [openEmail, setOpenEmail] = useState<boolean>(false);
  const handleClose = () => {
    onClose();
  };
  console.log("Task: ", task);
  const handleEmailSelected = (email: any) => {
    setOpenEmail(true);
    setSelectedEmail(email);
  };
  function handlePageChange(newPage: number) {
    setPage(newPage);
  }
  function handleCloseModal() {
    setOpenEmail(false);
    setSelectedEmail(null);
  }
  const paginatedOptions = task["emails"].slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <>
      <EmailThreadModal
        open={openEmail}
        emailThread={selectedEmail}
        onClose={handleCloseModal}
      />
      <Modal isOpen={open} onClose={handleClose}>
        <ModalContent>
          <>
            <ModalHeader
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              {task["task"]}
            </ModalHeader>
            <ModalBody>
              {paginatedOptions.map((email: EmailThread, index: number) => {
                const sender_index =
                  email.email_thread.length - 2 > 0
                    ? email.email_thread.length - 2
                    : 0;
                const sender = email.email_thread[sender_index].sender;

                return (
                  <div key={index}>
                    <p>
                      <div
                        onClick={() => handleEmailSelected(email)}
                        style={{
                          cursor: "pointer",
                        }}
                        className="text-blue-400 hover:text-blue-500"
                      >
                        Sender: {sender}
                        <br />
                        <strong>
                          Initial Email: {email.initial_email.subject}
                        </strong>
                      </div>
                    </p>
                  </div>
                );
              })}
              <div className="flex justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={Math.ceil(task["emails"].length / pageSize)}
                  onChange={handlePageChange}
                />
              </div>
            </ModalBody>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RedditTaskModal;
