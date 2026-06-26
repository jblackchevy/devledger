import { z } from 'zod';
import { router, protectedProcedure } from '@/lib/trpc/init';
import { prisma } from '@/lib/prisma';
import { ProjectType } from '@prisma/client';

export const projectRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id!;

    const roles = await prisma.projectRole.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            fundingSources: true,
            _count: {
              select: { invoices: true, contracts: true },
            },
          },
        },
      },
    });

    return roles.map((r) => ({ ...r.project, role: r.role }));
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id!;

      const role = await prisma.projectRole.findFirst({
        where: { userId, projectId: input.id },
      });
      if (!role) throw new Error('Project not found or access denied');

      return prisma.project.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          fundingSources: true,
          budgetLines: {
            include: { sourceAllocations: true },
            orderBy: { lineNumber: 'asc' },
          },
          costCertification: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.nativeEnum(ProjectType),
        address: z.string().optional(),
        startDate: z.date().optional(),
        projectedCompletion: z.date().optional(),
        lihtcFlag: z.boolean().default(false),
        htcFlag: z.boolean().default(false),
        itcFlag: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id!;

      const project = await prisma.project.create({
        data: {
          ...input,
          projectRoles: {
            create: {
              userId,
              role: 'ADMIN',
            },
          },
        },
      });

      return project;
    }),
});
