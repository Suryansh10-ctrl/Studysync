import { HydrateClient, api } from "~/trpc/server";

export default async function ProjectsPage() {
  const projects = await api.project.listMine();

  async function createProject(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "");
    const description = String(formData.get("description") ?? "");
    await api.project.create({ name, description });
  }

  return (
    <HydrateClient>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Your Projects</h1>
        <ul className="mb-8 space-y-2">
          {projects.map((p: { id: string; name: string }) => (
            <li key={p.id} className="rounded border border-white/20 p-3">
              <a href={`/projects/${p.id}`} className="underline">
                {p.name}
              </a>
            </li>
          ))}
        </ul>

        <form action={createProject} className="space-y-2">
          <input
            name="name"
            placeholder="Project name"
            className="w-full rounded border border-white/20 bg-transparent p-2"
            required
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            className="w-full rounded border border-white/20 bg-transparent p-2"
          />
          <button
            type="submit"
            className="rounded bg-white/10 px-4 py-2 hover:bg-white/20"
          >
            Create Project
          </button>
        </form>
      </div>
    </HydrateClient>
  );
}