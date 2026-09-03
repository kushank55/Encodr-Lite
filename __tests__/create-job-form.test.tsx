import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateJobForm } from "@/app/(app)/jobs/page";

const mutateAsync = vi.fn();

vi.mock("@/lib/client/hooks", () => ({
  useCreateJob: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

describe("CreateJobForm", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
  });

  it("shows an error for an invalid URL and does not call the API", async () => {
    const user = userEvent.setup();
    render(<CreateJobForm />);

    await user.type(screen.getByLabelText(/source url/i), "not a url");
    await user.click(screen.getByRole("button", { name: /create job/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
