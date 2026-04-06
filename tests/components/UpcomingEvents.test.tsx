import { render, fireEvent, waitFor } from "@testing-library/react";
import UpcomingEvents from "../../components/UpcomingEvents";
import axios from "axios";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("UpcomingEvents Component", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it("renders and scroll buttons call scroll function", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "https://api.synk.hu/events") {
        return Promise.resolve({
          data: {
            items: [
              { id: "1", name: "Event 1" },
              { id: "2", name: "Event 2" },
            ],
          },
        });
      }

      const id = url.split("/").pop();

      return Promise.resolve({
        data: {
          id,
          name: `Event ${id}`,
          thumbnailUrl: "",
          startTime: "2026-01-01T12:00:00Z",
        },
      });
    });

    const { container } = render(<UpcomingEvents />);

    await waitFor(() =>
      expect(container.querySelectorAll(".group").length).toBeGreaterThan(0)
    );

    const scrollContainer =
      container.querySelector(".flex.flex-nowrap") ||
      container.querySelector("[class*='flex-nowrap']");
    if (!scrollContainer) throw new Error("Scroll container not found");

    scrollContainer.scrollBy = jest.fn();

    const buttons = container.querySelectorAll("button");
    if (buttons.length < 2) throw new Error("Scroll buttons not found");

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(scrollContainer.scrollBy).toHaveBeenCalledTimes(2);
  });
});