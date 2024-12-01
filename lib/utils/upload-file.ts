import { toast } from "sonner";

import type { Attachment } from "ai";

export async function uploadFile(file: File): Promise<Attachment | undefined> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const { error } = await response.json();
      toast.error(error);
      throw error;
    }

    const data = await response.json();
    const { url, pathname, contentType } = data;

    return { url, name: pathname, contentType };
  } catch (error) {
    console.error("Failed to upload file:", error);
    toast.error("Failed to upload file, please try again!");
  }
}
