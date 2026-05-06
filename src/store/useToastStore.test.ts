import { describe, it, expect, beforeEach } from "vitest";
import { useToastStore } from "./useToastStore";

describe("useToastStore", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it("powinien dodać nowe powiadomienie do stanu", () => {
    // Arrange
    const { addToast } = useToastStore.getState();

    // Act
    addToast("Testowy błąd", "error");

    // Assert
    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe("Testowy błąd");
    expect(toasts[0].type).toBe("error");
    expect(toasts[0].id).toBeDefined()
  });

  it("powinien ręcznie usunąć powiadomienie po ID", () => {
    // Arrange
    const { addToast, removeToast } = useToastStore.getState();
    addToast("Wiadomość", "success");

    let { toasts } = useToastStore.getState();
    const toastId = toasts[0].id;

    // Act
    removeToast(toastId);

    // Assert
    toasts = useToastStore.getState().toasts;
    expect(toasts.length).toBe(0);
  });
});
