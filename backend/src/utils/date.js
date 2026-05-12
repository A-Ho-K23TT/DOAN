export const getScholarshipDeadlineStatus = (deadline) => {
  if (!deadline) {
    return { deadlineStatus: "active", remainingDays: null, sortPriority: 2 };
  }

  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDate = new Date(`${deadline}T00:00:00`);
  const diffDays = Math.ceil((dueDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { deadlineStatus: "expired", remainingDays: 0, sortPriority: 3 };
  }

  if (diffDays <= 3) {
    return { deadlineStatus: "expiring", remainingDays: diffDays, sortPriority: 1 };
  }

  return { deadlineStatus: "active", remainingDays: diffDays, sortPriority: 2 };
};