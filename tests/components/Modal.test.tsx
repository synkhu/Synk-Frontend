import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "../../components/Modal";

describe("Modal", () => {
  it("renders children and title correctly", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText("Modal Content")).toBeInTheDocument();
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });

  it("calls onClose when clicking the backdrop", () => {
    const onClose = jest.fn();

    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );

    const backdrop = document.body.querySelector("div.absolute.inset-0.-z-10");
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when pressing Escape", () => {
    const onClose = jest.fn();

    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Hidden Content</div>
      </Modal>
    );

    expect(screen.queryByText("Hidden Content")).not.toBeInTheDocument();
  });
});