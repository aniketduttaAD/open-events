import React from "react";
import { useSelector } from "react-redux";
import UserLogin from "../../../features/authentication/UserLogin";
import RegisterUser from "../../../features/authentication/RegisterUser";

export default function ManageModal() {
  const modalLookup = { UserLogin, RegisterUser };
  const currentModal = useSelector((state) => state.modals);
  let renderModal;
  if (currentModal) {
    const { modalType, modalProps } = currentModal;
    const ModalComponent = modalLookup[modalType];
    renderModal = <ModalComponent {...modalProps} />;
  }
  return <span>{renderModal}</span>;
}
