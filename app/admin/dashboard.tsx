"use client";

import { FormEvent, useEffect, useState } from "react";

type Update = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  status: "draft" | "published";
  updatedAt: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  imageCaption: string | null;
};

type UpdateForm = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  status: "draft" | "published";
  imageUrl: string;
  imagePublicId: string;
  imageCaption: string;
};

const blank: UpdateForm = {
  id: "",
  title: "",
  slug: "",
  category: "Company update",
  summary: "",
  content: "",
  status: "draft",
  imageUrl: "",
  imagePublicId: "",
  imageCaption: "",
};

export default function AdminDashboard() {
  const [items, setItems] = useState<Update[]>([]);
  const [form, setForm] = useState<UpdateForm>(blank);
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  async function load() {
    const response = await fetch("/api/admin/updates", { cache: "no-store" });
    if (response.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not load updates.");
    setItems(data.updates);
  }

  useEffect(() => {
    load().catch(error => setMessage(error.message));
  }, []);

  function clearEditor() {
    setForm(blank);
    setPreviewUrl("");
    setMessage("");
  }

  function edit(item: Update) {
    setForm({
      id: item.id,
      title: item.title,
      slug: item.slug,
      category: item.category,
      summary: item.summary,
      content: item.content,
      status: item.status,
      imageUrl: item.imageUrl || "",
      imagePublicId: item.imagePublicId || "",
      imageCaption: item.imageCaption || "",
    });
    setPreviewUrl(item.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Image must be smaller than 10 MB.");
      return;
    }

    setUploading(true);
    setMessage("");

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const signatureResponse = await fetch("/api/admin/uploads/signature", {
        method: "POST",
      });

      const signatureData = await signatureResponse.json();

      if (!signatureResponse.ok) {
        throw new Error(signatureData.message || "Could not prepare image upload.");
      }

      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("api_key", signatureData.apiKey);
      uploadForm.append("timestamp", String(signatureData.timestamp));
      uploadForm.append("folder", signatureData.folder);
      uploadForm.append("signature", signatureData.signature);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadForm,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error?.message || "Cloudinary upload failed.");
      }

      setForm(current => ({
        ...current,
        imageUrl: uploadData.secure_url,
        imagePublicId: uploadData.public_id,
      }));

      setPreviewUrl(uploadData.secure_url);
      setMessage("Image uploaded successfully. Save the announcement to keep it.");
    } catch (error) {
      setPreviewUrl(form.imageUrl || "");
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setForm(current => ({
      ...current,
      imageUrl: "",
      imagePublicId: "",
      imageCaption: "",
    }));
    setPreviewUrl("");
    setMessage("Image removed from this announcement. Save your changes to confirm.");
  }

  async function save(
    event: FormEvent<HTMLFormElement>,
    status: "draft" | "published"
  ) {
    event.preventDefault();

    if (uploading) {
      setMessage("Please wait for the image upload to finish.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save update.");
      }

      clearEditor();
      await load();
      setMessage(status === "published" ? "Announcement published." : "Draft saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save update.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this announcement permanently?")) return;

    const response = await fetch("/api/admin/updates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not delete.");
      return;
    }

    if (form.id === id) clearEditor();

    await load();
    setMessage("Announcement deleted.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const visible = items.filter(
    item => filter === "all" || item.status === filter
  );

  return (
    <main className="admin-shell">
      <div className="admin-top">
        <a className="admin-brand" href="/">CLAUDVIA</a>
        <button className="admin-logout" onClick={logout}>Sign out</button>
      </div>

      <header className="admin-heading">
        <p className="eyebrow">PRIVATE WORKSPACE</p>
        <h1>Updates studio.</h1>
        <p className="admin-muted">Write, review and publish company announcements.</p>
      </header>

      <div className="admin-layout">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="eyebrow">{form.id ? "EDIT ANNOUNCEMENT" : "NEW ANNOUNCEMENT"}</p>
              <h2>{form.id ? "Edit update" : "Create update"}</h2>
            </div>
            <button className="admin-text-button" type="button" onClick={clearEditor}>
              Clear
            </button>
          </div>

          <form
            id="update-editor"
            className="admin-form"
            onSubmit={event => save(event, "draft")}
          >
            <label>
              Title
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                maxLength={140}
                required
              />
            </label>

            <label>
              URL slug
              <input
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                placeholder="Leave blank to generate from title"
                maxLength={120}
              />
            </label>

            <label>
              Category
              <input
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                maxLength={50}
                required
              />
            </label>

            <label>
              Short summary
              <textarea
                rows={2}
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
                maxLength={300}
                required
              />
            </label>

            <label>
              Announcement content
              <textarea
                rows={10}
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Write your announcement. Separate paragraphs with a blank line."
                required
              />
            </label>

            <p className="admin-hint">
              Plain text only. Separate paragraphs with a blank line. This keeps published content safe from injected HTML.
            </p>

            <div className="admin-image-field">
              <label htmlFor="announcement-image">Featured image (optional)</label>
              <input
                id="announcement-image"
                type="file"
                accept="image/*"
                disabled={uploading || busy}
                onChange={event => {
                  const file = event.target.files?.[0];
                  if (file) uploadImage(file);
                  event.target.value = "";
                }}
              />

              <p className="admin-hint">
                Choose an image from your phone. Maximum size: 10 MB.
              </p>

              {previewUrl && (
                <div className="admin-image-preview">
                  <img src={previewUrl} alt="Announcement image preview" />
                  <button
                    type="button"
                    className="admin-text-button"
                    onClick={removeImage}
                    disabled={uploading || busy}
                  >
                    Remove image
                  </button>
                </div>
              )}

              {uploading && <p className="admin-hint">Uploading image…</p>}

              <label>
                Image caption (optional)
                <input
                  value={form.imageCaption}
                  onChange={e => setForm({ ...form, imageCaption: e.target.value })}
                  maxLength={180}
                  placeholder="Write a short image caption"
                />
              </label>
            </div>

            <div className="admin-actions">
              <button
                className="button button--quiet"
                type="submit"
                disabled={busy || uploading}
              >
                {busy ? "Saving…" : "Save draft"}
              </button>

              <button
                className="button button--light"
                type="button"
                disabled={busy || uploading}
                onClick={() => {
                  const formElement = document.getElementById("update-editor") as HTMLFormElement | null;

                  if (formElement && formElement.reportValidity()) {
                    save(
                      { preventDefault() {} } as FormEvent<HTMLFormElement>,
                      "published"
                    );
                  }
                }}
              >
                Publish
              </button>
            </div>
          </form>

          <p className="admin-message" aria-live="polite">{message}</p>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="eyebrow">CONTENT LIBRARY</p>
              <h2>Announcements</h2>
            </div>
            <span className="admin-count">{items.length}</span>
          </div>

          <div className="admin-filters">
            {(["all", "draft", "published"] as const).map(value => (
              <button
                key={value}
                className={filter === value ? "is-active" : ""}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="admin-list">
            {visible.length ? visible.map(item => (
              <article className="admin-list-item" key={item.id}>
                <div>
                  <span className={`admin-status admin-status--${item.status}`}>
                    {item.status}
                  </span>
                  <h3>{item.title}</h3>
                  <p>/{item.slug}</p>
                </div>
                <div className="admin-item-actions">
                  <button onClick={() => edit(item)}>Edit</button>
                  <button onClick={() => remove(item.id)}>Delete</button>
                </div>
              </article>
            )) : (
              <p className="admin-empty">No announcements in this view yet.</p>
            )}
          </div>
        </section>
      </div>

      <p className="admin-footer">Claudvia · Built Beyond Limits.</p>
    </main>
  );
}
