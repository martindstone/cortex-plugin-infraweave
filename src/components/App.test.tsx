import { render, waitFor } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders configuration instructions", async () => {
    const { getByText } = render(<App />);
    await waitFor(() => {
      expect(getByText(/Configure the InfraWeave Plugin/)).toBeInTheDocument();
    });
  });
});
