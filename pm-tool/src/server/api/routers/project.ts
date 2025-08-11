import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description,
          ownerId: ctx.session.user.id,
          members: {
            create: [
              {
                userId: ctx.session.user.id,
                role: "OWNER",
              },
            ],
          },
        },
      });
      return project;
    }),

  listMine: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const projects = await ctx.db.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return projects;
  }),

  addMemberByEmail: protectedProcedure
    .input(
      z.object({
        projectId: z.string().cuid(),
        email: z.string().email(),
        role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const member = await ctx.db.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: user.id,
          },
        },
        update: {
          role: input.role,
        },
        create: {
          projectId: input.projectId,
          userId: user.id,
          role: input.role,
        },
      });
      return member;
    }),

  getById: protectedProcedure
    .input(z.object({ projectId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        include: {
          members: { include: { user: true } },
          boards: {
            include: {
              columns: {
                orderBy: { order: "asc" },
                include: {
                  tasks: {
                    orderBy: { createdAt: "asc" },
                    include: {
                      assignees: { include: { user: true } },
                      comments: { include: { user: true } },
                    },
                  },
                },
              },
            },
          },
          tasks: true,
        },
      });
      return project;
    }),

  createBoard: protectedProcedure
    .input(
      z.object({
        projectId: z.string().cuid(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.db.board.create({
        data: {
          name: input.name,
          projectId: input.projectId,
        },
      });
      return board;
    }),

  createColumn: protectedProcedure
    .input(
      z.object({
        boardId: z.string().cuid(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.db.column.count({ where: { boardId: input.boardId } });
      const column = await ctx.db.column.create({
        data: {
          name: input.name,
          order: count,
          boardId: input.boardId,
        },
      });
      return column;
    }),
});