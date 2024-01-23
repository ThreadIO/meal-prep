import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalContent,
  Pagination,
} from "@nextui-org/react";
import { defaultEmailsPerPage } from "@/helpers/default";
import React, { useState } from "react";
interface EmailThreadModalProps {
  open: boolean;
  onClose: () => void;
  emailThread: any;
}

type Email = {
  message: string;
  sender: string;
  subject?: string | undefined;
  timestamp: string;
};

const EmailThreadModal = ({
  open,
  emailThread,
  onClose,
}: EmailThreadModalProps) => {
  const pageSize = defaultEmailsPerPage; // Number of items per page
  const [page, setPage] = useState(1);
  const handleClose = () => {
    onClose();
  };
  function handlePageChange(newPage: number) {
    setPage(newPage);
  }
  const paginatedOptions = emailThread
    ? emailThread["email_thread"].slice((page - 1) * pageSize, page * pageSize)
    : [];

  return (
    <>
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
              {emailThread?.initial_email && (
                <>Subject: {emailThread["initial_email"]["subject"]}</>
              )}
            </ModalHeader>
            <ModalBody>
              {paginatedOptions.map((email: Email, index: number) => {
                const sender = email.sender;

                return (
                  <div key={index}>
                    <p>
                      <div>
                        Sender: {sender}
                        <br />
                        <strong>Subject: {email.subject}</strong>
                        <br />
                        <strong>Timestamp: {email.timestamp}</strong>
                        <br />
                        <strong>
                          Message: {email.message.substring(0, 100)}
                          {email.message.length > 100 && "..."}
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
                  total={
                    emailThread
                      ? Math.ceil(emailThread["email_thread"].length / pageSize)
                      : 0
                  }
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

export default EmailThreadModal;
