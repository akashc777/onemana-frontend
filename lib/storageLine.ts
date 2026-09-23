/**
 * The one sentence about extra storage on a workspace card.
 *
 * The states are the backend's, stored as they are; this turns each into
 * what the customer should read: paid means "we are attaching it", attached
 * means it is done, ending means the add-on ran out and their files must fit
 * on the machine again. Nothing here is a promise: each is a fact about
 * where the add-on stands today.
 */
export function storageLine(state: string, gb: number, usedGB?: number): string {
  switch (state) {
    case "paid":
      return `${gb} GB of extra storage is paid for and being attached, usually within a day.`;
    case "attached":
      // usedGB is absent until the first daily reading.
      if (usedGB === undefined) return `${gb} GB of extra storage attached.`;
      if (usedGB > gb)
        return `${usedGB} GB used of ${gb} GB of extra storage, over its size. Nothing is cut off; make room with Remove for good (Admin, then Archive), or reply to our email for more.`;
      return `${usedGB} GB used of ${gb} GB of extra storage.`;
    case "ending":
      return `Your ${gb} GB of extra storage has ended. Your files need to fit on the machine again; we will tell you how much room that is.`;
  }
  return "";
}
