import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().cuid(),
        columnId: z.string().cuid().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string().datetime().optional(),
        priority: z.number().int().min(0).max(5).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description,
          projectId: input.projectId,
          columnId: input.columnId,
          createdById: ctx.session.user.id,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
          priority: input.priority,
        },
      });
      return task;
    }),

  assign: protectedProcedure
    .input(z.object({ taskId: z.string().cuid(), userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const assignment = await ctx.db.taskAssignee.upsert({
        where: { taskId_userId: { taskId: input.taskId, userId: input.userId } },
        update: {},
        create: { taskId: input.taskId, userId: input.userId },
      });
      return assignment;
    }),

  unassign: protectedProcedure
    .input(z.object({ taskId: z.string().cuid(), userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.taskAssignee.delete({
        where: { taskId_userId: { taskId: input.taskId, userId: input.userId } },
      });
      return { ok: true };
    }),

  move: protectedProcedure
    .input(
      z.object({
        taskId: z.string().cuid(),
        toColumnId: z.string().cuid().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.update({
        where: { id: input.taskId },
        data: { columnId: input.toColumnId ?? undefined },
      });
      return task;
    }),

  comment: protectedProcedure
    .input(
      z.object({
        taskId: z.string().cuid(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.comment.create({
        data: {
          taskId: input.taskId,
          userId: ctx.session.user.id,
          content: input.content,
        },
        include: { user: true },
      });
      return comment;
    }),
});