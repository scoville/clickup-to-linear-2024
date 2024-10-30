import { z } from "zod";

import labelData from "./labels.json";
import { extractSprintNumber } from "./utils";
const allLabels = z
  .array(z.object({ label: z.string(), id: z.string() }))
  .parse(labelData);

const rawTicketSchema = z.object({
  archived: z.boolean(),
  name: z.string(),
  id: z.string(),
  custom_id: z.string(),
  text_content: z.string(),
  description: z.string(),
  status: z.object({
    status: z.string(),
  }),
  date_created: z.preprocess((val) => Number(val), z.coerce.date()),
  due_date: z.preprocess((val) => Number(val), z.coerce.date()),
  creator: z.object({
    email: z.string().email(),
  }),
  assignees: z.array(
    z.object({
      email: z.string().email(),
    })
  ),
  time_estimate: z.number().nullable(),
  url: z.string().url(),
  list: z.object({
    name: z.string(),
  }),
  custom_fields: z.array(
    z.object({
      name: z.string(),
      value: z
        .union([
          z.array(z.string()),
          z.string(),
          z.number(),
          z.array(z.object({ email: z.string().email() })),
        ])
        .optional(),
    })
  ),
});

export type RawTicket = z.infer<typeof rawTicketSchema>;

export const taskListResponseSchema = z.object({
  tasks: z.array(rawTicketSchema),
});

export type InputTicket = ReturnType<typeof parseRawTicket>;

export function parseRawTicket(rawTicket: RawTicket) {
  const { labels, priority, reviewers } = parseCustomFields(
    rawTicket.custom_fields
  );

  return {
    id: rawTicket.id,
    customId: rawTicket.custom_id,
    url: rawTicket.url,
    isArchived: rawTicket.archived,
    title: rawTicket.name,
    description: rawTicket.text_content,
    status: rawTicket.status.status,
    createdAt: rawTicket.date_created,
    dueDate: rawTicket.due_date,
    assignees: rawTicket.assignees.map((assignee) => assignee.email),
    createdBy: rawTicket.creator.email,
    estimate: parseEstimate(rawTicket.time_estimate),
    listName: extractSprintNumber(rawTicket.list.name), // either sprint number or backlog
    labels,
    priority,
    reviewers,
  };
}

function parseCustomFields(customFields: RawTicket["custom_fields"]) {
  const areaOfWorkIds = z
    .array(z.string())
    .parse(
      customFields.find((field) => field.name === "Area of Work")?.value || []
    );

  const labels = areaOfWorkIds.map(getLabelNameById);

  const priorityValue = customFields.find(
    (field) => field.name === "MoSCoW"
  )?.value;
  const priority =
    typeof priorityValue === "number" ? priorityValue : undefined;

  const reviewers = z
    .array(z.object({ email: z.string().email() }))
    .parse(
      customFields.find((field) => field.name === "Reviewer")?.value || []
    );
  const reviewersEmails = reviewers.map((reviewer) => reviewer.email);

  return {
    labels,
    priority,
    reviewers: reviewersEmails,
  };
}

function getLabelNameById(id: string) {
  const found = allLabels.find((label) => label.id === id);
  if (!found) {
    throw new Error(`Label with id ${id} not found`);
  }
  return found.label;
}

/** Estimate in hours */
function parseEstimate(ms?: number | null) {
  return ms ? Math.round(ms / 3600 / 1000) : undefined;
}