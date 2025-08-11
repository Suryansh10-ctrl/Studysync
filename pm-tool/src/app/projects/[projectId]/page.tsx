import { HydrateClient, api } from "~/trpc/server";

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const project = await api.project.getById({ projectId: params.projectId });

  async function createBoard(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "");
    await api.project.createBoard({ projectId: params.projectId, name });
  }

  async function createTask(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "");
    const columnId = String(formData.get("columnId") ?? "");
    await api.task.create({ projectId: params.projectId, title, columnId });
  }

  return (
    <HydrateClient>
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-semibold">{project?.name}</h1>

        <div className="mb-8">
          <h2 className="mb-2 font-medium">Boards</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {project?.boards.map((b: { id: string; name: string; columns: Array<{ id: string; name: string; tasks: Array<{ id: string; title: string }> }> }) => (
              <div key={b.id} className="rounded border border-white/20 p-3">
                <h3 className="font-semibold">{b.name}</h3>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {b.columns.map((c: { id: string; name: string; tasks: Array<{ id: string; title: string }> }) => (
                    <div key={c.id} className="rounded bg-white/5 p-2">
                      <div className="mb-1 text-sm font-medium">{c.name}</div>
                      <ul className="space-y-1">
                        {c.tasks.map((t: { id: string; title: string }) => (
                          <li key={t.id} className="rounded bg-white/10 p-2 text-sm">
                            {t.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form action={createBoard} className="space-y-2 rounded border border-white/20 p-3">
            <div className="font-medium">Create Board</div>
            <input name="name" placeholder="Board name" className="w-full rounded border border-white/20 bg-transparent p-2" required />
            <button type="submit" className="rounded bg-white/10 px-4 py-2 hover:bg-white/20">Create</button>
          </form>

          <form action={createTask} className="space-y-2 rounded border border-white/20 p-3">
            <div className="font-medium">Create Task</div>
            <input name="title" placeholder="Task title" className="w-full rounded border border-white/20 bg-transparent p-2" required />
            <select name="columnId" className="w-full rounded border border-white/20 bg-transparent p-2">
              <option value="">No Column</option>
              {project?.boards.flatMap((b: { columns: Array<{ id: string; name: string }> }) => b.columns).map((c: { id: string; name: string }) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="rounded bg-white/10 px-4 py-2 hover:bg-white/20">Create</button>
          </form>
        </div>
      </div>
    </HydrateClient>
  );
}